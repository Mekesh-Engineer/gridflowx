/**
 * =================================================================================
 * GridflowX Tri-Source Microgrid Controller - Standalone ATmega2560 Firmware
 * =================================================================================
 * Target MCU:     Arduino Mega 2560 (ATmega2560 @ 16 MHz)
 * Document Ref:   hardware.md (v4.0 Single-MCU Design)
 * Architecture:   Fully Autonomous Standalone Microgrid Controller
 * Functionality:  • Direct 1-Click Push-Button Source Selection (Solar, Battery, Grid, Auto, Off)
 *                 • Direct 1-Click Independent Load Switching (High L2, Normal L3, Low L1)
 *                 • Break-Before-Make Dead-Time Source Protection (60ms)
 *                 • Hardware Interrupt E-Stop Safety Interlock (INT2 / Pin 19)
 *                 • 16x2 Parallel Character LCD (LM016L) Multi-Telemetry Display
 *                 • DS18B20 Enclosure Thermal Cutoff (65°C)
 *                 • Tri-Source Voltage & Current Telemetry with EMA Filtering
 *                 • 8-Channel Status LED Diagnostics Bus
 * =================================================================================
 */

#include <LiquidCrystal.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// =================================================================================
// 1. PIN DEFINITIONS & HARDWARE MAPPING (Matching Proteus Circuit Schematic)
// =================================================================================

// 16x2 Parallel Character LCD Interface (LM016L on Port A: PA0..PA5 / Pins 78..73)
#define PIN_LCD_RS            22  // PA0 (Pin 78) -> LM016L Pin 4 (RS: Register Select)
#define PIN_LCD_E             23  // PA1 (Pin 77) -> LM016L Pin 6 (E: Enable Strobe)
#define PIN_LCD_D4            24  // PA2 (Pin 76) -> LM016L Pin 11 (D4 Data Bit 4)
#define PIN_LCD_D5            25  // PA3 (Pin 75) -> LM016L Pin 12 (D5 Data Bit 5)
#define PIN_LCD_D6            26  // PA4 (Pin 74) -> LM016L Pin 13 (D6 Data Bit 6)
#define PIN_LCD_D7            27  // PA5 (Pin 73) -> LM016L Pin 14 (D7 Data Bit 7)

// DS18B20 1-Wire Temperature Sensor Bus
#define PIN_DS18B20           41  // D41 (PL6) - 4.7kΩ pull-up to +5V

// Analog Voltage Measurement Inputs (10-bit ADC: 30k/10k Dividers -> Ratio = 4.0)
#define PIN_ADC_SOLAR_V       A0  // A0 (PF0) - Solar PV Voltage Sense (VM1)
#define PIN_ADC_BATT_V        A1  // A1 (PF1) - Battery DC Voltage Sense (VM2)
#define PIN_ADC_GRID_V        A2  // A2 (PF2) - Grid AC Rectified Voltage Sense (VM3)

// Analog Current Measurement Inputs (10-bit ADC: ACS712-20A Sensors / Analytical)
#define PIN_ADC_SOLAR_I       A3  // A3 (PF3) - Solar Current Sense
#define PIN_ADC_BATT_I        A4  // A4 (PF4) - Battery Current Sense
#define PIN_ADC_GRID_I        A5  // A5 (PF5) - Grid Current Sense

// User HMI Push Buttons (Active LOW with Internal Pull-ups)
#define PIN_BTN_SRC           28  // D28 (PG4) - Direct 1-Click Source Cycle: SOLAR -> BATT -> GRID -> AUTO -> OFF
#define PIN_BTN_LOAD_HIGH     29  // D29 (PG5) - Direct 1-Click Toggle: Tier 1 High-Priority Load (L2 / RL4)
#define PIN_BTN_LOAD_NORM     45  // D45 (PL4) - Direct 1-Click Toggle: Tier 2 Normal-Priority Load (L3 / RL5)
#define PIN_BTN_LOAD_LOW      44  // D44 (PL5) - Direct 1-Click Toggle: Tier 3 Low-Priority Load (L1 / RL6)
#define PIN_BTN_VIEW          42  // D42 (PL7) - Cycle LCD Telemetry Views (Dashboard -> Solar/Batt -> Grid/Temp)
#define PIN_BTN_ESTOP         19  // D19 (PD2 / INT2) - Dedicated Hardware Emergency Stop

// Relay Driver Control Pins (ULN2803 Darlington Driver Stage on Port C: PC0..PC5 / Pins 53..58)
#define PIN_RELAY_GRID        37  // PC0 (Pin 53) -> ULN2803 1B -> 1C -> RL1 (Grid AC Relay)
#define PIN_RELAY_BATT        36  // PC1 (Pin 54) -> ULN2803 2B -> 2C -> RL2 (Battery DC Relay)
#define PIN_RELAY_SOLAR       35  // PC2 (Pin 55) -> ULN2803 3B -> 3C -> RL3 (Solar PV Relay)
#define PIN_RELAY_LOAD_HIGH   34  // PC3 (Pin 56) -> ULN2803 4B -> 4C -> RL4 (Tier 1 Critical Load L2)
#define PIN_RELAY_LOAD_NORMAL 33  // PC4 (Pin 57) -> ULN2803 5B -> 5C -> RL5 (Tier 2 Normal Load L3)
#define PIN_RELAY_LOAD_LOW    32  // PC5 (Pin 58) -> ULN2803 6B -> 6C -> RL6 (Tier 3 Low Priority Load L1)

// System Status Indicator LEDs (Port B & Outputs)
#define PIN_LED_GRID          53  // D53 (PB0 - Aqua): Grid Source Active
#define PIN_LED_HEARTBEAT     52  // D52 (PB1 - Blue): System Pulse (1Hz Blink)
#define PIN_LED_SOLAR         51  // D51 (PB2 - Green): Solar Source Active
#define PIN_LED_BATT          50  // D50 (PB3 - Orange): Battery Source Active
#define PIN_LED_LOAD_STATUS   10  // D10 (PB4 - Pink): Load Bus Energized
#define PIN_LED_RELAY_ACT     11  // D11 (PB5 - Purple): Any Relay Energized Indicator
#define PIN_LED_FAULT         12  // D12 (PB6 - Red): System Fault / E-Stop Lockout
#define PIN_LED_CHARGING      13  // D13 (PB7 - White): Battery Charging Status

// =================================================================================
// 2. CONSTANTS & SYSTEM CALIBRATIONS
// =================================================================================

// Voltage Divider Attenuation Multiplier (30kΩ / 10kΩ divider -> Ratio = (30+10)/10 = 4.0)
const float VOLTAGE_DIV_RATIO  = (30.0f + 10.0f) / 10.0f; // 4.0
const float ADC_VREF           = 5.00f;   // 5.0V ATmega2560 Analog Reference
const float ADC_RESOLUTION     = 1023.0f; // 10-bit ADC (0..1023)
const uint8_t ADC_SAMPLES_CNT  = 16;      // Multi-sample noise reduction filter count

// ACS712-20A Hall-Effect Current Sensor Calibration
const float ACS712_SENSITIVITY = 0.100f; // 100 mV per Ampere (0.1 V/A)
const float ACS712_ZERO_OFFSET = 2.500f; // 2.5V center offset at 5V supply

// System Operational & Safety Thresholds
const float SOLAR_MIN_VOLTS    = 14.0f; // Minimum Solar PV voltage to engage
const float BATT_FULL_VOLTS    = 12.2f; // Full operational battery voltage
const float BATT_MIN_VOLTS     = 11.5f; // Low SoC cutoff threshold for load shedding
const float GRID_MIN_VOLTS     = 10.0f; // Minimum rectified Grid AC presence threshold
const float MAX_SAFE_TEMP_C    = 65.0f; // Enclosure thermal trip cutoff temperature

// Safety & Timing Parameters
#define DEBOUNCE_DELAY_MS      50   // Button debounce time in milliseconds
#define BREAK_BEFORE_MAKE_MS   60   // Dead-time between source relay switching
#define NUM_NAV_BUTTONS        5    // Interactive push buttons (Source, L_High, L_Norm, L_Low, View)

// Priority Load Bitmask Constants
#define LOAD_MASK_NONE         0x00 // All load branches shed (000b)
#define LOAD_MASK_CRITICAL     0x01 // Bit 0: High Priority Load (RL4 / L2) ON
#define LOAD_MASK_NORMAL       0x02 // Bit 1: Normal Priority Load (RL5 / L3) ON
#define LOAD_MASK_LOW          0x04 // Bit 2: Low Priority Load (RL6 / L1) ON
#define LOAD_MASK_OPTIMIZED    (LOAD_MASK_CRITICAL | LOAD_MASK_NORMAL) // (011b)
#define LOAD_MASK_FULL         (LOAD_MASK_CRITICAL | LOAD_MASK_NORMAL | LOAD_MASK_LOW) // (111b)

// System Operating State Enum
enum SystemState {
  STATE_AUTO = 0,   // Autonomous multi-tier priority algorithm
  STATE_MANUAL,     // User-driven direct button control for sources and loads
  STATE_FAULT,      // Thermal overload (Temp >= 65°C)
  STATE_ESTOP       // Hardware emergency button latched
};

// Power Source Selection Enum
enum PowerSource {
  SRC_OFF = 0,      // All sources isolated
  SRC_SOLAR,        // Solar PV active (RL3)
  SRC_BATT,         // Battery storage active (RL2)
  SRC_GRID          // Utility Grid AC active (RL1)
};

// Push Button Debounce Structure
struct DebouncedButton {
  uint8_t       pin;
  bool          lastReading;
  bool          stableState;
  unsigned long lastDebounceTime;
};

// =================================================================================
// 3. GLOBAL OBJECTS & STATE VARIABLES
// =================================================================================

// 16x2 Parallel Character LCD Object (4-Bit Mode: RS, E, D4, D5, D6, D7)
LiquidCrystal lcd(PIN_LCD_RS, PIN_LCD_E, PIN_LCD_D4, PIN_LCD_D5, PIN_LCD_D6, PIN_LCD_D7);

// OneWire & Dallas Temperature Drivers
OneWire oneWireBus(PIN_DS18B20);
DallasTemperature tempSensor(&oneWireBus);

// Volatile Flag for Hardware Interrupt Service Routine
volatile bool g_estopTriggered = false;

// System Core State Variables
SystemState g_systemState       = STATE_MANUAL;    // Default: Manual mode for immediate button response
PowerSource g_activeSource      = SRC_OFF;         // Default: Relays start safely isolated
uint8_t     g_activeLoadMask    = LOAD_MASK_NONE;  // Default: Loads start off until switched

// Sensor Measured Telemetry Variables
float g_solarVoltage     = 0.0f;
float g_batteryVoltage   = 0.0f;
float g_gridVoltage      = 0.0f;
float g_solarCurrent     = 0.0f;
float g_batteryCurrent   = 0.0f;
float g_gridCurrent      = 0.0f;
float g_totalLoadCurrent = 0.0f;
float g_temperature      = 25.0f;

// LCD View Page (0: Dashboard, 1: Solar & Battery Telemetry, 2: Grid & Environmental Telemetry)
uint8_t g_lcdViewPage = 0;

// Hardware Push Buttons Array
DebouncedButton g_buttons[NUM_NAV_BUTTONS] = {
  { PIN_BTN_SRC,       HIGH, HIGH, 0 },
  { PIN_BTN_LOAD_HIGH, HIGH, HIGH, 0 },
  { PIN_BTN_LOAD_NORM, HIGH, HIGH, 0 },
  { PIN_BTN_LOAD_LOW,  HIGH, HIGH, 0 },
  { PIN_BTN_VIEW,      HIGH, HIGH, 0 }
};

// Timing Control Counters
unsigned long g_lastSensorScan  = 0;
unsigned long g_lastLcdUpdate   = 0;
unsigned long g_lastHeartbeat   = 0;
unsigned long g_lastConsoleLog  = 0;
bool          g_heartbeatState  = false;
bool          g_faultLedBlink   = false;

// Forward Declarations
void readSensors();
void processPowerPriorityEngine();
void setPowerSource(PowerSource newSource);
void setLoadRelays(uint8_t loadMask);
void toggleLoad(uint8_t loadBit);
void cyclePowerSource();
void updateButtons();
void handleButtonPress(uint8_t btnIndex);
void updateLCD();
void updateLEDs();
void printDiagnosticsConsole();

// =================================================================================
// 4. HARDWARE INTERRUPT SERVICE ROUTINE (EMERGENCY STOP)
// =================================================================================

/**
 * @brief Dedicated Hardware ISR triggered by E-Stop button on Pin 19 (INT2).
 * Operates in microsecond domain (<10µs) to immediately de-energize all relays.
 * Prevents any normal button commands from re-energizing relays during lockout.
 */
void ISR_emergencyStop() {
  // 1. Cut off all source and load relay coils instantly via ULN2803 driver
  digitalWrite(PIN_RELAY_SOLAR,       LOW);
  digitalWrite(PIN_RELAY_BATT,        LOW);
  digitalWrite(PIN_RELAY_GRID,        LOW);
  digitalWrite(PIN_RELAY_LOAD_HIGH,   LOW);
  digitalWrite(PIN_RELAY_LOAD_NORMAL, LOW);
  digitalWrite(PIN_RELAY_LOAD_LOW,    LOW);

  // 2. Extinguish all normal operating indicator LEDs
  digitalWrite(PIN_LED_SOLAR,       LOW);
  digitalWrite(PIN_LED_BATT,        LOW);
  digitalWrite(PIN_LED_GRID,        LOW);
  digitalWrite(PIN_LED_CHARGING,    LOW);
  digitalWrite(PIN_LED_LOAD_STATUS, LOW);
  digitalWrite(PIN_LED_RELAY_ACT,   LOW);

  // 3. Latch Red Fault LED HIGH and set atomic lockout flag
  digitalWrite(PIN_LED_FAULT, HIGH);
  g_estopTriggered = true;
}

// =================================================================================
// 5. SYSTEM INITIALIZATION (setup)
// =================================================================================

void setup() {
  // Initialize Hardware USB Serial for PC Diagnostics Console
  Serial.begin(115200);
  Serial.println(F("=================================================="));
  Serial.println(F("[ATmega2560] GridflowX Microgrid Controller Booting"));
  Serial.println(F("[ATmega2560] Simplified 1-Click Push-Button Control"));
  Serial.println(F("=================================================="));

  // Configure Relay Control Pins as Digital Outputs
  pinMode(PIN_RELAY_SOLAR,       OUTPUT);
  pinMode(PIN_RELAY_BATT,        OUTPUT);
  pinMode(PIN_RELAY_GRID,        OUTPUT);
  pinMode(PIN_RELAY_LOAD_HIGH,   OUTPUT);
  pinMode(PIN_RELAY_LOAD_NORMAL, OUTPUT);
  pinMode(PIN_RELAY_LOAD_LOW,    OUTPUT);

  // Safe Default State: All Relays De-energized (LOW)
  digitalWrite(PIN_RELAY_SOLAR,       LOW);
  digitalWrite(PIN_RELAY_BATT,        LOW);
  digitalWrite(PIN_RELAY_GRID,        LOW);
  digitalWrite(PIN_RELAY_LOAD_HIGH,   LOW);
  digitalWrite(PIN_RELAY_LOAD_NORMAL, LOW);
  digitalWrite(PIN_RELAY_LOAD_LOW,    LOW);

  // Configure Status LED Pins as Digital Outputs
  pinMode(PIN_LED_HEARTBEAT,   OUTPUT);
  pinMode(PIN_LED_SOLAR,       OUTPUT);
  pinMode(PIN_LED_BATT,        OUTPUT);
  pinMode(PIN_LED_GRID,        OUTPUT);
  pinMode(PIN_LED_LOAD_STATUS, OUTPUT);
  pinMode(PIN_LED_CHARGING,    OUTPUT);
  pinMode(PIN_LED_FAULT,       OUTPUT);
  pinMode(PIN_LED_RELAY_ACT,   OUTPUT);

  // Optical Self-Test Flash on All LEDs (300ms)
  digitalWrite(PIN_LED_HEARTBEAT,   HIGH);
  digitalWrite(PIN_LED_SOLAR,       HIGH);
  digitalWrite(PIN_LED_BATT,        HIGH);
  digitalWrite(PIN_LED_GRID,        HIGH);
  digitalWrite(PIN_LED_LOAD_STATUS, HIGH);
  digitalWrite(PIN_LED_CHARGING,    HIGH);
  digitalWrite(PIN_LED_FAULT,       HIGH);
  digitalWrite(PIN_LED_RELAY_ACT,   HIGH);
  delay(300);
  digitalWrite(PIN_LED_HEARTBEAT,   LOW);
  digitalWrite(PIN_LED_SOLAR,       LOW);
  digitalWrite(PIN_LED_BATT,        LOW);
  digitalWrite(PIN_LED_GRID,        LOW);
  digitalWrite(PIN_LED_LOAD_STATUS, LOW);
  digitalWrite(PIN_LED_CHARGING,    LOW);
  digitalWrite(PIN_LED_FAULT,       LOW);
  digitalWrite(PIN_LED_RELAY_ACT,   LOW);

  // Configure Navigation Push Buttons with Internal Pull-Ups
  for (uint8_t i = 0; i < NUM_NAV_BUTTONS; i++) {
    pinMode(g_buttons[i].pin, INPUT_PULLUP);
    g_buttons[i].lastReading        = digitalRead(g_buttons[i].pin);
    g_buttons[i].stableState        = g_buttons[i].lastReading;
    g_buttons[i].lastDebounceTime   = 0;
  }

  // Configure Emergency Stop Hardware Interrupt (Pin 19 / INT2)
  pinMode(PIN_BTN_ESTOP, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_BTN_ESTOP), ISR_emergencyStop, FALLING);

  // Initialize DS18B20 Temperature Sensor
  tempSensor.begin();
  tempSensor.setResolution(10);
  tempSensor.requestTemperatures();

  // Initialize 16x2 Parallel Character LCD (LM016L)
  lcd.begin(16, 2);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("GRIDFLOWX V4.0  "));
  lcd.setCursor(0, 1);
  lcd.print(F("SYSTEM READY    "));
  delay(1000);

  Serial.println(F("[ATmega2560] Peripherals & Interrupts Initialized. Ready."));
}

// =================================================================================
// 6. MAIN EXECUTION LOOP (loop)
// =================================================================================

void loop() {
  unsigned long currentMillis = millis();

  // -------------------------------------------------------------------------------
  // Step 1: Emergency Stop Override Check (Total Lockout)
  // -------------------------------------------------------------------------------
  if (g_estopTriggered) {
    g_systemState    = STATE_ESTOP;
    g_activeSource   = SRC_OFF;
    g_activeLoadMask = LOAD_MASK_NONE;

    // Display Emergency Lockout Message on LCD
    if (currentMillis - g_lastLcdUpdate >= 250) {
      g_lastLcdUpdate = currentMillis;
      lcd.setCursor(0, 0);
      lcd.print(F("*** E-STOP ***  "));
      lcd.setCursor(0, 1);
      lcd.print(F("SYSTEM LOCKED OUT"));
    }

    // Flash Red Fault LED Rapidly (6.6 Hz)
    if (currentMillis - g_lastHeartbeat >= 150) {
      g_lastHeartbeat = currentMillis;
      g_faultLedBlink = !g_faultLedBlink;
      digitalWrite(PIN_LED_FAULT, g_faultLedBlink ? HIGH : LOW);
    }
    return; // Block all further execution and button processing
  }

  // -------------------------------------------------------------------------------
  // Step 2: Read & Filter Analog Voltage and Temperature Sensors (20 Hz)
  // -------------------------------------------------------------------------------
  if (currentMillis - g_lastSensorScan >= 50) {
    g_lastSensorScan = currentMillis;
    readSensors();
  }

  // -------------------------------------------------------------------------------
  // Step 3: Execute Power Priority Engine (Auto Mode Only)
  // -------------------------------------------------------------------------------
  if (g_systemState == STATE_AUTO) {
    processPowerPriorityEngine();
  }

  // -------------------------------------------------------------------------------
  // Step 4: Handle Direct 1-Click Push Buttons
  // -------------------------------------------------------------------------------
  updateButtons();

  // -------------------------------------------------------------------------------
  // Step 5: Update LCD Display Interface (3.3 Hz)
  // -------------------------------------------------------------------------------
  if (currentMillis - g_lastLcdUpdate >= 300) {
    g_lastLcdUpdate = currentMillis;
    updateLCD();
  }

  // -------------------------------------------------------------------------------
  // Step 6: Update Status Indicator LEDs & Heartbeat Pulse
  // -------------------------------------------------------------------------------
  updateLEDs();

  // -------------------------------------------------------------------------------
  // Step 7: Output Diagnostics to Serial Console (1 Hz)
  // -------------------------------------------------------------------------------
  if (currentMillis - g_lastConsoleLog >= 1000) {
    g_lastConsoleLog = currentMillis;
    printDiagnosticsConsole();
  }
}

// =================================================================================
// 7. SENSOR ACQUISITION & SIGNAL FILTERING
// =================================================================================

/**
 * @brief Reads analog channels A0-A2 with 16-sample accumulation averaging and
 * converts raw ADC inputs into physical Voltage (V) with Exponential Moving Average.
 */
void readSensors() {
  // 1. Multi-Sample Accumulation for Noise Rejection
  uint32_t sumSolV = 0, sumBattV = 0, sumGridV = 0;

  for (uint8_t i = 0; i < ADC_SAMPLES_CNT; i++) {
    sumSolV  += analogRead(PIN_ADC_SOLAR_V);
    sumBattV += analogRead(PIN_ADC_BATT_V);
    sumGridV += analogRead(PIN_ADC_GRID_V);
  }

  float avgSolV  = (float)sumSolV  / (float)ADC_SAMPLES_CNT;
  float avgBattV = (float)sumBattV / (float)ADC_SAMPLES_CNT;
  float avgGridV = (float)sumGridV / (float)ADC_SAMPLES_CNT;

  // 2. Convert Raw ADC to Pin Voltage (0.0V - 5.0V)
  float vPinSol  = (avgSolV  / ADC_RESOLUTION) * ADC_VREF;
  float vPinBatt = (avgBattV / ADC_RESOLUTION) * ADC_VREF;
  float vPinGrid = (avgGridV / ADC_RESOLUTION) * ADC_VREF;

  // 3. Apply Resistor Divider Attenuation Multiplier (Ratio = 4.0)
  float instSolV  = vPinSol  * VOLTAGE_DIV_RATIO;
  float instBattV = vPinBatt * VOLTAGE_DIV_RATIO;
  float instGridV = vPinGrid * VOLTAGE_DIV_RATIO;

  // 4. Exponential Moving Average (EMA alpha=0.35 for responsive tracking)
  g_solarVoltage   = (0.35f * instSolV)  + (0.65f * g_solarVoltage);
  g_batteryVoltage = (0.35f * instBattV) + (0.65f * g_batteryVoltage);
  g_gridVoltage    = (0.35f * instGridV) + (0.65f * g_gridVoltage);

  // 5. Total Load Current Calculation based on active loads and active bus voltage
  float activeWatts = 0.0f;
  if (g_activeLoadMask & LOAD_MASK_CRITICAL) activeWatts += 15.0f; // L2: 15W High Load
  if (g_activeLoadMask & LOAD_MASK_NORMAL)   activeWatts += 25.0f; // L3: 25W Normal Load
  if (g_activeLoadMask & LOAD_MASK_LOW)      activeWatts += 40.0f; // L1: 40W Low Load

  float busVoltage = (g_activeSource == SRC_SOLAR) ? g_solarVoltage :
                     (g_activeSource == SRC_BATT)  ? g_batteryVoltage :
                     (g_activeSource == SRC_GRID)  ? g_gridVoltage : 0.0f;

  if (busVoltage > 3.0f && g_activeSource != SRC_OFF) {
    g_totalLoadCurrent = activeWatts / busVoltage;
  } else {
    g_totalLoadCurrent = 0.0f;
  }

  // 6. Non-Blocking Read of DS18B20 Enclosure Temperature Sensor
  static unsigned long lastTempRead = 0;
  if (millis() - lastTempRead >= 800) {
    lastTempRead = millis();
    float tempC = tempSensor.getTempCByIndex(0);
    if (tempC > -55.0f && tempC < 125.0f) {
      g_temperature = tempC;
    }
    tempSensor.requestTemperatures();
  }

  // 7. Check Thermal Cutoff Safety Limit
  if (g_temperature >= MAX_SAFE_TEMP_C && g_systemState != STATE_ESTOP) {
    g_systemState = STATE_FAULT;
    setPowerSource(SRC_OFF);
    setLoadRelays(LOAD_MASK_NONE);
  } else if (g_systemState == STATE_FAULT && g_temperature < (MAX_SAFE_TEMP_C - 5.0f)) {
    g_systemState = STATE_MANUAL; // Return to safe manual mode upon cooling
  }
}

// =================================================================================
// 8. POWER PRIORITY & SOURCE/LOAD SWITCHING ENGINE
// =================================================================================

/**
 * @brief Automatic power routing decision engine (Active only in STATE_AUTO).
 * Priority: Solar PV (1) -> Backup Battery (2) -> Utility Grid (3)
 */
void processPowerPriorityEngine() {
  if (g_systemState != STATE_AUTO || g_estopTriggered) return;

  // Priority 1: Solar PV DC Power
  if (g_solarVoltage >= SOLAR_MIN_VOLTS) {
    setPowerSource(SRC_SOLAR);
    setLoadRelays(LOAD_MASK_FULL);
    return;
  }

  // Priority 2: Backup Battery DC Power
  if (g_batteryVoltage >= BATT_MIN_VOLTS) {
    setPowerSource(SRC_BATT);
    if (g_batteryVoltage >= BATT_FULL_VOLTS) {
      setLoadRelays(LOAD_MASK_FULL);
    } else {
      // Battery SoC Low: Shed Tier 3 Low Priority Load (RL6)
      setLoadRelays(LOAD_MASK_OPTIMIZED);
    }
    return;
  }

  // Priority 3: Utility Grid AC Power
  if (g_gridVoltage >= GRID_MIN_VOLTS) {
    setPowerSource(SRC_GRID);
    setLoadRelays(LOAD_MASK_FULL);
    return;
  }

  // Fallback: All Sources Below Thresholds
  setPowerSource(SRC_OFF);
  setLoadRelays(LOAD_MASK_NONE);
}

/**
 * @brief Actuates source relays with Break-Before-Make dead-time protection.
 * Guarantees that conflicting power sources are NEVER active simultaneously.
 * 
 * @param newSource Target power source (SRC_OFF, SRC_SOLAR, SRC_BATT, SRC_GRID)
 */
void setPowerSource(PowerSource newSource) {
  if (g_estopTriggered) return; // Emergency stop lockout

  if (g_activeSource == newSource) return;

  Serial.print(F("[ATmega2560] Switching Source: "));
  Serial.print(g_activeSource);
  Serial.print(F(" -> "));
  Serial.println(newSource);

  // 1. BREAK PHASE: De-energize all source relays first
  digitalWrite(PIN_RELAY_SOLAR, LOW);
  digitalWrite(PIN_RELAY_BATT,  LOW);
  digitalWrite(PIN_RELAY_GRID,  LOW);

  // Mandatory 60ms dead-time delay to prevent arc cross-conduction and bus short circuits
  delay(BREAK_BEFORE_MAKE_MS);

  // 2. MAKE PHASE: Energize only the target source relay
  switch (newSource) {
    case SRC_SOLAR:
      digitalWrite(PIN_RELAY_SOLAR, HIGH);
      break;
    case SRC_BATT:
      digitalWrite(PIN_RELAY_BATT, HIGH);
      break;
    case SRC_GRID:
      digitalWrite(PIN_RELAY_GRID, HIGH);
      break;
    case SRC_OFF:
    default:
      // All remain LOW
      break;
  }

  g_activeSource = newSource;
}

/**
 * @brief Directly updates the 3 load branch relays to match the target bitmask.
 * 
 * @param loadMask Bitmask of loads (LOAD_MASK_CRITICAL, LOAD_MASK_NORMAL, LOAD_MASK_LOW)
 */
void setLoadRelays(uint8_t loadMask) {
  if (g_estopTriggered) return; // Emergency stop lockout

  g_activeLoadMask = loadMask;

  digitalWrite(PIN_RELAY_LOAD_HIGH,   (loadMask & LOAD_MASK_CRITICAL) ? HIGH : LOW);
  digitalWrite(PIN_RELAY_LOAD_NORMAL, (loadMask & LOAD_MASK_NORMAL)   ? HIGH : LOW);
  digitalWrite(PIN_RELAY_LOAD_LOW,    (loadMask & LOAD_MASK_LOW)      ? HIGH : LOW);
}

/**
 * @brief Toggles a specific load branch without affecting other loads.
 * 
 * @param loadBit 0: High Priority (RL4), 1: Normal Priority (RL5), 2: Low Priority (RL6)
 */
void toggleLoad(uint8_t loadBit) {
  if (g_estopTriggered) return;

  uint8_t mask = (1 << loadBit);
  uint8_t newMask = g_activeLoadMask ^ mask;
  
  // Switch to Manual Mode so auto algorithm does not immediately overwrite user action
  g_systemState = STATE_MANUAL;
  setLoadRelays(newMask);
}

/**
 * @brief Direct 1-Click Source Cycling: SOLAR -> BATTERY -> GRID -> AUTO -> OFF -> SOLAR
 */
void cyclePowerSource() {
  if (g_estopTriggered) return;

  if (g_systemState == STATE_AUTO) {
    // Transition from AUTO to Manual ALL-OFF
    g_systemState = STATE_MANUAL;
    setPowerSource(SRC_OFF);
    Serial.println(F("[ATmega2560] Manual Mode: ALL SOURCES ISOLATED"));
  } else {
    // Cycle through sources in manual mode
    switch (g_activeSource) {
      case SRC_OFF:
        g_systemState = STATE_MANUAL;
        setPowerSource(SRC_SOLAR);
        Serial.println(F("[ATmega2560] Manual Source: SOLAR PV"));
        break;
      case SRC_SOLAR:
        g_systemState = STATE_MANUAL;
        setPowerSource(SRC_BATT);
        Serial.println(F("[ATmega2560] Manual Source: BATTERY"));
        break;
      case SRC_BATT:
        g_systemState = STATE_MANUAL;
        setPowerSource(SRC_GRID);
        Serial.println(F("[ATmega2560] Manual Source: UTILITY GRID"));
        break;
      case SRC_GRID:
        // Engage AUTO Mode
        g_systemState = STATE_AUTO;
        Serial.println(F("[ATmega2560] Mode Switched: AUTO PRIORITY ENGINE"));
        break;
      default:
        g_systemState = STATE_MANUAL;
        setPowerSource(SRC_OFF);
        break;
    }
  }
}

// =================================================================================
// 9. SIMPLIFIED 1-CLICK PUSH BUTTON CONTROL & DEBOUNCING
// =================================================================================

/**
 * @brief Scans and debounces the 5 push buttons, triggering actions on falling edges.
 */
void updateButtons() {
  if (g_estopTriggered) return; // Emergency stop lockout

  unsigned long currentMillis = millis();

  for (uint8_t i = 0; i < NUM_NAV_BUTTONS; i++) {
    bool reading = digitalRead(g_buttons[i].pin);

    // If contact state changed, reset the debounce timer
    if (reading != g_buttons[i].lastReading) {
      g_buttons[i].lastDebounceTime = currentMillis;
      g_buttons[i].lastReading = reading;
    }

    // Once state is stable for DEBOUNCE_DELAY_MS, evaluate button press
    if ((currentMillis - g_buttons[i].lastDebounceTime) >= DEBOUNCE_DELAY_MS) {
      if (reading != g_buttons[i].stableState) {
        g_buttons[i].stableState = reading;

        // Falling edge detected (Button pressed down)
        if (g_buttons[i].stableState == LOW) {
          handleButtonPress(i);
        }
      }
    }
  }
}

/**
 * @brief Executes the dedicated function for each push button.
 * 
 * @param btnIndex Button array index (0: Source, 1: L_High, 2: L_Norm, 3: L_Low, 4: View)
 */
void handleButtonPress(uint8_t btnIndex) {
  switch (btnIndex) {
    // -----------------------------------------------------------------------------
    // BUTTON 1 (D28 / PG4): Direct 1-Click Source Selector
    // -----------------------------------------------------------------------------
    case 0:
      cyclePowerSource();
      break;

    // -----------------------------------------------------------------------------
    // BUTTON 2 (D29 / PG5): Direct 1-Click Toggle High Priority Load (L2 / RL4)
    // -----------------------------------------------------------------------------
    case 1:
      toggleLoad(0);
      Serial.print(F("[ATmega2560] High Load (L2): "));
      Serial.println((g_activeLoadMask & LOAD_MASK_CRITICAL) ? F("ON") : F("OFF"));
      break;

    // -----------------------------------------------------------------------------
    // BUTTON 3 (D45 / PL4): Direct 1-Click Toggle Normal Priority Load (L3 / RL5)
    // -----------------------------------------------------------------------------
    case 2:
      toggleLoad(1);
      Serial.print(F("[ATmega2560] Normal Load (L3): "));
      Serial.println((g_activeLoadMask & LOAD_MASK_NORMAL) ? F("ON") : F("OFF"));
      break;

    // -----------------------------------------------------------------------------
    // BUTTON 4 (D44 / PL5): Direct 1-Click Toggle Low Priority Load (L1 / RL6)
    // -----------------------------------------------------------------------------
    case 3:
      toggleLoad(2);
      Serial.print(F("[ATmega2560] Low Load (L1): "));
      Serial.println((g_activeLoadMask & LOAD_MASK_LOW) ? F("ON") : F("OFF"));
      break;

    // -----------------------------------------------------------------------------
    // BUTTON 5 (D42 / PL7): Cycle LCD Telemetry Views
    // -----------------------------------------------------------------------------
    case 4:
      g_lcdViewPage = (g_lcdViewPage + 1) % 3;
      Serial.print(F("[ATmega2560] LCD View Switched to Page: "));
      Serial.println(g_lcdViewPage);
      break;

    default:
      break;
  }
}

// =================================================================================
// 10. LCD DISPLAY SYSTEM (16x2 Parallel Character Display)
// =================================================================================

/**
 * @brief Renders the active telemetry page on the 16x2 Parallel Character LCD.
 */
void updateLCD() {
  switch (g_lcdViewPage) {
    // -----------------------------------------------------------------------------
    // PAGE 0: MAIN SYSTEM DASHBOARD
    // -----------------------------------------------------------------------------
    case 0: {
      // Line 1: Active Power Source & Operating Mode (Exact 16 characters)
      lcd.setCursor(0, 0);
      lcd.print(F("SRC:"));
      if (g_activeSource == SRC_SOLAR)      lcd.print(F("SOLAR "));
      else if (g_activeSource == SRC_BATT)  lcd.print(F("BATT  "));
      else if (g_activeSource == SRC_GRID)  lcd.print(F("GRID  "));
      else                                  lcd.print(F("OFF   "));

      lcd.print(g_systemState == STATE_AUTO ? F("[AUT] ") : F("[MAN] "));

      // Line 2: 3-Tier Load Status (H:High, N:Normal, L:Low) and Active Bus Voltage
      lcd.setCursor(0, 1);
      lcd.print(F("H:"));
      lcd.print((g_activeLoadMask & LOAD_MASK_CRITICAL) ? F("1") : F("0"));
      lcd.print(F(" N:"));
      lcd.print((g_activeLoadMask & LOAD_MASK_NORMAL)   ? F("1") : F("0"));
      lcd.print(F(" L:"));
      lcd.print((g_activeLoadMask & LOAD_MASK_LOW)      ? F("1") : F("0"));

      lcd.print(F(" "));
      float dispV = (g_activeSource == SRC_SOLAR) ? g_solarVoltage :
                    (g_activeSource == SRC_BATT)  ? g_batteryVoltage :
                    (g_activeSource == SRC_GRID)  ? g_gridVoltage : 0.0f;
      if (dispV < 10.0f) lcd.print(F(" "));
      lcd.print(dispV, 1);
      lcd.print(F("V "));
      break;
    }

    // -----------------------------------------------------------------------------
    // PAGE 1: SOLAR & BATTERY DETAILED TELEMETRY
    // -----------------------------------------------------------------------------
    case 1: {
      // Line 1: Solar Voltage & Battery Voltage
      lcd.setCursor(0, 0);
      lcd.print(F("PV:"));
      if (g_solarVoltage < 10.0f) lcd.print(F(" "));
      lcd.print(g_solarVoltage, 1);
      lcd.print(F("V BA:"));
      if (g_batteryVoltage < 10.0f) lcd.print(F(" "));
      lcd.print(g_batteryVoltage, 1);
      lcd.print(F("V"));

      // Line 2: Total Load Current & Estimated Battery State of Charge
      lcd.setCursor(0, 1);
      lcd.print(F("I:"));
      lcd.print(g_totalLoadCurrent, 1);
      lcd.print(F("A "));

      // Simple Battery SoC Estimation (11.0V = 0%, 12.8V = 100%)
      int soc = (int)(((g_batteryVoltage - 11.0f) / 1.8f) * 100.0f);
      if (soc < 0)   soc = 0;
      if (soc > 100) soc = 100;
      lcd.print(F("SOC:"));
      lcd.print(soc);
      lcd.print(F("%   "));
      break;
    }

    // -----------------------------------------------------------------------------
    // PAGE 2: GRID AC & ENCLOSURE THERMAL TELEMETRY
    // -----------------------------------------------------------------------------
    case 2: {
      // Line 1: Grid Voltage & Grid Status
      lcd.setCursor(0, 0);
      lcd.print(F("GRID:"));
      if (g_gridVoltage < 10.0f) lcd.print(F(" "));
      lcd.print(g_gridVoltage, 1);
      lcd.print(F("V "));
      lcd.print(g_gridVoltage >= GRID_MIN_VOLTS ? F("AC:ON ") : F("AC:OFF"));

      // Line 2: Enclosure Temperature & Thermal Safety State
      lcd.setCursor(0, 1);
      lcd.print(F("TEMP:"));
      lcd.print(g_temperature, 1);
      lcd.print(F("C "));
      if (g_temperature >= MAX_SAFE_TEMP_C) {
        lcd.print(F("FAULT"));
      } else {
        lcd.print(F("SAFE "));
      }
      break;
    }
  }
}

// =================================================================================
// 11. STATUS LED CONTROL & HEARTBEAT BUS
// =================================================================================

/**
 * @brief Drives status indicator LEDs matching real-time system state.
 */
void updateLEDs() {
  unsigned long currentMillis = millis();

  // 1. Heartbeat LED Pulse (1 Hz Blink, 50% Duty Cycle)
  if (currentMillis - g_lastHeartbeat >= 500) {
    g_lastHeartbeat = currentMillis;
    g_heartbeatState = !g_heartbeatState;
    digitalWrite(PIN_LED_HEARTBEAT, g_heartbeatState ? HIGH : LOW);
  }

  // 2. Active Power Source Indicator LEDs
  digitalWrite(PIN_LED_SOLAR, (g_activeSource == SRC_SOLAR) ? HIGH : LOW);
  digitalWrite(PIN_LED_BATT,  (g_activeSource == SRC_BATT)  ? HIGH : LOW);
  digitalWrite(PIN_LED_GRID,  (g_activeSource == SRC_GRID)  ? HIGH : LOW);

  // 3. Load Bus Energized Status LED (D10 / Pink)
  bool anyLoadON = (g_activeLoadMask != LOAD_MASK_NONE);
  digitalWrite(PIN_LED_LOAD_STATUS, anyLoadON ? HIGH : LOW);

  // 4. Solar-to-Battery Charging LED (ON if Solar > Battery and Solar >= 14V)
  bool isCharging = (g_solarVoltage > g_batteryVoltage) && (g_solarVoltage >= SOLAR_MIN_VOLTS);
  digitalWrite(PIN_LED_CHARGING, isCharging ? HIGH : LOW);

  // 5. System Fault LED (Solid during thermal cutoff, Rapid Strobe during E-Stop)
  if (g_systemState == STATE_FAULT) {
    digitalWrite(PIN_LED_FAULT, HIGH);
  } else if (g_systemState != STATE_ESTOP) {
    digitalWrite(PIN_LED_FAULT, LOW);
  }

  // 6. Relay Activity LED (ON if any source or load relay coil is energized)
  bool anyRelayActive = (g_activeSource != SRC_OFF) || (g_activeLoadMask != LOAD_MASK_NONE);
  digitalWrite(PIN_LED_RELAY_ACT, anyRelayActive ? HIGH : LOW);
}

// =================================================================================
// 12. SERIAL DIAGNOSTICS CONSOLE
// =================================================================================

/**
 * @brief Streams formatted ASCII telemetry and switching logs over UART0 at 1 Hz.
 */
void printDiagnosticsConsole() {
  Serial.println(F("--------------------------------------------------"));
  Serial.print(F("[ATmega2560] PV: "));
  Serial.print(g_solarVoltage, 2);
  Serial.print(F(" V | Batt: "));
  Serial.print(g_batteryVoltage, 2);
  Serial.print(F(" V | Grid: "));
  Serial.print(g_gridVoltage, 2);
  Serial.println(F(" V"));

  Serial.print(F("[ATmega2560] Est. Current: "));
  Serial.print(g_totalLoadCurrent, 2);
  Serial.print(F(" A | Temp: "));
  Serial.print(g_temperature, 1);
  Serial.println(F(" °C"));

  Serial.print(F("[ATmega2560] Mode: "));
  if (g_systemState == STATE_AUTO)        Serial.print(F("AUTO"));
  else if (g_systemState == STATE_MANUAL) Serial.print(F("MANUAL"));
  else if (g_systemState == STATE_FAULT)  Serial.print(F("FAULT"));
  else if (g_systemState == STATE_ESTOP)  Serial.print(F("EMERGENCY STOP"));

  Serial.print(F(" | Active Source: "));
  if (g_activeSource == SRC_SOLAR)      Serial.print(F("SOLAR"));
  else if (g_activeSource == SRC_BATT)  Serial.print(F("BATTERY"));
  else if (g_activeSource == SRC_GRID)  Serial.print(F("GRID"));
  else                                  Serial.print(F("OFF"));

  Serial.print(F(" | Loads: H:"));
  Serial.print((g_activeLoadMask & LOAD_MASK_CRITICAL) ? F("1") : F("0"));
  Serial.print(F(" N:"));
  Serial.print((g_activeLoadMask & LOAD_MASK_NORMAL)   ? F("1") : F("0"));
  Serial.print(F(" L:"));
  Serial.println((g_activeLoadMask & LOAD_MASK_LOW)    ? F("1") : F("0"));
}
