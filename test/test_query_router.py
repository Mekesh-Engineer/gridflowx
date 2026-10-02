"""
Targeted Verification of GridFlowX AI Query Router & Intent Grounding
"""

import sys
import os

# Ensure agentic-ai is on sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AGENTIC_AI_DIR = os.path.join(PROJECT_ROOT, "agentic-ai")
if AGENTIC_AI_DIR not in sys.path:
    sys.path.insert(0, AGENTIC_AI_DIR)

from agents.orchestrator.query_router import query_router
from rag.retriever import retriever
from services.llm_service import local_llm_service

def test_developer_query():
    q = "what is the developer name built this gridflowx ai integrated web app system?"
    config = query_router.route_query(q, "operator")
    print(f"[TEST 1] Query: '{q}'")
    print(f"  Intents: {config.intents}")
    print(f"  Primary: {config.primary_intent}")
    print(f"  Requires Telemetry: {config.requires_telemetry}")
    print(f"  Is Direct Metadata: {config.is_direct_metadata_query}")
    assert "DEVELOPER_INFORMATION" in config.intents, "Expected DEVELOPER_INFORMATION intent"
    assert config.requires_telemetry is False, "Developer query should NOT require telemetry"

    # Test Fallback Generation
    fallback = local_llm_service._heuristic_fallback(q, {}, "operator", config)
    print(f"  Reply: {fallback['reply']}")
    print(f"  Snippet: {fallback['telemetrySnippet']}")
    assert "Mekeshkumar (Mekesh)" in fallback["reply"], "Developer name missing in response"
    assert "Mk Studios" in fallback["reply"], "Studio name missing in response"
    assert "Kongu Engineering College" in fallback["reply"], "Institution missing in response"
    assert fallback["telemetrySnippet"] is None, "Telemetry snippet should be None for metadata query"
    print("  --> PASS: Developer Query Grounded Correctly!\n")

def test_ai_models_query():
    q = "What AI models are used in GridFlowX?"
    config = query_router.route_query(q, "operator")
    print(f"[TEST 2] Query: '{q}'")
    print(f"  Intents: {config.intents}")
    assert "AI_MODEL" in config.intents, "Expected AI_MODEL intent"
    assert config.requires_telemetry is False, "Model query should NOT require telemetry"

    fallback = local_llm_service._heuristic_fallback(q, {}, "operator", config)
    print(f"  Reply: {fallback['reply'][:150]}...")
    assert "SolarNet" in fallback["reply"] or "LSTM" in fallback["reply"], "Solar model missing"
    assert "LoadARIMA" in fallback["reply"] or "ARIMA" in fallback["reply"], "Load model missing"
    assert fallback["telemetrySnippet"] is None, "Telemetry snippet should be None"
    print("  --> PASS: AI Models Query Grounded Correctly!\n")

def test_battery_soc_query():
    q = "What is the current battery SoC?"
    telemetry = {"batterySoc": 74.5, "batteryTempC": 31.5, "batteryVoltageV": 12.8}
    config = query_router.route_query(q, "operator")
    print(f"[TEST 3] Query: '{q}'")
    print(f"  Intents: {config.intents}")
    assert "BATTERY_SOC" in config.intents, "Expected BATTERY_SOC intent"
    assert config.requires_telemetry is True, "Battery SoC query MUST require telemetry"

    fallback = local_llm_service._heuristic_fallback(q, telemetry, "operator", config)
    print(f"  Reply: {fallback['reply'][:150]}...")
    assert "74.5%" in fallback["reply"], "Expected SoC value in reply"
    assert fallback["telemetrySnippet"] is not None, "Telemetry snippet should be present"
    print("  --> PASS: Battery SoC Query Grounded Correctly!\n")

def test_rag_retrieval():
    q = "who created gridflowx"
    docs = retriever.retrieve(q, top_k=2)
    print(f"[TEST 4] RAG Retrieval for '{q}'")
    print(f"  Retrieved Doc ID: {docs[0]['id'] if docs else 'None'}")
    assert docs and docs[0]["id"] == "DOC-PROJECT-IDENTITY", "Expected DOC-PROJECT-IDENTITY to rank #1"
    print("  --> PASS: RAG Knowledge Retrieval Grounded Correctly!\n")

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING TARGETED INTENT & GROUNDING VERIFICATION TESTS")
    print("=" * 60)
    test_developer_query()
    test_ai_models_query()
    test_battery_soc_query()
    test_rag_retrieval()
    print("ALL TARGETED TESTS PASSED PERFECTLY!")
