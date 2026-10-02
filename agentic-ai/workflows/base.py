"""
GridFlowX Production Workflow Engine
====================================
Defines declarative state machines and multi-step agentic workflows.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime, timezone


class BaseWorkflow(ABC):
    """Abstract Base Class for multi-step agentic workflows."""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    @abstractmethod
    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Executes the workflow pipeline."""
        pass
