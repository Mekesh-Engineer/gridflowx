"""
GridFlowX Agentic AI Package
============================
The primary, authoritative source of all AI, telemetry streaming,
and multi-agent orchestration functionality for GridFlowX.
"""
import os
import sys

# Ensure this package directory is on sys.path
_PKG_DIR = os.path.dirname(os.path.abspath(__file__))
if _PKG_DIR not in sys.path:
    sys.path.insert(0, _PKG_DIR)
