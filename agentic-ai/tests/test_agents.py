"""
Unit Tests for Specialized Agents and Failsafe Envelope
"""

import sys
import os
import unittest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from agents.solar.solar_agent import solar_agent
from agents.load.load_agent import load_agent
from agents.battery.battery_agent import battery_agent
from agents.fault.fault_agent import fault_agent
from safety.failsafe_envelope import failsafe_envelope


class TestSpecializedAgents(unittest.TestCase):
    def test_solar_forecast(self):
        res = solar_agent.forecast_sync("GFX-ESP32-MASTER-01", 24)
        self.assertEqual(len(res.dataPoints), 24)
        self.assertGreaterEqual(res.dataPoints[0].predictedYieldW, 0.0)

    def test_load_forecast(self):
        res = load_agent.forecast_sync("GFX-ESP32-MASTER-01", 24)
        self.assertEqual(len(res.dataPoints), 24)
        self.assertGreater(res.peakDemandW, 0.0)

    def test_battery_assessment(self):
        telemetry = {
            "batteryVoltage": 51.2,
            "batteryCurrent": 10.0,
            "batteryTemp": 25.0,
            "batterySoc": 80.0
        }
        res = battery_agent.assess_sync(telemetry)
        self.assertGreaterEqual(res.stateOfChargePct, 0.0)
        self.assertLessEqual(res.stateOfChargePct, 100.0)
        self.assertIn(res.degradationStatus, ["OPTIMAL", "MODERATE", "ACCELERATED", "CRITICAL"])

    def test_failsafe_tier1_lock(self):
        # Relay 0 and 1 are critical infrastructure
        curr = [True, True, False, False, False, False, False, False]
        # Attempt to shut off Relay 0 as normal operator
        proposed = [False, True, False, False, False, False, False, False]
        safe, modified, reason = failsafe_envelope.validate_and_filter_relays(
            current_relays=curr,
            proposed_relays=proposed,
            telemetry={"batterySoc": 50.0},
            actor_role="operator"
        )
        # Should force Relay 0 to remain True
        self.assertTrue(safe[0])
        self.assertTrue(modified)


if __name__ == "__main__":
    unittest.main()
