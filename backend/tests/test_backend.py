"""
GridFlowX Backend Unittest Suite
=================================
Validates backend API routes, services, safety interlocks, and agentic AI integration.
"""

import unittest
from starlette.testclient import TestClient
from backend.main import app


class TestBackendAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json().get("status"), "healthy")

    def test_live_telemetry(self):
        res = self.client.get("/api/v1/telemetry/live")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("gridVoltage", data)
        self.assertIn("relayStates", data)
        self.assertEqual(len(data["relayStates"]), 8)

    def test_relay_states(self):
        res = self.client.get("/api/v1/relays/states")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("relayStates", data)
        self.assertEqual(len(data["relayStates"]), 8)

    def test_relay_tier1_safety(self):
        # Disconnecting Channel 0 (Tier 1 critical load) must be safety-overridden and kept True
        res = self.client.post(
            "/api/v1/relays/control",
            json={"relayIndex": 0, "state": False, "reason": "Attempting to cut Tier 1 load"},
            headers={"Authorization": "Bearer dev-operator"},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("newState"))
        self.assertTrue(data.get("wasSafetyOverridden"))
        self.assertIn("Tier 1 Critical Load", data.get("safetyExplanation", ""))

    def test_energy_summary(self):
        res = self.client.get("/api/v1/energy/summary")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("solarGenerationKwh", data)

    def test_connected_devices(self):
        res = self.client.get("/api/v1/devices")
        self.assertEqual(res.status_code, 200)
        devices = res.json()
        self.assertIsInstance(devices, list)
        self.assertGreaterEqual(len(devices), 1)

    def test_ai_copilot_health(self):
        res = self.client.get("/api/v1/agent/health")
        self.assertEqual(res.status_code, 200)
        self.assertIn(str(res.json().get("status")).lower(), ["operational", "ready", "standby", "healthy"])


if __name__ == "__main__":
    unittest.main()
