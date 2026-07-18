# ⚡ GridflowX — Hardware Simulation and Prototyping Plan

> **Comprehensive Technical Report & Roadmap for System-Level Modeling, Co-Simulation, and Hardware Validation**
> *Document ID:* `REP-MATLAB` · *Version:* 1.0 · *Status:* Draft / Review Ready

---

## 📋 Purpose & Scope

This document details the hardware simulation, co-simulation, and physical prototyping roadmap for the **GridflowX** project. Before committing to physical hardware, custom PCB layouts, or field deployments, the system must undergo systematic simulation validation. This ensures safety, optimizes control parameters, and minimizes development risks across the cyber-physical interface.

For details on the project review slides and full software structure, refer to the [review.md](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/Report/review.md) document. Hardware pin configurations can be found in the [Hardware_Spec.md](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/Hardware_Spec.md) document.

---

## 1. 🔍 Project Understanding

### 1.1 Project Concept & Working Principle
GridflowX is an autonomous, intelligent tri-source energy router that dynamically switches power pathways between **Solar PV**, **Battery Storage (Li-ion)**, and the **AC Utility Grid** to feed prioritized load tiers. 

```
[ Solar PV ] ─────► [ Relay 1 ] ──┐
[ Grid AC ]  ─────► [ Relay 2 ] ──┼──► [ 12V DC Common Bus ] ──► [ Prioritized Loads ]
[ Battery ]  ◄────► [ Relay 3 ] ──┘  (High / Med / Low Tiers)
```

The system operates on an edge-cloud hybrid loop:
- **Edge Layer (ESP32-WROOM-32E):** Executes a deterministic 100 Hz safety loop on Core 0 to monitor voltage, current, and temperature limits. It enforces a sub-10 ms emergency shutdown in case of thermal or electrical faults. Core 1 streams telemetry data via WebSockets and updates a local 16x2 LCD.
- **Cloud/Server Layer (FastAPI & Agentic AI):** Receives 1 Hz telemetry, updates a real-time Next.js dashboard, and hosts the **Unified Agentic Energy Orchestrator (UAEO)**. The UAEO runs LSTM-based solar forecasting, ARIMA-based load forecasting, and a Reinforcement Learning (RL) Decision Core to output optimal switching configurations and battery charge/discharge setpoints every 15 minutes.
- **Local Fallback:** In the event of communication failure, the ESP32 degrades gracefully to local rule-based scheduling (and TFLite Micro inference if available), ensuring continuous microgrid operation.

### 1.2 Major Hardware & Software Modules

```
                              ┌────────────────────────────────────────┐
                              │           GridflowX SYSTEM             │
                              └───────────────────┬────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
      ┌──────────────────────┐                                          ┌──────────────────────┐
      │   Hardware Modules   │                                          │   Software Modules   │
      └──────────┬───────────┘                                          └──────────┬───────────┘
                 │                                                                 │
  ├─ ESP32-WROOM-32E MCU                                            ├─ FreeRTOS Core 0 Safety Loop
  ├─ 8-Channel Relay Matrix                                         ├─ FreeRTOS Core 1 Comms (WSS/I2C)
  ├─ ACS712 Current Sensors (Solar & Battery)                       ├─ FastAPI WebSocket Ingestor
  ├─ Resistor Divider Voltage Sensors                               ├─ Unified Agentic Energy Orchestrator
  ├─ DS18B20 Temp Probe (Relay/Heatsink)                            │  ├─ Solar Forecast Tool (LSTM)
  ├─ AC Mains Optocoupler (Grid Status)                             │  ├─ Load Forecast Tool (ARIMA)
  ├─ 16x2 LCD Display via I2C                                       │  └─ RL Decision Core (PyTorch/ONNX)
  └─ Battery (12V Li-ion) & Solar PV Array                          └─ Next.js 15 Zustand Dashboard
```

### 1.3 Component Interactions & Signal Flow
1. **Physical Sensing:** Current sensors (ACS712) and voltage dividers output analog voltages (0–3.3 V) directly to the ESP32 ADC pins. The DS18B20 sends digitized temperature readings over a 1-Wire bus. The AC Mains Optocoupler outputs a digital binary signal indicating grid status (3.3 V for Grid Active, 0 V for Grid Outage).
2. **Local Control Loop:** The ESP32 evaluates these inputs against safety limits (overvoltage, overcurrent, thermal limits). If a threshold is violated, Core 0 bypasses communication and immediately toggles GPIO pins to trip the emergency relay (normally closed fail-safe) or shed loads.
3. **Telemetry Streaming:** During normal operation, digitized values are packaged into JSON on Core 1 and pushed at 1 Hz over a secure WebSocket client (`wss://`) connection to the FastAPI server.
4. **AI Energy Routing:** Every 15 minutes, the FastAPI server feeds the sliding historical telemetry window to the UAEO AI pipeline. The computed relay configuration is sent back as a control payload (`SET_RELAYS`).
5. **Relay Actuation:** The ESP32 receives the command payload, decodes the state flags, and activates the corresponding optocoupled relays to route power and manage loads.

---

## 2. 📈 Simulation Strategy

To ensure systematic validation, a multi-stage simulation workflow is adopted before prototyping.

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│        STAGE 1         │      │        STAGE 2         │      │        STAGE 3         │
│  System Power Flow &   │ ───► │  Embedded Firmware &   │ ───► │  Closed-Loop Hardware- │
│  Control Modeling     │      │   Sensor Interfacing   │      │  in-the-Loop Validation│
│   (MATLAB/Simulink)    │      │       (Proteus)        │      │   (Simulink + Proteus) │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
```

### 2.1 Simulation Phases & Rationale

#### Stage 1: Power & Control Simulation (MATLAB/Simulink & Simscape)
* **Why First:** We must validate the system-level physics, state-of-charge (SoC) estimation, power transient responses, and the core energy routing algorithm without risking microcontroller damage.
* **Scope:** 
  * Equivalent circuit model of the Li-ion battery.
  * Mathematical model of the PV array using variable solar irradiance inputs.
  * Multi-load configuration with prioritized shedding.
  * High-level stateflow logic simulating the decision rules.
* **Expected Outputs:** 
  * Stable DC bus voltage profiles during load switching.
  * Correct SoC tracking during charge/discharge phases.
  * Verification that load-shedding thresholds trigger at the correct battery SoC bounds (40%, 30%, 25%).
* **Validation Criteria:** DC bus voltage ripple remains under 1.0 V during sudden load changes, and critical load uptime remains 100%.

#### Stage 2: Embedded Firmware & Hardware Simulation (Proteus)
* **Why Second:** Once the electrical logic is validated, we translate it into microcontroller commands and verify firmware reliability, ADC noise handling, and I2C/1-Wire communication.
* **Scope:**
  * Virtual ESP32 MCU module with loaded C++ firmware hex file.
  * Simulated ACS712 current sensors (variable voltage inputs) and voltage divider paths.
  * DS18B20 1-Wire component, I2C 16x2 LCD display, and 8-channel relay matrix.
  * Virtual serial terminals simulating WebSocket telemetry streaming and receipt of remote commands.
* **Expected Outputs:** 
  * Correct LCD data rendering (`S: XX.XW B: XX.X%`).
  * Relay coil actuation on target GPIO pins matching the control logic.
  * Watchdog timer execution during simulated loop delays.
* **Validation Criteria:** Pin logic levels switch within <10 ms of a safety violation, and serial data frames comply with the ArduinoJson contract format.

#### Stage 3: Closed-Loop Data-Exchange Testing
* **Why Third:** Evaluates the edge-cloud control loop by interfacing the simulated hardware with the Python backend before actual deployment.
* **Scope:**
  * Interfacing Proteus's virtual serial port (using a virtual COM port tool) to the FastAPI server running locally.
  * Pushing simulated sensor telemetry from Proteus to FastAPI.
  * Receiving and executing remote relay commands inside Proteus.
* **Expected Outputs:**
  * Telemetry is successfully stored in a local Firebase Firestore emulator instance.
  * FastAPI dynamically sends override states, which actuate relays in the Proteus schema.
* **Validation Criteria:** Complete round-trip command execution latency remains under 200 ms.

---

## 3. 🛠️ Recommended Simulation Tools

| Tool | Core Domain | GridflowX Application | Engineering Rationale / Advantages |
|---|---|---|---|
| **MATLAB / Simulink & Simscape** | System-Level Power & Physics Modeling | Simulating PV panels, battery dynamics, DC bus transient behavior, and MPPT control algorithms. | High-fidelity physical libraries (Simscape Electrical) allow modeling of non-linear battery degradation and thermal models. |
| **Proteus VSM** | Embedded MCU & Firmware Verification | Visual schematic debugging of ESP32 GPIO, ADC input channels, 1-Wire DS18B20, I2C LCD, and optocoupled relays. | Real-time debugging of C++ firmware on virtual hardware; supports active probing of SPI/I2C packets. |
| **LTspice** | Analog Circuit & Power Supply Analysis | Simulating the buck converter step-down stages, ACS712 filtering, and ADC voltage divider protection circuits. | Superior speed and accuracy for micro-level switching regulators and analog noise filtering design. |
| **KiCad** | Schematic Capture & PCB Design | Creating final production-grade schematics, layout design, and 3D modeling of the microgrid PCB. | Open-source, robust design rule checking, native integration with modern fabrication workflows. |
| **PlatformIO** | Embedded Development Environment | Firmware writing, compiling, dependency management, and target flashing. | Multi-framework support; easily packages libraries like ArduinoJson, PubSubClient, and ESP32 core components. |

---

## 4. 🚀 Prototype Development Plan

A disciplined transition from model to machine ensures component safety and simplifies debugging.

```
       SIMULATION VALIDATION
                 │
                 ▼
       BREADBOARD PROTOTYPE (Single-module validation)
                 │
                 ▼
       STRIPBOARD ASSEMBLY (Robust electrical connections)
                 │
                 ▼
       PCB DESIGN & MANUFACTURING (Final production)
```

### 4.1 Step-by-Step Roadmap

```
Phase 1: Matlab & Proteus Validations (Weeks 1-2)
 ├── Simulate Simscape battery charge / discharge cycle
 ├── Validate ESP32 FreeRTOS Core 0 safety constraints in Proteus
 └── Establish virtual COM port integration from Proteus to local FastAPI Backend

Phase 2: Bench-Level Component Verification (Weeks 3-4)
 ├── Validate resistive voltage dividers with physical multimeter measurements
 ├── Calibrate ACS712 current sensor offset and scaling on a temporary breadboard
 └── Test the PC817 AC Mains Optocoupler digital logic output using a safe signal generator

Phase 3: Stripboard Integration & Lab Test (Weeks 5-6)
 ├── Solder ESP32, sensors, buck regulator, and relay control lines on stripboard
 ├── Mount DS18B20 to relay heatsink with thermal paste
 └── Run a continuous 24-hour endurance test with simulated solar / battery lines

Phase 4: Custom PCB Fabrication (Weeks 7-8)
 ├── Layout schematic in KiCad with isolation zones separating 230V AC lines from 3.3V DC logic
 ├── Manufacture, assemble, and test the custom PCB
 └── Package the PCB, LCD, and battery into a custom-ventilated 3D-printed enclosure
```

### 4.2 Pre-PCB Validation Checklist

Before manufacturing the custom PCB, the following components and subsystems must be validated:

* **ADC Calibration:** Verify that the resistive dividers never output more than 3.3 V to the ESP32 ADC pins when solar and battery lines are at maximum voltage (e.g., 20 V DC).
* **ACS712 Sensor Calibration:** Determine the zero-current voltage offset (nominally 2.5 V for a 5 V supply) and calibrate the current scaling factor.
* **Optocoupler Isolation:** Verify that the PC817 optocoupler provides complete isolation between the 230 V AC grid line and the 3.3 V ESP32 input pin.
* **Power Supply Stability:** Ensure the buck converter maintains a stable 5 V rail during relay switching events (when relay coils draw surge current).
* **Temperature Sensor Connectivity:** Confirm that the 1-Wire interface functions reliably with multiple sensors on the same line.

### 4.3 Risks & Mitigation Strategies

| Risk | Cause | Engineering Mitigation |
|---|---|---|
| **ESP32 ADC Non-Linearity** | ESP32 internal ADCs are highly non-linear, especially below 0.5 V and above 3.0 V. | Implement a calibration look-up table (LUT) or use an external I2C ADC (e.g., ADS1115) for high-precision voltage measurements. |
| **Relay Coil Back-EMF** | Inductive kickback when switching relays can cause ESP32 resets or brownouts. | Ensure optocoupler isolation is active and flyback diodes (e.g., 1N4007) are placed across all relay coils. |
| **High Voltage AC Hazards** | Routing 230 V AC mains close to low-voltage DC logic raises safety risks. | Maintain physical separation and routing isolation gaps on the PCB. Route AC traces with wide spacing and slot cutouts. |
| **Thermal Runaway** | Heatsink temperature exceeding limits during high charging/discharging phases. | Program a hard-coded thermal shutdown in the Core 0 FreeRTOS loop to isolate the battery if temperature exceeds 90°C. |

---

## 5. 📐 Simulation Architecture

### 5.1 MATLAB/Simulink Simscape Block Diagram Design
The Simulink model simulates the electrical characteristics of the microgrid:

```
                          ┌───────────────────────────┐
                          │    PV Array Model (PV)    │
                          └─────────────┬─────────────┘
                                        │
                                        ▼ (Solar Power)
┌─────────────────────────┐      ┌───────────┐      ┌─────────────────────────┐
│ Battery Model (Li-ion)  │◄────►│  Common   │◄────►│ Grid Rectifier Model    │
│ (Charge/Discharge Ctrl) │      │  DC Bus   │      │ (Mains AC Input)        │
└─────────────────────────┘      └─────┬─────┘      └─────────────────────────┘
                                       │
                                       ▼ (Power Flow)
                          ┌───────────────────────────┐
                          │  Prioritized Load Bank    │
                          │ (Tiers 1, 2, 3, 4 Relays) │
                          └───────────────────────────┘
```

* **PV Model:** Simscape Solar Cell block configured with irradiance inputs from historical profiles.
* **Battery Model:** Simscape Battery block with state-of-charge (SoC) estimation and thermal ports connected to a convective heat transfer block.
* **Switching Logic:** A Stateflow chart implementing the priority logic:
  * If $\text{SoC} < 25\%$, shed Tier 4 loads.
  * If $\text{SoC} < 30\%$, shed Tier 3 loads.
  * If $\text{SoC} < 40\%$, shed Tier 2 loads.

### 5.2 Proteus Embedded System Diagram
The Proteus schematic validates the microcontroller interface and firmware execution:

```
                              ┌───────────────────────┐
                              │    ESP32-WROOM-32E    │
                              │                       │
      [Solar Div]  ──(ADC)───►│ GPIO 34       GPIO 25 ├─(Digital)──► [Relay 1: Solar]
      [Bat Div]    ──(ADC)───►│ GPIO 36       GPIO 26 ├─(Digital)──► [Relay 2: Grid]
      [ACS712 S]   ──(ADC)───►│ GPIO 35       GPIO 27 ├─(Digital)──► [Relay 3: Battery]
      [ACS712 B]   ──(ADC)───►│ GPIO 33               │
      [DS18B20]   ──(1-Wire)─►│ GPIO 4        GPIO 14 ├─(Digital)──► [Relay 4: Tier 1]
      [Optocoupl] ──(Digital)─►│ GPIO 39       GPIO 12 ├─(Digital)──► [Relay 5: Tier 2]
                              │               GPIO 13 ├─(Digital)──► [Relay 6: Tier 3]
      [I2C LCD]   ◄──(I2C)────┤ GPIO 21/22    GPIO 15 ├─(Digital)──► [Relay 7: Tier 4]
      [Serial Terminal] ◄─────┤ GPIO 16/17    GPIO 2  ├─(Digital)──► [Relay 8: Emergency]
                              └───────────────────────┘
```

### 5.3 Co-Simulation & Data Exchange Methods
During development, MATLAB and Proteus can exchange data to perform closed-loop testing:

```
┌─────────────────────────┐               ┌─────────────────────────┐
│     MATLAB/Simulink     │               │       Proteus VSM       │
│  - Simulates PV/Battery │               │  - Runs ESP32 Firmware  │
│  - Sends physical values│  ◄─────────►  │  - Computes control     │
│    (V, I, SoC, Temp)    │ (TCP/UDP Socket│    signals (GPIO)       │
└─────────────────────────┘  or COM Port) └─────────────────────────┘
```

1. **TCP/UDP Socket Interface:** A custom Python script acts as a data bridge. It reads physical voltage/current signals from the running Simulink model (using Simulink Desktop Real-Time or TCP blocks) and formats them into serial commands for the Proteus virtual system.
2. **Virtual COM Port Interface:** Proteus features a COMPIM physical interface model. This model binds a virtual serial port (e.g., `COM3`) in the OS to the simulation. The Python/FastAPI service can connect directly to `COM3` to read telemetry and send commands, testing the entire communication chain.

---

## 6. 📦 Expected Deliverables

This section defines the key artifacts, test cases, and checklists required to verify the design before deployment.

### 6.1 Simulation Models & Code Artifacts
* **Simulink Model:** `gridflowx_simscape.slx` (incorporating Simscape Electrical power flow, battery equivalent circuit, and PV model).
* **Proteus Design File:** `gridflowx_schematic.pdsprj` (fully wired ESP32, sensors, relays, and I2C display).
* **Edge Firmware C++ Code:** `firmware.ino` (configured with Core 0 safety thresholds and Core 1 WebSocket connection logic).
* **Calibration Look-Up Table:** `adc_calibration.h` (compensating for ESP32 ADC non-linearity).

### 6.2 Validation Test Cases

| Test Case | Scenario | Stimulus | Expected Output | Pass Criteria |
|---|---|---|---|---|
| **TC-001** | Solar Yield Volatility | Fast drop in solar irradiance (1000 W/m² to 200 W/m² in 5 seconds) | System detects solar power drop; switches to battery as primary source within < 100 ms. | DC bus voltage remains stable at $12.0 \text{ V} \pm 0.5 \text{ V}$. |
| **TC-002** | Tiered Load Shedding | Battery SoC drops continuously from 45% to 20% | Relays trip sequentially at 40%, 30%, and 25%. Tier 1 (Critical) load remains powered. | Relays toggle at exact thresholds; Critical load never loses power. |
| **TC-003** | Overcurrent Shutdown | Simulated load current spikes above 5 A | Core 0 safety loop detects overcurrent on ADC; de-energizes Relay 8 (Emergency NC). | Emergency shutdown triggers in **< 10 ms**. |
| **TC-004** | Communication Loss | Disconnect WebSocket communication line | ESP32 detects timeout; switches LCD to display `CONN_LOST` and defaults to offline scheduling. | System continues local scheduling; no interruption to critical loads. |

### 6.3 Performance Metrics & Benchmarks
The simulation must meet the following performance benchmarks before physical prototyping:

```
                                PERFORMANCE TARGETS
       ┌───────────────────────────────┬───────────────────────────────┐
       │            METRIC             │            TARGET             │
       ├───────────────────────────────┼───────────────────────────────┤
       │ Failsafe Trigger Latency      │ < 10 ms                       │
       │ DC Bus Voltage Ripple         │ < 1.0 V during load switching │
       │ ESP32 ADC Resolution          │ 12-bit (0 - 4095 counts)      │
       │ LSTM Prediction Horizon       │ 1 Hour                        │
       │ Solar Yield Forecast MAE      │ <= 12%                        │
       │ Load Demand Forecast MAPE     │ <= 8%                         │
       └───────────────────────────────┴───────────────────────────────┘
```

### 6.4 Prototype Verification Checklist
This checklist must be signed off by the engineering team before releasing the design for custom PCB fabrication:

- [ ] **Simulink Physics Check:** All Simscape power runs show stable voltage profiles under varying solar conditions.
- [ ] **Proteus Firmware Verification:** Embedded code runs on the virtual ESP32 without memory leaks or unexpected resets.
- [ ] **Failsafe Asserted:** Hardware emergency shutdown (NC Relay) functions correctly under simulated thermal/overcurrent states.
- [ ] **ADC Calibration Configured:** Voltage and current ADC curves mapped to correct physical scale values.
- [ ] **Electrical Isolation Confirmed:** AC optocoupler isolation barrier verified in schematic.
- [ ] **Communication Contract Validated:** WebSocket JSON schema matches the FastAPI API specification.
- [ ] **Co-Simulation Loop Pass:** Python FastAPI service reads telemetry and drives relays through the Proteus COM interface.

---

*Document Author:* Platform Architecture Team  
*Approved By:* Embedded Systems Lead  
*Date of Issue:* July 10, 2026  
