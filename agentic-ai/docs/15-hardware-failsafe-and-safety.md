# 🛡️ Safety 15: Hardware Failsafe & Electrical Safety Specification

**Document ID:** `GFX-AI-SPEC-15`  
**Classification:** Critical Safety Standard & Hardware Protection Specification  
**Version:** `1.0.0-PROD`  
**Target Subsystems:** FastAPI Safety Gate · ESP32 Core 0 Firmware · 8-Channel Relay Matrix  
**Principle:** $\boxed{\text{AI Proposes} \neq \text{Hardware Executes}}$  

---

## 1. Safety Philosophy & Absolute Invariants
The GridFlowX cyber-physical microgrid enforces a strict **zero-trust boundary** between AI-generated dispatch proposals and physical electrical contactors. AI agents (including Deep RL policies and LLM orchestrators) operate strictly in an advisory capacity. **No software command can bypass the deterministic Hardware Failsafe Envelope or the ESP32 Core 0 hardware interlock loop.**

```
┌─────────────────────────────────────────────────────────────┐
│ 🧠 AI Advisory Layer (Optimization & Forecasting)          │
│ Proposes candidate relay states and battery setpoints       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Candidate Proposal
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 🛡️ Layer 1: Software Failsafe Gatekeeper (FastAPI)          │
│ Evaluates voltage, current, SoC, and thermal boundary guards│
└──────────────────────────────┬──────────────────────────────┘
                               │ Approved Command Payload
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 🔌 Layer 2: Edge Firmware Safety Loop (ESP32 Core 0 100Hz)  │
│ Hardware interlocks, break-before-make delays, ADC limits   │
└──────────────────────────────┬──────────────────────────────┘
                               │ GPIO Pin Actuation
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ ⚡ Layer 3: Physical Contactors & Relays                    │
│ Optocoupled isolation, Normally Closed (NC) Emergency Relay │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Deterministic Safety Boundaries

| Parameter | Nominal Range | Soft Warning | Hard Failsafe Trip | Deterministic Action |
| :--- | :---: | :---: | :---: | :--- |
| **Battery Terminal Voltage ($12V$ Pack)** | $11.5\,V - 14.4\,V$ | $< 10.8\,V$ or $> 14.8\,V$ | $< 9.0\,V$ or $> 15.2\,V$ | Open Relay 3 (Battery Charger); shed non-critical load tiers. |
| **Battery State of Charge (SoC %)** | $20.0\,\% - 90.0\,\%$ | $< 25.0\,\%$ | $< 2.0\,\%$ | Inhibit battery discharge; trip Relay 8 Emergency Cutoff. |
| **MOSFET Heatsink Temp** | $25.0^\circ C - 55.0^\circ C$ | $> 70.0^\circ C$ | $> 85.0^\circ C$ | Open Relay 1 (Disable Solar MPPT); clamp charging current to $0\,A$. |
| **Battery Cell Surface Temp** | $20.0^\circ C - 40.0^\circ C$ | $> 45.0^\circ C$ | $> 55.0^\circ C$ | Clamp battery current setpoint to $0.0\,A$; sound operator alarm. |
| **DC Bus Voltage Ripple ($\sigma_{V_{\text{bus}}}$)**| $< 0.3\,V_{\text{RMS}}$ | $> 0.8\,V_{\text{RMS}}$ | $> 1.2\,V_{\text{RMS}}$ | Inhibit high-power inverter switching; flag capacitor wear. |
| **Channel Continuous Current** | $0.0\,A - 3.5\,A$ | $> 4.2\,A$ | $> 5.0\,A$ | Instantaneous (<10ms) GPIO LOW cutoff on ESP32 Core 0. |

---

## 3. Hardware Interlocks & Physical Invariants
1. **Tier 1 Critical Load Protection (Relay 4):** Hardwired in firmware as ALWAYS ENABLED. Any software command attempting to set Relay 4 to `false` is immediately rejected.
2. **Contactor Interlocking (Break-Before-Make):** Switching between Solar, Battery, and Grid fallback lines enforces a mandatory $50\,\text{ms}$ dead-time in firmware to prevent dead short-circuits across AC/DC buses.
3. **Emergency Shutdown Relay (Relay 8):** Configured as Normally Closed (NC). When de-energized (by firmware trip or power loss), it instantly drops all physical load paths.

---

## 4. Software Failsafe Gatekeeper Implementation

```python
# src/safety/failsafe_envelope.py
from typing import Dict, Any, Tuple, List

def evaluate_safety_envelope(candidate_action: Dict[str, Any], current_state: Dict[str, Any]) -> Tuple[bool, Dict[str, Any], List[Dict[str, Any]]]:
    """
    Deterministic validator that clamps AI candidate actions to the safe operating envelope.
    """
    violations = []
    safe_action = candidate_action.copy()
    relays = safe_action.get("relays", [True]*8)
    bat_current = safe_action.get("battery_current_setpoint", 0.0)

    # 1. Invariant: Tier 1 Critical Load (Channel 4 / index 3) MUST NEVER be OFF
    if not relays[3]:
        relays[3] = True
        violations.append({"rule": "TIER1_PROTECTION", "severity": "ABSOLUTE", "msg": "Tier 1 shed rejected."})

    # 2. Battery SoC Floor Guard
    soc = current_state.get("battery_soc", 50.0)
    if soc < 20.0 and bat_current < 0: # Discharge requested
        bat_current = 0.0
        violations.append({"rule": "SOC_FLOOR_GUARD", "severity": "HIGH", "msg": "Discharge inhibited: SoC < 20%."})

    # 3. Thermal Over-Temperature Cutoff
    heatsink_temp = current_state.get("heatsink_temp", 30.0)
    if heatsink_temp > 85.0:
        bat_current = 0.0
        relays[0] = False # Disable solar MPPT path
        violations.append({"rule": "THERMAL_CUTOFF", "severity": "CRITICAL", "msg": "Heatsink > 85C: MPPT disabled."})

    # 4. Current Clamp
    bat_current = max(-5.0, min(5.0, bat_current))

    safe_action["relays"] = relays
    safe_action["battery_current_setpoint"] = bat_current
    is_safe = len(violations) == 0

    return is_safe, safe_action, violations
```

---

## 5. ESP32 Core 0 Hardware Safety Loop (C++ FreeRTOS)

```cpp
// ESP32 Core 0: 100Hz Safety Task
void Core0_SafetyLoop(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();
    const TickType_t xFrequency = pdMS_TO_TICKS(10); // 100 Hz

    for(;;) {
        float v_solar = readSolarVoltage();
        float i_solar = readSolarCurrent();
        float v_batt  = readBatteryVoltage();
        float i_batt  = readBatteryCurrent();
        float t_hs    = readHeatsinkTemp();

        // 1. Instantaneous Overcurrent Protection
        if (fabs(i_solar) > 5.0 || fabs(i_batt) > 5.0) {
            digitalWrite(RELAY_8_EMERGENCY_PIN, LOW); // Cut loads instantly (<10ms)
            triggerEmergencyState("HARDWARE_OVERCURRENT_TRIP");
        }

        // 2. Over-Temperature Thermal Trip
        if (t_hs > 85.0) {
            digitalWrite(RELAY_1_SOLAR_PIN, LOW); // Disconnect solar MPPT
        }

        // 3. Enforce Tier 1 ALWAYS ON
        digitalWrite(RELAY_4_TIER1_PIN, HIGH);

        vTaskDelayUntil(&xLastWakeTime, xFrequency);
    }
}
```

---

## 6. Implementation Checklist
- [ ] Implement `src/safety/failsafe_envelope.py` and unit test with 1,000 randomized state vectors.
- [ ] Verify ESP32 Core 0 100 Hz FreeRTOS safety loop with oscilloscope and current load bench.
- [ ] Validate emergency shutdown test: Relay 8 de-energizes in $<10\,\text{ms}$.
- [ ] Confirm Human-in-the-Loop approval modal challenges operator for high-risk contactor overrides.
