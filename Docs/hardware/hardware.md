# GridflowX Tri-Source Microgrid Controller - ATmega2560 Hardware Specification

**Document Version:** 4.0 (Single-MCU Consolidated Hardware Architecture)  
**Target Simulator:** Proteus 9 Professional (v9.0 / v9.1 / v9.2 64-bit Design Suite)  
**Architecture:** Single Microcontroller System — Arduino Mega 2560 (ATmega2560 Standalone Execution Node)  
**Status:** Verified & Proteus 9 Professional Schematic Compatible

---

## 1. Executive Summary & Single-Controller Overview

The **GridflowX Tri-Source Microgrid Controller** is an industrial-grade embedded power management system designed to dynamically route power from three independent energy sources (**Utility Grid AC**, **Solar PV DC**, and **Backup Battery DC**) to three priority-tiered load circuits (**High-Priority**, **Normal-Priority**, and **Low-Priority**).

Following the v4.0 hardware design consolidation, **all ESP32 dependencies have been removed**. The **Arduino Mega 2560 (ATmega2560)** serves as the sole, autonomous controller handling voltage sensing, ACS712 current measurement, DS18B20 1-Wire temperature safety monitoring, I2C LCD UI navigation, status LED indication, and ULN2803A relay actuation.

```
+-----------------------------------------------------------------------------------+
|                        ATmega2560 STANDALONE CONTROLLER                           |
|  - Tri-Source ADC Voltage Sensing (A0 Solar, A1 Battery, A2 Grid)                  |
|  - ACS712 Hall-Effect Current Sensing (A3 Solar, A4 Battery, A5 Grid)              |
|  - DS18B20 1-Wire Thermal Fault Detection (D41 / PL6)                              |
|  - Real-Time Relay Driver Controls (D22 - D27 via ULN2803A Darlington Stage)       |
|  - Hardware Emergency Stop Interlock (D19 / INT2)                                 |
|  - 6-Button Interactive LCD Menu Interface (D28 Menu, D29 Up, D45 Down, D44 Enter)|
|  - I2C Character LCD Interface (D20 SDA, D21 SCL)                                 |
|  - Status LED Bus (D52 Heartbeat, D51 Solar, D50 Battery, D53 Grid, D12 Fault)     |
+-----------------------------------------------------------------------------------+
```

---

## 2. Complete Pin Assignment Specification

### 2.1 Power Pins & Power Supply Network
| ATmega2560 Pin | AVR Pin | Signal / Connection | Notes |
| :--- | :--- | :--- | :--- |
| **10, 80** | VCC | +5V Logic Rail | 100 nF decoupling capacitor per pin |
| **31, 61** | GND | Common System Ground | Solid low-impedance ground plane |
| **98** | AVCC | +5V Analog Power | Ferrite bead LC filter |
| **100** | AREF | Analog Reference | 100 nF capacitor to GND |

---

### 2.2 Analog Sensor Inputs (10-bit ADC)
| Source / Sensor | Physical Pin | AVR Signal | Arduino Pin | Circuit Hardware Details |
| :--- | :--- | :--- | :--- | :--- |
| **Solar Voltage** | Pin 97 | PF0 / ADC0 | **A0** | 30kΩ / 10kΩ divider (Ratio = 4.0), 100nF filter |
| **Battery Voltage**| Pin 96 | PF1 / ADC1 | **A1** | 30kΩ / 10kΩ divider (Ratio = 4.0), 100nF filter |
| **Grid Voltage** | Pin 95 | PF2 / ADC2 | **A2** | 30kΩ / 10kΩ divider (Ratio = 4.0), 100nF filter |
| **ACS712 Solar** | Pin 94 | PF3 / ADC3 | **A3** | ACS712-20A output (100 mV/A sensitivity) |
| **ACS712 Battery**| Pin 93 | PF4 / ADC4 | **A4** | ACS712-20A output (100 mV/A sensitivity) |
| **ACS712 Grid** | Pin 92 | PF5 / ADC5 | **A5** | ACS712-20A output (100 mV/A sensitivity) |

### 2.3 Thermal Sensor & Parallel Display Interfaces (LM016L)
| Peripheral | Physical Pin | AVR Signal | Arduino Pin | Circuit Hardware Details |
| :--- | :--- | :--- | :--- | :--- |
| **DS18B20 Temp** | Pin 41 | PL6 | **D41** | 1-Wire Data bus with 4.7kΩ pull-up to +5V |
| **LCD RS (Register Select)** | Pin 78 | PA0 | **D22** | Parallel Character LCD Command/Data Select |
| **LCD E (Enable Strobe)** | Pin 77 | PA1 | **D23** | Parallel Character LCD Enable Strobe Line |
| **LCD D4 (Data Bit 4)** | Pin 76 | PA2 | **D24** | High-Nibble 4-bit Data Bus Line 4 |
| **LCD D5 (Data Bit 5)** | Pin 75 | PA3 | **D25** | High-Nibble 4-bit Data Bus Line 5 |
| **LCD D6 (Data Bit 6)** | Pin 74 | PA4 | **D26** | High-Nibble 4-bit Data Bus Line 6 |
| **LCD D7 (Data Bit 7)** | Pin 73 | PA5 | **D27** | High-Nibble 4-bit Data Bus Line 7 |

---

### 2.4 Human-Machine Interface Push Buttons
| Button | Physical Pin | AVR Signal | Arduino Pin | Configuration & Logic |
| :--- | :--- | :--- | :--- | :--- |
| **Source Selector** | Pin 28 | PG4 | **D28** | `INPUT_PULLUP` (1-Click Cycle: Solar -> Batt -> Grid -> Auto -> Off) |
| **Toggle High Load (L2)**| Pin 29 | PG5 | **D29** | `INPUT_PULLUP` (1-Click Direct Toggle: High Priority Load RL4) |
| **Toggle Norm Load (L3)**| Pin 39 | PL4 | **D45** | `INPUT_PULLUP` (1-Click Direct Toggle: Normal Priority Load RL5) |
| **Toggle Low Load (L1)** | Pin 40 | PL5 | **D44** | `INPUT_PULLUP` (1-Click Direct Toggle: Low Priority Load RL6) |
| **View Telemetry Page** | Pin 42 | PL7 | **D42** | `INPUT_PULLUP` (1-Click Cycle: Dashboard -> PV/Batt -> Grid/Temp) |
| **Emergency Stop** | Pin 45 | PD2 / INT2 | **D19** | Hardware Interrupt ISR (`FALLING`), Instant Cutoff (<10µs) |

---

### 2.5 Relay Outputs (ULN2803A Driver Stage on Port C: PC0..PC5)
| Relay Target | Function | AVR Signal | Arduino Pin | Hardware Specification |
| :--- | :--- | :--- | :--- | :--- |
| **RL1** | Utility Grid AC Relay | PC0 (Pin 53) | **D37** | ULN2803A Darlington Driver (12V DC Relay Coil) |
| **RL2** | Backup Battery DC Relay| PC1 (Pin 54) | **D36** | ULN2803A Darlington Driver (12V DC Relay Coil) |
| **RL3** | Solar PV Source Relay | PC2 (Pin 55) | **D35** | ULN2803A Darlington Driver (12V DC Relay Coil) |
| **RL4** | Tier 1 High Load (L2) | PC3 (Pin 56) | **D34** | ULN2803A Darlington Driver (12V DC Relay Coil) |
| **RL5** | Tier 2 Normal Load (L3)| PC4 (Pin 57) | **D33** | ULN2803A Darlington Driver (12V DC Relay Coil) |
| **RL6** | Tier 3 Low Load (L1)  | PC5 (Pin 58) | **D32** | ULN2803A Darlington Driver (12V DC Relay Coil) |

---

### 2.6 System Status LEDs (Port B Outputs: PB0..PB7)
| LED Indicator | Physical Pin | AVR Signal | Arduino Pin | Series Resistor | Function |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Grid Active** | Pin 19 | PB0 | **D53** | 330 Ω | Aqua LED (D9): Grid AC Source Engaged |
| **Heartbeat** | Pin 20 | PB1 | **D52** | 330 Ω | Blue LED (D10): System Pulse (1Hz Blink) |
| **Solar Active** | Pin 21 | PB2 | **D51** | 330 Ω | Green LED (D11): Solar PV Source Engaged |
| **Battery Active**| Pin 22 | PB3 | **D50** | 330 Ω | Orange LED (D12): Battery Source Engaged |
| **Load Status** | Pin 23 | PB4 | **D10** | 330 Ω | Pink LED (D13): Any Load Branch Active |
| **Relay Activity**| Pin 24 | PB5 | **D11** | 330 Ω | Purple LED (D14): Any Relay Coil Energized |
| **System Fault** | Pin 25 | PB6 | **D12** | 330 Ω | Red LED (D15): Fault / E-Stop Lockout Strobe |
| **Charging** | Pin 26 | PB7 | **D13** | 330 Ω | White LED (D16): Solar-to-Battery Charging |

---

## 3. List of Components Used in Proteus Simulation

Below is the complete, categorized bill of materials and component specification used in the Proteus 9 schematic design:

### 3.1 Microcontroller, Clock, & Core Passives
| Part Reference | Component Name / Model | Specific Value / Rating | Proteus Device Library | Function & Description | Qty |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **U6** | **ATmega2560** | 8-bit AVR MCU @ 16 MHz, 5V, 100-Pin TQFP | `ATMEGA2560` | Main Autonomous Microgrid Controller | 1 |
| **X1** | **Crystal Oscillator** | 16.000 MHz Fundamental Mode | `CRYSTAL` | System Master Clock Reference | 1 |
| **C14, C15** | **Ceramic Disc Capacitors**| 22 pF, 50V (C0G/NP0) | `CAP` | Crystal Oscillator Load Capacitors | 2 |
| **R9** | **Pull-up Resistor** | 10 kΩ, 0.25W Metal Film (±1%) | `RES` | Hardware Master Reset Pull-up (`RESET`) | 1 |
| **C16** | **Decoupling Capacitor** | 100 nF (0.1 µF), 50V Ceramic | `CAP` | Analog Reference Decoupling (`AREF` Pin 98) | 1 |

---

### 3.2 Display & Human-Machine Interface (HMI)
| Part Reference | Component Name / Model | Specific Value / Rating | Proteus Device Library | Function & Description | Qty |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **LCD2** | **LM016L** | 16×2 Alphanumeric Character LCD, 5V HD44780 | `LM016L` | Parallel Character Telemetry & Dashboard Display | 1 |
| **RV1** | **Preset Potentiometer** | 1 kΩ / 10 kΩ Linear | `POT-HG` / `POT-LIN` | LCD Contrast Adjust Pin 3 (`VEE`) | 1 |
| **PG4** | **Tactile Push Button** | SPST-NO Momentary (Active LOW) | `BUTTON` | Button 1: Direct 1-Click Source Selector (`PG4`/D28) | 1 |
| **PG5** | **Tactile Push Button** | SPST-NO Momentary (Active LOW) | `BUTTON` | Button 2: Toggle High Priority Load L2 (`PG5`/D29) | 1 |
| **PL4** | **Tactile Push Button** | SPST-NO Momentary (Active LOW) | `BUTTON` | Button 3: Toggle Normal Priority Load L3 (`PL4`/D45) | 1 |
| **PL5** | **Tactile Push Button** | SPST-NO Momentary (Active LOW) | `BUTTON` | Button 4: Toggle Low Priority Load L1 (`PL5`/D44) | 1 |
| **PL7** | **Tactile Push Button** | SPST-NO Momentary (Active LOW) | `BUTTON` | Button 5: Cycle LCD Telemetry Pages (`PL7`/D42) | 1 |
| **PD2** | **Emergency Stop Button** | SPST-NO Momentary (Active LOW) | `BUTTON` | Button 6: Dedicated Hardware E-Stop (`PD2`/D19/INT2) | 1 |

---

### 3.3 Status Diagnostic LED Array (Port B)
| Part Reference | Component Name / Color | Forward Voltage / Current | Proteus Device Library | Function & Indication | Qty |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **D9** | **LED-AQUA** | $V_F = 3.2\text{V}$, $I_F = 20\text{mA}$ | `LED-AQUA` | Grid AC Source Active Indicator (`PB0`) | 1 |
| **D10** | **LED-BLUE** | $V_F = 3.2\text{V}$, $I_F = 20\text{mA}$ | `LED-BLUE` | System Pulse 1Hz Heartbeat Indicator (`PB1`) | 1 |
| **D11** | **LED-GREEN** | $V_F = 2.2\text{V}$, $I_F = 20\text{mA}$ | `LED-GREEN` | Solar PV Source Active Indicator (`PB2`) | 1 |
| **D12** | **LED-ORANGE**| $V_F = 2.0\text{V}$, $I_F = 20\text{mA}$ | `LED-ORANGE`| Battery DC Source Active Indicator (`PB3`)| 1 |
| **D13** | **LED-PINK** | $V_F = 3.0\text{V}$, $I_F = 20\text{mA}$ | `LED-PINK` | Load Bus Energized Status Indicator (`PB4`)| 1 |
| **D14** | **LED-PURPLE**| $V_F = 3.1\text{V}$, $I_F = 20\text{mA}$ | `LED-PURPLE`| Relay Coil Energized Activity (`PB5`) | 1 |
| **D15** | **LED-RED** | $V_F = 1.9\text{V}$, $I_F = 20\text{mA}$ | `LED-RED` | System Fault & E-Stop Strobe (`PB6`) | 1 |
| **D16** | **LED-WHITE**| $V_F = 3.2\text{V}$, $I_F = 20\text{mA}$ | `LED-WHITE` | Solar-to-Battery Charging Status (`PB7`)| 1 |
| **R10 - R17**| **Metal Film Resistors** | 330 Ω, 0.25W (±5%) | `RES` | LED Series Current Limiting (8 channels) | 8 |

---

### 3.4 Power Sources, Step-Down, & Rectifier Circuitry
| Part Reference | Component Name / Model | Specific Value / Rating | Proteus Device Library | Function & Description | Qty |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **B1** | **DC Voltage Source** | 18.0V DC (Solar PV Simulator) | `BATTERY` / `DC` | Emulated 18V Solar PV Generator Bus | 1 |
| **B2** | **DC Voltage Source** | 12.0V - 12.8V DC (Battery Simulator) | `BATTERY` / `DC` | Emulated 12V Deep-Cycle Storage Battery | 1 |
| **V1** | **AC Voltage Source** | 230V AC RMS, 50 Hz | `VSINE` | Utility Mains AC Electrical Grid | 1 |
| **TR1** | **Step-Down Transformer**| 230V to 15V AC (15:1 Ratio, 50 Hz) | `TRAN-2P2S` / `TRANSFORMER` | Mains Isolation & Step-Down Stage | 1 |
| **BR1** | **Bridge Rectifier** | W04M / 1.5A, 400V Full-Wave | `BRIDGE` | Full-Wave AC-to-DC Grid Rectification | 1 |
| **FUSE1 - FUSE4**| **Cartridge Fuses** | 5A / 10A Fast-Blow, 250V | `FUSE` | Overcurrent Branch Protection (PV, Batt, Grid, DC Bus) | 4 |
| **D1, D4, D5**| **Power Rectifier Diodes**| 1N4007 / 1N5408 (1A - 3A, 1000V) | `1N4007` | Series Anti-Backfeed & Isolation Diodes | 3 |
| **D17, D2** | **Zener Diodes** | 1N4746A (18V) / 1N4742A (12V) 1W | `ZENER` | Overvoltage Transient Clamping Protection | 2 |
| **D8, D9, D6**| **Steering Diodes** | 1N4007 (1A, 1000V) | `1N4007` | Power Steering & Flyback Suppression | 3 |
| **C1, C2, C5**| **Electrolytic Capacitors**| 1000 µF / 2200 µF, 35V / 50V | `CAP-ELEC` | Bulk DC Smoothing & Ripple Filtering | 3 |
| **C17, C18, C19**| **Bypass Capacitors** | 100 nF (0.1 µF), 50V Ceramic | `CAP` | High-Frequency Switching Noise Filter | 3 |

---

### 3.5 DC-DC Buck Switching Regulator Stage (LM2596)
| Part Reference | Component Name / Model | Specific Value / Rating | Proteus Device Library | Function & Description | Qty |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **U5** | **LM2596-ADJ** | 3A Step-Down Voltage Regulator IC | `LM2596` | High-Efficiency 150kHz DC-DC Step-Down Stage | 1 |
| **L1** | **Power Inductor** | 33 µH / 47 µH, 3A Ferrite Core | `INDUCTOR` | Buck Converter Energy Storage Choke | 1 |
| **C7** | **Input Filter Capacitor**| 220 µF, 35V Electrolytic | `CAP-ELEC` | Buck Converter Input Supply Smoothing | 1 |
| **C9** | **Input HF Capacitor** | 100 nF, 50V Ceramic | `CAP` | High-Frequency Input Noise Suppression | 1 |
| **C10** | **Output Capacitor** | 470 µF, 25V Low-ESR Electrolytic | `CAP-ELEC` | Regulated DC Bus Output Filter | 1 |
| **C20** | **Output HF Capacitor** | 100 nF, 50V Ceramic | `CAP` | Output Transient Suppression Capacitor | 1 |

---

### 3.6 Relay Actuation Stage (ULN2803 & Electromechanical Relays)
| Part Reference | Component Name / Model | Specific Value / Rating | Proteus Device Library | Function & Description | Qty |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **U7** | **ULN2803 / ULN2803A** | 8-Ch Darlington Array, 500mA, 50V | `ULN2803A` | Relay Coil Driver with Internal Free-Wheeling Diodes | 1 |
| **RL1** | **SPDT Power Relay** | 12V DC Coil, Contacts: 10A @ 250VAC | `RELAY` | Utility Grid AC Source Selector (`PC0` / D37) | 1 |
| **RL2** | **SPDT Power Relay** | 12V DC Coil, Contacts: 10A @ 250VAC | `RELAY` | Backup Battery DC Source Selector (`PC1` / D36) | 1 |
| **RL3** | **SPDT Power Relay** | 12V DC Coil, Contacts: 10A @ 250VAC | `RELAY` | Solar PV Source Selector (`PC2` / D35) | 1 |
| **RL4** | **SPDT Power Relay** | 12V DC Coil, Contacts: 10A @ 250VAC | `RELAY` | Tier 1 High-Priority Critical Load L2 (`PC3` / D34) | 1 |
| **RL5** | **SPDT Power Relay** | 12V DC Coil, Contacts: 10A @ 250VAC | `RELAY` | Tier 2 Normal-Priority Load L3 (`PC4` / D33) | 1 |
| **RL6** | **SPDT Power Relay** | 12V DC Coil, Contacts: 10A @ 250VAC | `RELAY` | Tier 3 Low-Priority Flexible Load L1 (`PC5` / D32) | 1 |

---

### 3.7 Sensors, Voltage Dividers, & Priority Load Groups
| Part Reference | Component Name / Model | Specific Value / Rating | Proteus Device Library | Function & Description | Qty |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **U8** | **DS18B20** | 1-Wire Digital Thermal Sensor (-55°C to +125°C) | `DS18B20` | Enclosure Thermal Cutoff Sensor (`PL6` / D41) | 1 |
| **R1, R3, R5**| **High-Side Resistors** | 30 kΩ, 0.25W Metal Film (±1%) | `RES` | Voltage Divider Upper Arms (Solar, Batt, Grid) | 3 |
| **R2, R4, R6**| **Low-Side Resistors** | 10 kΩ, 0.25W Metal Film (±1%) | `RES` | Voltage Divider Lower Arms (Ratio = 4.0, 0-20V Range) | 3 |
| **L1** | **Incandescent Load (Low)**| 12V DC, 40W (3.33 A @ 12V) | `LAMP` / `LOAD` | Tier 3 Flexible Low-Priority Load (Shed First) | 1 |
| **L2** | **Incandescent Load (High)**| 12V DC, 15W (1.25 A @ 12V) | `LAMP` / `LOAD` | Tier 1 Critical High-Priority Load (Always On) | 1 |
| **L3** | **Incandescent Load (Norm)**| 12V DC, 25W (2.08 A @ 12V) | `LAMP` / `LOAD` | Tier 2 Normal-Priority Load (Auxiliary Demand) | 1 |
| **VM1 - VM3** | **DC Voltmeters** | 0.00V - 30.00V DC Range | `DC VOLTMETER` | Virtual Telemetry Voltage Readout Displays | 3 |
| **AM1 - AM3** | **DC Ammeters** | 0.00A - 10.00A DC Range | `DC AMMETER` | Virtual Branch Current Telemetry Displays | 3 |

---

## 4. Power Selection Priority & Safety Architecture

```
+-----------------------------------------------------------------------------------+
|                        POWER SELECTION PRIORITY MATRIX                            |
|                                                                                   |
|  1. SOLAR PV POWER: Active if V_solar >= 14.0V                                    |
|     -> Source = SOLAR, Loads = High + Normal + Low (FULL)                         |
|                                                                                   |
|  2. BATTERY DC POWER: Active if V_solar < 14.0V and V_batt >= 11.5V              |
|     -> If V_batt >= 12.2V: Source = BATTERY, Loads = FULL                        |
|     -> If 11.5V <= V_batt < 12.2V: Source = BATTERY, Loads = OPTIMIZED (Shed Low) |
|                                                                                   |
|  3. UTILITY GRID AC POWER: Active if Solar & Battery depleted and V_grid >= 10.0V|
|     -> Source = GRID, Loads = FULL                                                |
|                                                                                   |
|  4. UNDER-VOLTAGE / THERMAL CUTOFF (>65°C):                                       |
|     -> Source = OFF, Loads = SHED ALL                                             |
+-----------------------------------------------------------------------------------+
```

### Safety Switching Guarantee:
- **Break-Before-Make Dead-Time:** A mandatory `60ms` hardware delay is executed between de-energizing an active source relay and energizing a new source relay. This prevents AC mains cross-conduction into DC battery/solar channels.
- **Microsecond Emergency Stop:** Pin 19 (`INT2`) hardware interrupt cuts all relay driver channels instantly (<10µs).
