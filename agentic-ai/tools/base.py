"""
GridFlowX Production Tool Base Contract
=======================================
Defines the standard interface for callable production tools with RBAC and validation.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel


class BaseTool(ABC):
    """Abstract Base Class for type-safe tools in production."""

    def __init__(
        self,
        name: str,
        description: str,
        required_role: str = "operator",
        is_write_action: bool = False,
        requires_hitl: bool = False,
    ):
        self.name = name
        self.description = description
        self.required_role = required_role
        self.is_write_action = is_write_action
        self.requires_hitl = requires_hitl

    @abstractmethod
    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        """Executes the tool with parameter validation."""
        pass
