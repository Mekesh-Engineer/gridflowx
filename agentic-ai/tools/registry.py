"""
GridFlowX Tool Registry
=======================
Central repository and execution dispatcher for all registered production tools.
"""

from typing import Dict, Any, List, Optional
from tools.base import BaseTool
from schemas.tools import ToolDefinitionSchema, ToolResultSchema
from safety.validator import CommandValidator


class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        self._tools[tool.name] = tool

    def get_tool(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_tools(self) -> List[ToolDefinitionSchema]:
        return [
            ToolDefinitionSchema(
                name=t.name,
                description=t.description,
                required_role=t.required_role,
                is_write_action=t.is_write_action,
                requires_hitl=t.requires_hitl,
            )
            for t in self._tools.values()
        ]

    async def execute_tool(
        self,
        tool_name: str,
        params: Dict[str, Any],
        user_role: str = "operator"
    ) -> ToolResultSchema:
        tool = self.get_tool(tool_name)
        if not tool:
            return ToolResultSchema(
                tool_name=tool_name,
                success=False,
                error=f"Tool '{tool_name}' not found in registry.",
            )

        # RBAC Check
        if not CommandValidator.validate_action_permissions(user_role, tool.required_role):
            return ToolResultSchema(
                tool_name=tool_name,
                success=False,
                error=f"Permission Denied: '{tool_name}' requires '{tool.required_role}' role (actor: '{user_role}').",
            )

        try:
            data = await tool.execute(params, user_role)
            return ToolResultSchema(
                tool_name=tool_name,
                success=True,
                data=data,
            )
        except Exception as e:
            return ToolResultSchema(
                tool_name=tool_name,
                success=False,
                error=str(e),
            )


tool_registry = ToolRegistry()
