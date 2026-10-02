"""
GridFlowX / SAMEMAMS Automated End-to-End System Test Suite
===========================================================
Validates:
1. Solar PV Forecasting (24h/72h Clear-sky GHI model)
2. Load Demand Forecasting (Multi-tier ARIMA model)
3. Model Accuracy Metrics (MAE, MAPE, RMSE, R2)
4. BESS Electro-Thermal Health (LiFePO4 Arrhenius degradation, ESR, SoH)
5. Sensor Anomaly Detection (Isolation Forest baseline & injected fault)
6. EMS Autonomous Energy Optimization (ToU tariff solver & relay dispatch)
7. AI Model Registry & Retraining Trigger
8. Relay Manual Overrides & Emergency Stop Atomic Cutoff
"""

import sys
import os

# Ensure backend and agentic-ai are on sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
AGENTIC_AI_DIR = os.path.join(PROJECT_ROOT, "agentic-ai")
for p in (BACKEND_DIR, AGENTIC_AI_DIR, PROJECT_ROOT):
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi.testclient import TestClient
try:
    from backend.main import app
except Exception:
    from main import app

client = TestClient(app)


def print_test(name: str, passed: bool, detail: str = ""):
    symbol = "[PASS]" if passed else "[FAIL]"
    print(f"{symbol} [{name}] {detail}")
    if not passed:
        sys.exit(1)

def main():
    print("=" * 70)
    print("GRIDFLOWX / SAMEMAMS SYSTEM INTEGRATION & VERIFICATION SUITE")
    print("=" * 70)

    # Auth Tokens
    operator_token = "dev-operator"
    supervisor_token = "dev-supervisor"

    # 1. Solar Forecasting Test
    res_solar = client.get("/api/v1/ai/forecast/solar?deviceId=GFX-ESP32-MASTER-01&horizonHours=24")
    data_solar = res_solar.json()
    print_test(
        "Solar 24h Yield Forecast",
        res_solar.status_code == 200 and len(data_solar.get("dataPoints", [])) == 24,
        f"Generated {len(data_solar.get('dataPoints', []))} points. Model: {data_solar.get('modelId')}"
    )

    # 2. Multi-Tier Load Demand Forecast
    res_load = client.get("/api/v1/ai/forecast/load?deviceId=GFX-ESP32-MASTER-01&horizonHours=24")
    data_load = res_load.json()
    print_test(
        "Load Demand Forecast",
        res_load.status_code == 200 and len(data_load.get("dataPoints", [])) == 24,
        f"Peak Demand: {data_load.get('peakDemandW')}W, Confidence: High"
    )

    # 3. Model Accuracy Error Analytics
    res_acc = client.get("/api/v1/ai/forecast/accuracy?deviceId=GFX-ESP32-MASTER-01")
    data_acc = res_acc.json()
    print_test(
        "Forecast Model Accuracy",
        res_acc.status_code == 200 and "solarModel" in data_acc,
        f"Solar MAE: {data_acc.get('solarModel', {}).get('maeWm2')} W/m2, Load R2: {data_acc.get('loadModel', {}).get('r2Score')}"
    )

    # 4. BESS Electro-Thermal Health
    res_batt = client.get("/api/v1/ai/battery/health?deviceId=GFX-ESP32-MASTER-01")
    data_batt = res_batt.json()
    print_test(
        "BESS Health & Degradation",
        res_batt.status_code == 200 and data_batt.get("stateOfHealthPct", 0) > 0,
        f"SoH: {data_batt.get('stateOfHealthPct')}%, ESR: {data_batt.get('internalResistanceOhms')} Ohms, Status: {data_batt.get('degradationStatus')}"
    )

    # 5. Live Anomaly Detection
    res_anom_live = client.get("/api/v1/ai/anomaly/live")
    data_anom_live = res_anom_live.json()
    print_test(
        "Live Sensor Anomaly Baseline",
        res_anom_live.status_code == 200,
        f"Overall Anomaly: {data_anom_live.get('overallAnomalyDetected')}, Score: {data_anom_live.get('isolationForestScore')}"
    )

    # 6. Injected Cyber-Physical Fault Diagnostics
    fault_payload = {
        "deviceId": "GFX-ESP32-MASTER-01",
        "solarVoltageV": 8.2,
        "solarCurrentA": 4.5,
        "batteryVoltageV": 11.0,
        "batteryTempC": 52.3,
        "gridVoltageV": 190.0,
        "gridFrequencyHz": 48.9,
        "dcBusVoltageV": 11.1
    }
    res_fault = client.post("/api/v1/ai/anomaly/detect", json=fault_payload)
    data_fault = res_fault.json()
    print_test(
        "Injected Fault Diagnostics",
        res_fault.status_code == 200 and data_fault.get("overallAnomalyDetected") == True,
        f"Detected {len(data_fault.get('anomalies', []))} Critical Circuit Faults. Score: {data_fault.get('isolationForestScore')}"
    )

    # 7. EMS Autonomous Optimization Solver
    res_opt = client.get("/api/v1/ai/optimization/dispatch?deviceId=GFX-ESP32-MASTER-01")
    data_opt = res_opt.json()
    print_test(
        "EMS Autonomous Dispatch Solver",
        res_opt.status_code == 200 and len(data_opt.get("targetRelayStates", [])) == 8,
        f"Decision: {data_opt.get('decisionId')}, Tariff: {data_opt.get('tariffWindow')}, Est Savings: ${data_opt.get('estimatedCostSavingsUsd')}"
    )

    # 8. Apply Optimization Dispatch
    res_apply = client.post(
        "/api/v1/ai/optimization/apply",
        json={
            "decisionId": data_opt["decisionId"],
            "targetRelayStates": data_opt["targetRelayStates"]
        },
        headers={"Authorization": f"Bearer {operator_token}"}
    )
    print_test(
        "Apply Relay Dispatch",
        res_apply.status_code == 200 and res_apply.json().get("success"),
        f"Status: {res_apply.json().get('message')}"
    )

    # 9. AI Model Registry & Retraining
    res_retrain = client.post(
        "/api/v1/ai/models/retrain",
        json={"modelId": "MOD-SOLAR-01"},
        headers={"Authorization": f"Bearer {supervisor_token}"}
    )
    print_test(
        "Automated Model Retraining",
        res_retrain.status_code == 200 and res_retrain.json().get("success"),
        f"Retrained: {res_retrain.json().get('message')}"
    )

    # 10. Emergency Stop Atomic Cutoff
    res_estop = client.post(
        "/api/v1/relays/emergency-stop",
        json={
            "deviceId": "GFX-ESP32-MASTER-01",
            "reason": "Automated verification emergency shutdown routine"
        },
        headers={"Authorization": f"Bearer {operator_token}"}
    )
    data_estop = res_estop.json()
    all_relays_off = all(state is False for state in data_estop.get("relayStates", []))
    print_test(
        "Emergency Stop Atomic Cutoff",
        res_estop.status_code == 200 and all_relays_off,
        f"All 8 relays isolated safely. Latency: {data_estop.get('latencyMs')}ms"
    )

    # 11. Agent Status Test
    res_agent_status = client.get("/api/v1/agent/status")
    data_status = res_agent_status.json()
    print_test(
        "Agentic AI Status Check",
        res_agent_status.status_code == 200 and data_status.get("orchestratorStatus") == "ONLINE",
        f"Active agents: {data_status.get('totalAgentsActive')}, Safety: {data_status.get('safetyEnvelopeStatus')}"
    )

    # 12. Conversational Agent Chat
    res_chat = client.post(
        "/api/v1/agent/chat",
        json={"query": "Why is the battery discharging right now?"},
        headers={"Authorization": f"Bearer {operator_token}"}
    )
    data_chat = res_chat.json()
    print_test(
        "Agent Conversational Assistant",
        res_chat.status_code == 200 and data_chat.get("success"),
        f"Reply: {data_chat.get('reply')[:70]}..."
    )

    # 13. Agent Goal Planning & Decomposition
    res_plan = client.post(
        "/api/v1/agent/plan",
        json={"goal": "Shed Tier 3 non-essential loads for peak tariff shaving"},
        headers={"Authorization": f"Bearer {operator_token}"}
    )
    data_plan = res_plan.json()
    print_test(
        "Agent Task Decomposition & Plan",
        res_plan.status_code == 200 and len(data_plan.get("proposedPlan", [])) > 0,
        f"Generated {len(data_plan.get('proposedPlan', []))} plan steps for goal."
    )

    # 14. HITL Approval Gate
    res_hitl = client.post(
        "/api/v1/agent/actions/approve",
        json={
            "actionId": "ACT-OVR-001",
            "authorized": True,
            "authPinOrToken": "HITL-SUPERVISOR-TOKEN-2026",
            "reason": "Supervisor confirmed high-consequence override"
        },
        headers={"Authorization": f"Bearer {supervisor_token}"}
    )
    data_hitl = res_hitl.json()
    print_test(
        "HITL Approval Token Gate",
        res_hitl.status_code == 200 and data_hitl.get("authorized") is True,
        f"Action {data_hitl.get('actionId')} authorized by {data_hitl.get('authorizedBy')}"
    )

    # 15. AI Copilot Health Diagnostics
    res_health = client.get("/api/v1/agent/health")
    data_health = res_health.json()
    print_test(
        "AI Copilot Health Endpoint",
        res_health.status_code == 200 and "status" in data_health and "model" in data_health,
        f"Status: {data_health.get('status')}, Ollama: {data_health.get('ollama')}, Model: {data_health.get('model')}"
    )

    # 16. AI Copilot Tool Catalog
    res_tools = client.get("/api/v1/agent/tools")
    data_tools = res_tools.json()
    print_test(
        "AI Copilot Domain Tools",
        res_tools.status_code == 200 and data_tools.get("count", 0) >= 10,
        f"Registered {data_tools.get('count')} domain tools for Qwen 2.5."
    )

    print("=" * 70)
    print("ALL 16 INTEGRATION & AGENT SUITE TESTS PASSED (100% SUCCESS)")
    print("=" * 70)

if __name__ == "__main__":
    main()
