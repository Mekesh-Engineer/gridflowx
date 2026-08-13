/**
 * =================================================================================
 * GridflowX Tri-Source Microgrid Controller - Analytics & Communication ESP32 Firmware
 * =================================================================================
 * Target MCU:     ESP32-WROOM-32 / DevKit V1 (Core @ 240 MHz)
 * Document Ref:   hardware.md (v3.0)
 * Architecture:   Dual-MCU Analytics, Sensor Processing & IoT Communication Engine
 * Role:           Precision ADC sampling (Solar, Grid, Battery, ACS712 current),
 *                 1-Wire thermal fault detection (DS18B20), microgrid power priority
 *                 decision engine, and level-shifted UART protocol driver.
 * =================================================================================
 */

#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// =================================================================================
// 1. HARDWARE PIN DEFINITIONS (Matching hardware.md Section 5.2 Specification)
// =================================================================================

// Precision Analog Inputs (12-bit ADC1 Channels)
#define PIN_ADC_SOLAR         34  // ADC1_CH6: Solar PV Voltage Sense (100k/15k divider)
#define PIN_ADC_GRID          35  // ADC1_CH7: Grid AC Voltage Sense (100k/22k divider)
#define PIN_ADC_BATT          32  // ADC1_CH4: Battery DC Voltage Sense (13.3k/3.7k divider)
#define PIN_ADC_CURR          33  // ADC1_CH5: ACS712-20A Current Sensor Output

// 1-Wire Thermal Sensor Bus
#define PIN_ONEWIRE           15  // DS18B20 Data Bus (pulled up with R30 4.7k to 3.3V)

// Inter-MCU Hardware UART2 Pins (Level Shifted to 5V Mega 2560 UART1)
#define PIN_UART2_RX          16  // GPIO16: RX2 <- Level Shifter LV1 <- Mega Pin 18 (TX1)
#define PIN_UART2_TX          17  // GPIO17: TX2 -> Level Shifter LV2 -> Mega Pin 19 (RX1)

// =================================================================================
// 2. CONSTANTS, CALIBRATION RATIOS & SENSITIVITY FACTORS
// =================================================================================

// Voltage Divider Attenuation Multipliers (Resistor Ratio Calibration)
// Solar Divider  : R1=100k, R2=15k   -> Ratio = (100 + 15) / 15   = 7.6667
// Grid Divider   : R3=100k, R4=22k   -> Ratio = (100 + 22) / 22   = 5.5455
// Battery Divider: R5=13.3k, R6=3.7k -> Ratio = (13.3 + 3.7) / 3.7 = 4.5946
const float SOLAR_VOLTAGE_RATIO = (100.0f + 15.0f) / 15.0f;
const float GRID_VOLTAGE_RATIO  = (100.0f + 22.0f) / 22.0f;
const float BATT_VOLTAGE_RATIO  = (13.3f  + 3.7f)  / 3.7f;

// ADC Voltage Reference Calibration (ESP32 12-bit ADC: 0..4095 range, 3.30V VREF)
const float ADC_VREF            = 3.30f;
const float ADC_RESOLUTION      = 4095.0f;
const uint8_t ADC_SAMPLES_COUNT = 32; // Multi-sampling noise suppression count

// ACS712-20A Hall-Effect Current Sensor Calibration
const float ACS712_SENSITIVITY  = 0.100f; // 100 mV per Ampere (0.1 V/A)
const float ACS712_ZERO_OFFSET  = 1.650f; // VCC/2 offset at 3.3V supply

// Thermal & Electrical Safety Limits
const float MAX_SAFE_TEMP_C     = 65.0f;  // Maximum enclosure thermal cutoff threshold
const float SOLAR_MIN_VOLTS     = 14.0f;  // Minimum PV voltage threshold for active solar
const float BATT_FULL_VOLTS      = 12.2f;  // Normal operational battery voltage
const float BATT_MIN_VOLTS      = 11.5f;  // Low SoC threshold before load shedding
const float GRID_MIN_VOLTS      = 10.0f;  // AC grid presence threshold

// Protocol State Bitmask Flags
#define FLAG_THERMAL_ALARM      0x01  // Bit 0: Thermal cutoff triggered (>65°C)
#define FLAG_COMMS_DROPOUT      0x02  // Bit 1: Cloud/Network disconnection warning
#define FLAG_BATT_SOC_LOW       0x04  // Bit 2: Battery under-voltage warning (<11.5V)
#define FLAG_ESTOP_ACTIVE       0x08  // Bit 3: Remote/Hardware E-Stop active

// Power Source Selection State Enum
enum PowerSource {
  SRC_OFF = 0,
  SRC_SOLAR,
  SRC_BATT,
  SRC_GRID
};

// Priority Load Control Mask Strings
#define CMD_LOAD_FULL           "LOAD_FULL"
#define CMD_LOAD_OPTIMIZED      "LOAD_OPTIMIZED"
#define CMD_LOAD_CRITICAL       "LOAD_CRITICAL"
#define CMD_LOAD_SHED           "LOAD_SHED"

// =================================================================================
// 3. OBJECT INITIALIZATION & GLOBAL STATE VARIABLES
// =================================================================================

// 1-Wire & Dallas Temperature Drivers
OneWire oneWireBus(PIN_ONEWIRE);
DallasTemperature tempSensor(&oneWireBus);

// Hardware UART2 Instance for Inter-MCU Communication
HardwareSerial SerialMega(2);

// Filtered Engineering Unit Sensor Variables
float g_solarVoltage  = 0.0f;
float g_gridVoltage   = 0.0f;
float g_batteryVoltage= 0.0f;
float g_loadCurrent   = 0.0f;
float g_temperature   = 0.0f;
uint8_t g_stateFlags  = 0x00;

// Power Management State Engine
PowerSource g_targetSource      = SRC_OFF;
String      g_targetLoadMask    = CMD_LOAD_SHED;
PowerSource g_lastSentSource    = SRC_OFF;
String      g_lastSentLoadMask  = "";

// Timing Control
unsigned long g_lastSensorScan  = 0;
unsigned long g_lastTlmSend     = 0;
unsigned long g_lastCmdSend     = 0;
unsigned long g_lastConsoleLog  = 0;

// Forward Declarations
void readSensors();
void processPowerPriorityEngine();
void sendTelemetryFrame();
void sendCommandFrame(PowerSource src, const String& loadMask);
uint8_t calculateCRC8(const char* data, size_t len);
void parseMegaAck();
void printDiagnosticsConsole();

// =================================================================================
// 4. INITIALIZATION (setup)
// =================================================================================

void setup() {
  // Initialize USB Serial for PC Debugging Terminal
  Serial.begin(115200);
  delay(500);

  Serial.println(F("=================================================="));
  Serial.println(F("[ESP32] GridflowX Analytics & Comms Engine Booting"));
  Serial.println(F("=================================================="));

  // Initialize Hardware UART2 to ATmega2560
  SerialMega.begin(115200, SERIAL_8N1, PIN_UART2_RX, PIN_UART2_TX);

  // Configure ADC Input Resolution & Attenuation (0 - 3.3V Input Range)
  analogReadResolution(12); // 12-bit resolution (0..4095)
  analogSetPinAttenuation(PIN_ADC_SOLAR, ADC_11db);
  analogSetPinAttenuation(PIN_ADC_GRID,  ADC_11db);
  analogSetPinAttenuation(PIN_ADC_BATT,  ADC_11db);
  analogSetPinAttenuation(PIN_ADC_CURR,  ADC_11db);

  // Initialize DS18B20 1-Wire Temperature Sensor
  tempSensor.begin();
  tempSensor.setResolution(10); // 10-bit resolution (~0.25°C precision)
  tempSensor.requestTemperatures();

  Serial.println(F("[ESP32] Hardware & Sensor Interfaces Initialized. Synchronizing UART..."));
}

// =================================================================================
// 5. MAIN EXECUTION LOOP (loop)
// =================================================================================

void loop() {
  unsigned long currentMillis = millis();

  // -------------------------------------------------------------------------------
  // Step 1: Sensor Acquisition & Signal Filtering (50 Hz / 20ms)
  // -------------------------------------------------------------------------------
  if (currentMillis - g_lastSensorScan >= 20) {
    g_lastSensorScan = currentMillis;
    readSensors();
  }

  // -------------------------------------------------------------------------------
  // Step 2: Microgrid Power Priority & Thermal Safety Decision Engine
  // -------------------------------------------------------------------------------
  processPowerPriorityEngine();

  // -------------------------------------------------------------------------------
  // Step 3: Send Inter-MCU Telemetry Packet to Mega 2560 (5 Hz / 200ms)
  // -------------------------------------------------------------------------------
  if (currentMillis - g_lastTlmSend >= 200) {
    g_lastTlmSend = currentMillis;
    sendTelemetryFrame();
  }

  // -------------------------------------------------------------------------------
  // Step 4: Transmit Command Frame on State Change or Heartbeat (1 Hz / 1000ms)
  // -------------------------------------------------------------------------------
  if ((g_targetSource != g_lastSentSource) || 
      (g_targetLoadMask != g_lastSentLoadMask) || 
      (currentMillis - g_lastCmdSend >= 1000)) {
    g_lastCmdSend = currentMillis;
    sendCommandFrame(g_targetSource, g_targetLoadMask);
  }

  // -------------------------------------------------------------------------------
  // Step 5: Read Acknowledgment Packets from Mega 2560
  // -------------------------------------------------------------------------------
  if (SerialMega.available() > 0) {
    parseMegaAck();
  }

  // -------------------------------------------------------------------------------
  // Step 6: Print System Diagnostics to USB Debug Terminal (1 Hz / 1000ms)
  // -------------------------------------------------------------------------------
  if (currentMillis - g_lastConsoleLog >= 1000) {
    g_lastConsoleLog = currentMillis;
    printDiagnosticsConsole();
  }
}

// =================================================================================
// 6. SENSOR ACQUISITION & SIGNAL PROCESSING
// =================================================================================

/**
 * @brief Reads analog channels with multi-sampling averaging and converts raw ADC
 * values to actual calibrated voltage, current, and temperature units.
 */
void readSensors() {
  // 1. Multi-Sample Accumulation for ADC Noise Filtering
  uint32_t sumSolar = 0, sumGrid = 0, sumBatt = 0, sumCurr = 0;
  for (uint8_t i = 0; i < ADC_SAMPLES_COUNT; i++) {
    sumSolar += analogRead(PIN_ADC_SOLAR);
    sumGrid  += analogRead(PIN_ADC_GRID);
    sumBatt  += analogRead(PIN_ADC_BATT);
    sumCurr  += analogRead(PIN_ADC_CURR);
  }

  float rawSolar = (float)sumSolar / (float)ADC_SAMPLES_COUNT;
  float rawGrid  = (float)sumGrid  / (float)ADC_SAMPLES_COUNT;
  float rawBatt  = (float)sumBatt  / (float)ADC_SAMPLES_COUNT;
  float rawCurr  = (float)sumCurr  / (float)ADC_SAMPLES_COUNT;

  // 2. Convert Raw ADC to Pin Voltage (0.0V - 3.3V)
  float vPinSolar = (rawSolar / ADC_RESOLUTION) * ADC_VREF;
  float vPinGrid  = (rawGrid  / ADC_RESOLUTION) * ADC_VREF;
  float vPinBatt  = (rawBatt  / ADC_RESOLUTION) * ADC_VREF;
  float vPinCurr  = (rawCurr  / ADC_RESOLUTION) * ADC_VREF;

  // 3. Apply Resistor Divider Scaling Factors to Compute Real System Voltages
  // Exponential Moving Average (EMA) alpha=0.2 for smooth power telemetry
  float instSolar = vPinSolar * SOLAR_VOLTAGE_RATIO;
  float instGrid  = vPinGrid  * GRID_VOLTAGE_RATIO;
  float instBatt  = vPinBatt  * BATT_VOLTAGE_RATIO;

  g_solarVoltage   = (0.2f * instSolar) + (0.8f * g_solarVoltage);
  g_gridVoltage    = (0.2f * instGrid)  + (0.8f * g_gridVoltage);
  g_batteryVoltage = (0.2f * instBatt)  + (0.8f * g_batteryVoltage);

  // 4. ACS712 Hall-Effect Current Sensor Calculation
  float instCurrent = (vPinCurr - ACS712_ZERO_OFFSET) / ACS712_SENSITIVITY;
  if (instCurrent < 0.05f && instCurrent > -0.05f) instCurrent = 0.0f; // Noise floor clamp
  g_loadCurrent = (0.2f * fabsf(instCurrent)) + (0.8f * g_loadCurrent);

  // 5. Read DS18B20 Enclosure Temperature Sensor
  static unsigned long lastTempReq = 0;
  if (millis() - lastTempReq >= 750) { // Non-blocking conversion read interval
    lastTempReq = millis();
    float t = tempSensor.getTempCByIndex(0);
    if (t > -55.0f && t < 125.0f) { // Validate realistic sensor limits
      g_temperature = t;
    }
    tempSensor.requestTemperatures(); // Trigger next conversion
  }

  // 6. Update Fault Bitmask Flags
  if (g_temperature >= MAX_SAFE_TEMP_C) {
    g_stateFlags |= FLAG_THERMAL_ALARM;
  } else {
    g_stateFlags &= ~FLAG_THERMAL_ALARM;
  }

  if (g_batteryVoltage < BATT_MIN_VOLTS) {
    g_stateFlags |= FLAG_BATT_SOC_LOW;
  } else {
    g_stateFlags &= ~FLAG_BATT_SOC_LOW;
  }
}

// =================================================================================
// 7. POWER PRIORITY & DECISION ALGORITHM ENGINE
// =================================================================================

/**
 * @brief Evaluates tri-source power availability and thermal status to select
 * the optimal source (Solar -> Battery -> Grid) and load shedding mask.
 */
void processPowerPriorityEngine() {
  // Safety Trip 1: Thermal Cutoff (>65°C)
  if (g_stateFlags & FLAG_THERMAL_ALARM) {
    g_targetSource   = SRC_OFF;
    g_targetLoadMask = CMD_LOAD_SHED;
    return;
  }

  // Priority Tier 1: Solar PV DC Power
  if (g_solarVoltage >= SOLAR_MIN_VOLTS) {
    g_targetSource   = SRC_SOLAR;
    g_targetLoadMask = CMD_LOAD_FULL; // Solar capacity allows full load operation
    return;
  }

  // Priority Tier 2: Backup Battery DC Power
  if (g_batteryVoltage >= BATT_MIN_VOLTS) {
    g_targetSource = SRC_BATT;
    if (g_batteryVoltage >= BATT_FULL_VOLTS) {
      g_targetLoadMask = CMD_LOAD_FULL;
    } else {
      // Battery SoC Low: Perform optimized load shedding (Shed Low-Priority Load 3)
      g_targetLoadMask = CMD_LOAD_OPTIMIZED;
    }
    return;
  }

  // Priority Tier 3: Utility Grid AC Power
  if (g_gridVoltage >= GRID_MIN_VOLTS) {
    g_targetSource   = SRC_GRID;
    g_targetLoadMask = CMD_LOAD_FULL;
    return;
  }

  // Default Under-Voltage Fallback: All Sources Depleted / Below Thresholds
  g_targetSource   = SRC_OFF;
  g_targetLoadMask = CMD_LOAD_SHED;
}

// =================================================================================
// 8. INTER-MCU UART COMMUNICATION & CRC8 PROTOCOL
// =================================================================================

/**
 * @brief Computes 8-bit CRC over text payload.
 */
uint8_t calculateCRC8(const char* data, size_t len) {
  uint8_t crc = 0x00;
  for (size_t i = 0; i < len; i++) {
    uint8_t extract = data[i];
    for (uint8_t tempI = 8; tempI; tempI--) {
      uint8_t sum = (crc ^ extract) & 0x01;
      crc >>= 1;
      if (sum) {
        crc ^= 0x8C;
      }
      extract >>= 1;
    }
  }
  return crc;
}

/**
 * @brief Formats and transmits telemetry frame (TLM) over Hardware UART2.
 * Format: TLM,<SOLAR_V>,<GRID_V>,<BATT_V>,<LOAD_I>,<TEMP_C>,<FLAGS>*<CRC8>\n
 */
void sendTelemetryFrame() {
  char flagsHex[5];
  sprintf(flagsHex, "0x%02X", g_stateFlags);

  String payload = "TLM," + 
                   String(g_solarVoltage, 1) + "," + 
                   String(g_gridVoltage, 1) + "," + 
                   String(g_batteryVoltage, 1) + "," + 
                   String(g_loadCurrent, 1) + "," + 
                   String(g_temperature, 1) + "," + 
                   String(flagsHex);

  uint8_t crc = calculateCRC8(payload.c_str(), payload.length());
  char crcHex[3];
  sprintf(crcHex, "%02X", crc);

  String packet = payload + "*" + String(crcHex) + "\n";
  SerialMega.print(packet);
}

/**
 * @brief Formats and transmits source command frame (CMD) over Hardware UART2.
 * Format: CMD,<SRC_SEL>,<LOAD_MASK>*<CRC8>\n
 */
void sendCommandFrame(PowerSource src, const String& loadMask) {
  String srcStr = "SRC_OFF";
  if (src == SRC_SOLAR)     srcStr = "SRC_SOLAR";
  else if (src == SRC_BATT) srcStr = "SRC_BATT";
  else if (src == SRC_GRID) srcStr = "SRC_GRID";

  String payload = "CMD," + srcStr + "," + loadMask;
  uint8_t crc = calculateCRC8(payload.c_str(), payload.length());

  char crcHex[3];
  sprintf(crcHex, "%02X", crc);

  String packet = payload + "*" + String(crcHex) + "\n";
  SerialMega.print(packet);

  g_lastSentSource   = src;
  g_lastSentLoadMask = loadMask;
}

/**
 * @brief Parses ACK packets returned by ATmega2560 controller.
 */
void parseMegaAck() {
  static String rxAck = "";
  while (SerialMega.available() > 0) {
    char c = (char)SerialMega.read();
    if (c == '\n' || c == '\r') {
      if (rxAck.length() > 0 && rxAck.startsWith("ACK,")) {
        // Telemetry acknowledged by Mega
      }
      rxAck = "";
    } else {
      if (rxAck.length() < 64) rxAck += c;
      else rxAck = "";
    }
  }
}

// =================================================================================
// 9. SERIAL DIAGNOSTICS & SYSTEM MONITORING
// =================================================================================

/**
 * @brief Prints formatted system telemetry log to USB Serial console.
 */
void printDiagnosticsConsole() {
  Serial.println(F("--------------------------------------------------"));
  Serial.print(F("[ESP32 ANALYTICS] Solar: "));
  Serial.print(g_solarVoltage, 2);
  Serial.print(F(" V | Grid: "));
  Serial.print(g_gridVoltage, 2);
  Serial.print(F(" V | Batt: "));
  Serial.print(g_batteryVoltage, 2);
  Serial.println(F(" V"));

  Serial.print(F("[ESP32 ANALYTICS] Load Current: "));
  Serial.print(g_loadCurrent, 2);
  Serial.print(F(" A | Temp: "));
  Serial.print(g_temperature, 1);
  Serial.println(F(" °C"));

  Serial.print(F("[ESP32 ENGINE]    Target Source: "));
  if (g_targetSource == SRC_SOLAR)      Serial.print(F("SOLAR (PV)"));
  else if (g_targetSource == SRC_BATT)  Serial.print(F("BATTERY (DC)"));
  else if (g_targetSource == SRC_GRID)  Serial.print(F("GRID (AC)"));
  else                                  Serial.print(F("OFF (SHED)"));

  Serial.print(F(" | Load Mask: "));
  Serial.println(g_targetLoadMask);

  if (g_stateFlags != 0) {
    Serial.print(F("[ESP32 WARNING]   Active Flags: "));
    if (g_stateFlags & FLAG_THERMAL_ALARM) Serial.print(F("[THERMAL ALARM] "));
    if (g_stateFlags & FLAG_BATT_SOC_LOW)  Serial.print(F("[BATT LOW SOC] "));
    Serial.println();
  }
}
