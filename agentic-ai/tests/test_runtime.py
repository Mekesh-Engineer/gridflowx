"""
Unit Tests for Agentic AI Runtime and Model Routing
"""

import sys
import os
import unittest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from runtime.router import model_router, TaskType, ModelTarget
from runtime.ollama_cloud import ollama_cloud_client


class TestRuntimeAndRouting(unittest.TestCase):
    def test_model_routing_general_chat(self):
        target = model_router.route_task(TaskType.GENERAL_CHAT)
        self.assertEqual(target, ModelTarget.GEMMA4_31B)

    def test_model_routing_dispatch_optimization(self):
        target = model_router.route_task(TaskType.DISPATCH_OPTIMIZATION)
        self.assertEqual(target, ModelTarget.GPT_OSS_120B)

    def test_model_routing_fault_diagnostics(self):
        target = model_router.route_task(TaskType.FAULT_DIAGNOSTICS)
        self.assertEqual(target, ModelTarget.GPT_OSS_120B)

    def test_model_client_list_models(self):
        models = ollama_cloud_client.get_available_models()
        self.assertIn("gemma4:31b-cloud", models)
        self.assertIn("gpt-oss:120b-cloud", models)


if __name__ == "__main__":
    unittest.main()
