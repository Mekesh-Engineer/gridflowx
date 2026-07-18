# 🔌 Hardware Specification

## ESP32 Pins, Sensor Interfaces, 8-Channel Relay Matrix, and I2C LCD Display

**Document ID:** `DOC-HARDWARE`
**Version:** 3.0
**Last Updated:** June 2026
**Classification:** Hardware Engineering Document · Electrical Reference
**Maintained By:** Embedded Systems Team

---

## 📋 Purpose

This document defines the physical pin assignments, sensor configurations, relay channels, and LCD interface specifications for the GridFlowX ESP32 Edge controller.

---

## 🧠 Microcontroller: ESP32-WROOM-32E

### System Allocations
- **Core 0 (Safety Core):** Runs the hard real-time safety loop (100Hz) checking for overvoltage, overcurrent, and thermal runaway. Direct ADC sensor acquisition.
- **Core 1 (Communication Core):** Manages WiFi connection, secure WebSockets (`wss://`) connection to the FastAPI backend, HC-05 Bluetooth transceiver, and the I2C LCD update cycles.

### Pin Assignment

| GPIO | Pin Name | Peripheral Interface | Direction | Description |
| --- | --- | --- | --- | --- |
| **GPIO 34** | ADC1_CH6 | Voltage Divider (Solar) | Input | Solar Voltage Sensor |
| **GPIO 35** | ADC1_CH7 | ACS712 Current Sensor (Solar) | Input | Solar Current Sensor |
| **GPIO 36** | ADC1_CH0 | Voltage Divider (Battery) | Input | Battery Voltage Sensor |
| **GPIO 33** | ADC1_CH5 | ACS712 Current Sensor (Battery) | Input | Battery Current Sensor |
| **GPIO 39** | ADC1_CH3 | AC Mains Optocoupler | Input | Grid Availability Status (High/Low) |
| **GPIO 4** | 1-Wire | DS18B20 Temp Probes | Bidirectional | Heatsink & Ambient Temp sensors (4.7kΩ pull-up) |
| **GPIO 21** | I2C_SDA | LCD I2C Backpack | Bidirectional | Shared I2C SDA (0x27) |
| **GPIO 22** | I2C_SCL | LCD I2C Backpack | Output | Shared I2C SCL (0x27) |
| **GPIO 25** | Digital | Relay Channel 1 | Output | Solar Path Switch |
| **GPIO 26** | Digital | Relay Channel 2 | Output | Grid Fallback Switch |
| **GPIO 27** | Digital | Relay Channel 3 | Output | Battery Charger Switch |
| **GPIO 14** | Digital | Relay Channel 4 | Output | Load Tier 1 (Critical) |
| **GPIO 12** | Digital | Relay Channel 5 | Output | Load Tier 2 (High Priority) |
| **GPIO 13** | Digital | Relay Channel 6 | Output | Load Tier 3 (Medium Priority) |
| **GPIO 15** | Digital | Relay Channel 7 | Output | Load Tier 4 (Low Priority) |
| **GPIO 2** | Digital | Relay Channel 8 | Output | Emergency Shutdown (NC Fail-safe) |
| **GPIO 16** | RX0 | HC-05 Bluetooth RX | Input | Bluetooth Serial Debugging |
| **GPIO 17** | TX0 | HC-05 Bluetooth TX | Output | Bluetooth Serial Debugging |

---

## 📡 Sensor Configurations

### 1. Analog Electrical Inputs (5 Signals)
1. **Solar Voltage:** Calculated using a 3.703:1 divider ratio (R1 = 10kΩ, R2 = 3.7kΩ). Maps 0-20V DC into the ESP32 ADC safe range (0-3.3V).
2. **Solar Current:** ACS712 Hall-effect sensor (±5A DC range, 185mV/A sensitivity). Output is offset by VCC/2 (2.5V) at 0A.
3. **Battery Voltage:** Calculated using a 3.703:1 divider ratio (R1 = 10kΩ, R2 = 3.7kΩ) protecting the ADC.
4. **Battery Current:** ACS712 Hall-effect sensor (±5A DC range).
5. **Grid Availability:** Read via an AC-mains optocoupler isolation module. Output is HIGH (3.3V) when grid power is present and LOW (0V) during load-shedding or blackouts.

### 2. Temperature Probe (DS18B20)
- Waterproof probe mounted to the main relay MOSFET heatsink.
- Connected via the 1-Wire protocol on GPIO 4 with a 4.7kΩ external pull-up resistor.

---

## 🔀 8-Channel Relay Module

The controller controls 8 SPDT relays driven by optocoupled inputs to prevent electrical feedback to the ESP32.

### Relay Functions
- **Relay 1 (Solar):** Connects or isolates the Solar panels from the charge bus.
- **Relay 2 (Grid):** Toggles grid utility fallback power line.
- **Relay 3 (Battery):** Connects/disconnects the battery charging circuit.
- **Relay 4 (Tier 1 Load):** Critical control power (unconditionally powered unless L3 shutdown).
- **Relay 5 (Tier 2 Load):** High-priority devices (shed at < 40% battery SoC).
- **Relay 6 (Tier 3 Load):** Medium-priority devices (shed at < 30% battery SoC).
- **Relay 7 (Tier 4 Load):** Low-priority/non-essential devices (shed at < 25% battery SoC).
- **Relay 8 (Emergency):** Configured as Normally Closed (NC). When de-energized (high-impedance or power failure), it cuts all load paths instantly.

---

## 📺 16x2 LCD Display

A standard 16-character by 2-line liquid crystal display is connected via an **PCF8574 I2C interface backpack**.

### Specifications
- **I2C Address:** `0x27` (default)
- **Power supply:** 5V (from buck regulator)
- **Refresh Rate:** 1Hz (updated on Core 1)
- **Data Displayed:**
  - Line 1: `S: XX.XW B: XX.X%` (Solar power in Watts, Battery SoC %)
  - Line 2: `L: XX.XW [G: ON]` (Load power in Watts, Grid Status indicator)
- **Failsafe States:** If connection to the FastAPI server drops, the screen flashes `CONN_LOST` while continuing local scheduling.
