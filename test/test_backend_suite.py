"""
GridFlowX Enterprise Backend Integration & API Verification Suite
=================================================================
Validates the complete REST API surface of backend/main.py:
1. Health & Status Endpoints (/health, /api/health, /api/v1/agent/health)
2. Live Telemetry & History Streaming (/api/v1/telemetry/live, /history)
3. 8-Relay Failsafe Control & Emergency Cutoff (/api/v1/relays/state, /control, /emergency-stop, /reset-safety)
4. Energy Analytics & Nodal Power Flows (/api/v1/energy/summary, /power-flow)
5. Microgrid Device Management (/api/v1/devices)
6. Alerts & Notifications (/api/v1/alerts)
7. Specialized AI Forecasting & Battery Diagnostics (/api/v1/ai/forecast/*, /battery/*)
8. Autonomous Dispatch Optimization (/api/v1/ai/optimize/dispatch)
9. AI Copilot Conversational & Planning Gateway (/api/v1/agent/chat, /plan)
"""

import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
for p in (PROJECT_ROOT, os.path.join(PROJECT_ROOT, "backend"), os.path.join(PROJECT_ROOT, "agentic-ai")):
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def assert_test(name: str, passed: bool, detail: str = ""):
    symbol = "[PASS]" if passed else "[FAIL]"
    print(f"{symbol} [{name}] {detail}")
    if not passed:
        sys.exit(1)


def main():
    print("=" * 70)
    print("GRIDFLOWX ENTERPRISE BACKEND REST API VERIFICATION SUITE")
    print("=" * 70)

    # 1. Health Endpoints
    res = client.get("/health")
    assert_test(
        "Health Endpoint",
        res.status_code == 200 and res.json().get("status") == "healthy",
        f"Status: {res.json().get('status')}"
    )

    res_api = client.get("/api/health")
    assert_test(
        "API Health Alias",
        res_api.status_code == 200 and res_api.json().get("service") == "gridflowx-backend",
        f"Service: {res_api.json().get('service')}"
    )

    # 2. Live Telemetry
    res_telem = client.get("/api/v1/telemetry/live")
    d_telem = res_telem.json()
    assert_test(
        "Live Telemetry Stream",
        res_telem.status_code == 200 and "gridVoltage" in d_telem and len(d_telem.get("relayStates", [])) == 8,
        f"Vgrid: {d_telem.get('gridVoltage')}V, Relays: {d_telem.get('relayStates')}"
    )

    res_hist = client.get("/api/v1/telemetry/history?limit=10")
    assert_test(
        "Telemetry History",
        res_hist.status_code == 200,
        f"Returned frames: {len(res_hist.json())}"
    )

    # 3. Relay State & Control
    res_relays = client.get("/api/v1/relays/state")
    assert_test(
        "Relay States Inspection",
        res_relays.status_code == 200 and len(res_relays.json().get("relayStates", [])) == 8,
        f"Relays: {res_relays.json().get('relayStates')}"
    )

    # Relay 4 (Non-critical lighting) toggle
    res_toggle = client.post(
        "/api/v1/relays/control",
        json={"relayIndex": 4, "state": True, "reason": "Test non-critical toggle"},
        headers={"Authorization": "Bearer dev-operator"}
    )
    assert_test(
        "Relay 4 Toggle",
        res_toggle.status_code == 200 and res_toggle.json().get("success") is True,
        f"New State: {res_toggle.json().get('newState')}"
    )

    # Relay 0 Tier 1 Protection Test
    res_tier1 = client.post(
        "/api/v1/relays/control",
        json={"relayIndex": 0, "state": False, "reason": "Attempting to cut Life Support"},
        headers={"Authorization": "Bearer dev-operator"}
    )
    assert_test(
        "Failsafe Tier 1 Interlock Protection",
        res_tier1.status_code == 200 and res_tier1.json().get("newState") is True and res_tier1.json().get("wasSafetyOverridden") is True,
        f"Safety Protected: {res_tier1.json().get('safetyExplanation')}"
    )

    # Emergency Stop
    res_estop = client.post("/api/v1/relays/emergency-stop", headers={"Authorization": "Bearer dev-operator"})
    assert_test(
        "Emergency Stop Cutoff",
        res_estop.status_code == 200 and res_estop.json().get("emergencyLatched") is True,
        f"Latched: {res_estop.json().get('emergencyLatched')}"
    )

    # Reset Safety
    res_reset = client.post("/api/v1/relays/reset-safety", headers={"Authorization": "Bearer dev-admin"})
    assert_test(
        "Reset Safety Latch",
        res_reset.status_code == 200 and res_reset.json().get("emergencyLatched") is False,
        "Safety latch cleared successfully."
    )

    # 4. Energy Summary & Power Flow
    res_energy = client.get("/api/v1/energy/summary")
    assert_test(
        "Energy Analytics Summary",
        res_energy.status_code == 200 and "solarGenerationKwh" in res_energy.json(),
        f"Solar Gen: {res_energy.json().get('solarGenerationKwh')} kWh, Self-cons: {res_energy.json().get('selfConsumptionRatePct')}%"
    )

    res_flow = client.get("/api/v1/energy/power-flow")
    assert_test(
        "Nodal Power Flow",
        res_flow.status_code == 200 and "solarToLoadW" in res_flow.json(),
        f"Solar->Load: {res_flow.json().get('solarToLoadW')}W"
    )

    # 5. Device Management
    res_devs = client.get("/api/v1/devices")
    assert_test(
        "Connected Devices Registry",
        res_devs.status_code == 200 and len(res_devs.json()) >= 3,
        f"Active devices found: {len(res_devs.json())}"
    )

    # 6. Alerts
    res_alerts = client.get("/api/v1/alerts")
    assert_test(
        "System Alerts Registry",
        res_alerts.status_code == 200 and len(res_alerts.json()) >= 1,
        f"Alerts logged: {len(res_alerts.json())}"
    )

    # 7. AI Forecasting & Diagnostics
    res_solar = client.get("/api/v1/ai/forecast/solar?horizonHours=24")
    assert_test(
        "Solar 24h Prediction via Backend",
        res_solar.status_code == 200 and len(res_solar.json().get("dataPoints", [])) == 24,
        f"Model: {res_solar.json().get('modelId')}"
    )

    res_load = client.get("/api/v1/ai/forecast/load?horizonHours=24")
    assert_test(
        "Load Demand Prediction via Backend",
        res_load.status_code == 200 and len(res_load.json().get("dataPoints", [])) == 24,
        f"Peak Demand: {res_load.json().get('peakDemandW')}W"
    )

    res_batt = client.get("/api/v1/ai/battery/health")
    assert_test(
        "BESS Health Assessment via Backend",
        res_batt.status_code == 200 and "stateOfHealthPct" in res_batt.json(),
        f"SoH: {res_batt.json().get('stateOfHealthPct')}%, Status: {res_batt.json().get('degradationStatus')}"
    )

    res_anomaly = client.post("/api/v1/ai/anomalies/detect")
    assert_test(
        "Sensor Anomaly Diagnostics via Backend",
        res_anomaly.status_code == 200 and "overallAnomalyDetected" in res_anomaly.json(),
        f"Anomaly: {res_anomaly.json().get('overallAnomalyDetected')}"
    )

    # 8. Optimization Dispatch
    res_opt = client.post("/api/v1/ai/optimize/dispatch")
    assert_test(
        "Autonomous Energy Optimization via Backend",
        res_opt.status_code == 200 and "decisionId" in res_opt.json(),
        f"Decision ID: {res_opt.json().get('decisionId')}, Relays: {res_opt.json().get('targetRelayStates')}"
    )

    # 9. AI Copilot Gateway
    res_chat = client.post(
        "/api/v1/agent/chat",
        json={"message": "Who developed GridFlowX?"},
        headers={"Authorization": "Bearer dev-operator"}
    )
    d_chat = res_chat.json()
    assert_test(
        "AI Copilot Conversational Chat",
        res_chat.status_code == 200 and "Mekeshkumar" in d_chat.get("reply", ""),
        f"Reply snippet: {d_chat.get('reply', '')[:60]}..."
    )

    res_plan = client.post(
        "/api/v1/agent/plan",
        json={"goal": "Optimize tariff peak shaving and charge battery"},
        headers={"Authorization": "Bearer dev-operator"}
    )
    assert_test(
        "AI Agent Goal Decomposition",
        res_plan.status_code == 200 and len(res_plan.json().get("decomposedPlan", [])) >= 1,
        f"Decomposed steps: {len(res_plan.json().get('decomposedPlan', []))}"
    )

    res_agent_health = client.get("/api/v1/agent/health")
    assert_test(
        "Agentic AI System Health",
        res_agent_health.status_code == 200 and "status" in res_agent_health.json() and len(res_agent_health.json().get("cloudModels", [])) >= 2,
        f"Status: {res_agent_health.json().get('status')}, Cloud Models: {res_agent_health.json().get('cloudModels')}"
    )

    print("=" * 70)
    print("ALL 18 BACKEND REST API ENDPOINTS VALIDATED SUCCESSFULLY (100% PASS)")
    print("=" * 70)


if __name__ == "__main__":
    main()
