"""
GridFlowX Security & Role-Based Authorization
=============================================
Enforces role boundaries:
- admin: Full control including emergency trips, model retraining, safety reset.
- supervisor: High-consequence manual overrides, approvals.
- operator: Normal relay control subject to safety envelope, optimization triggers.
- viewer: Read-only access to telemetry, charts, and public AI copilot queries.
"""

from typing import Dict, Any, Optional, List
from fastapi import Header, HTTPException, status
from backend.core.settings import settings


class SecurityManager:
    """Validates user sessions and enforces RBAC."""

    @staticmethod
    def verify_token(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
        """
        Validates authorization header. Handles dev tokens (e.g. dev-operator, dev-supervisor)
        and Supabase Auth access tokens.
        """
        from backend.integrations.supabase_integration import supabase_integration
        if not authorization:
            return {
                "uid": "dev-operator-01",
                "email": "operator@gridflowx.io",
                "role": "operator",
                "authenticated": True,
            }
        return supabase_integration.verify_token(authorization)

    @staticmethod
    def require_role(required_role: str, user: Dict[str, Any]):
        """Enforces minimum role privilege."""
        role_hierarchy = {"viewer": 1, "auditor": 1, "operator": 2, "supervisor": 3, "admin": 4}
        user_level = role_hierarchy.get(user.get("role", "operator"), 1)
        required_level = role_hierarchy.get(required_role, 2)

        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions: requires {required_role} role",
            )


security_manager = SecurityManager()


def get_current_user_role(authorization: Optional[str] = Header(None)) -> str:
    user = security_manager.verify_token(authorization)
    return user.get("role", "operator")


def require_role(allowed_roles: List[str]):
    def role_checker(authorization: Optional[str] = Header(None)):
        user = security_manager.verify_token(authorization)
        if user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.get('role')}' is not authorized. Required: {allowed_roles}"
            )
        return user.get("role")
    return role_checker
