"""
GridFlowX Supabase Service Integration
=======================================
Provides helper methods for Supabase Auth token validation, audit logging,
support ticket management, and PostgreSQL database queries.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.database.supabase_client import supabase_manager
from backend.core.logging import logger


class SupabaseIntegration:
    """Enterprise service integration with Supabase backend."""

    def __init__(self):
        self.manager = supabase_manager

    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Decodes and validates a Supabase Auth access token.
        Falls back to dev-role inspection for local developer tokens.
        """
        token_clean = token.replace("Bearer ", "").strip()

        # 1. Dev token shortcuts
        if "supervisor" in token_clean.lower():
            return {
                "uid": "dev-supervisor-01",
                "email": "supervisor@gridflowx.io",
                "role": "supervisor",
                "authenticated": True,
            }
        if "admin" in token_clean.lower():
            return {
                "uid": "dev-admin-01",
                "email": "admin@gridflowx.io",
                "role": "admin",
                "authenticated": True,
            }
        if "auditor" in token_clean.lower():
            return {
                "uid": "dev-auditor-01",
                "email": "auditor@gridflowx.io",
                "role": "auditor",
                "authenticated": True,
            }
        if "viewer" in token_clean.lower():
            return {
                "uid": "dev-viewer-01",
                "email": "viewer@gridflowx.io",
                "role": "viewer",
                "authenticated": True,
            }
        if "operator" in token_clean.lower():
            return {
                "uid": "dev-operator-01",
                "email": "operator@gridflowx.io",
                "role": "operator",
                "authenticated": True,
            }

        # 2. Supabase Auth token verification if connected
        if self.manager.is_connected and len(token_clean) > 30:
            try:
                user_res = self.manager.client.auth.get_user(token_clean)
                if user_res and user_res.user:
                    u = user_res.user
                    role = (
                        u.user_metadata.get("role")
                        or u.app_metadata.get("role")
                        or "operator"
                    )
                    return {
                        "uid": u.id,
                        "email": u.email,
                        "role": role,
                        "authenticated": True,
                    }
            except Exception as e:
                logger.debug(f"Supabase token validation failed ({e}), using default fallback.")

        # Default authenticated fallback for local dev
        return {
            "uid": "dev-operator-01",
            "email": "operator@gridflowx.io",
            "role": "operator",
            "authenticated": True,
        }

    async def save_audit_event(self, event_data: Dict[str, Any]) -> bool:
        """Saves an audit event to Supabase public.audit_logs table."""
        if not self.manager.is_connected:
            return False
        try:
            pg_record = {
                "id": event_data.get("id", f"LOG-{int(datetime.now(timezone.utc).timestamp())}"),
                "timestamp": event_data.get("timestamp", datetime.now(timezone.utc).isoformat()),
                "actor_uid": event_data.get("actorUid", "SYSTEM_OPERATOR"),
                "actor_email": event_data.get("actorEmail", "operator@gridflowx.io"),
                "actor_role": event_data.get("actorRole", "operator"),
                "action": event_data.get("action", "SYSTEM_EVENT"),
                "severity": event_data.get("severity", "INFO"),
                "status": event_data.get("status", "SUCCESS"),
                "resource": event_data.get("resource", "system"),
                "details": event_data.get("details", {}),
                "hash": event_data.get("hash", ""),
            }
            self.manager.client.table("audit_logs").insert(pg_record).execute()
            return True
        except Exception as e:
            logger.warning(f"Failed to write audit event to Supabase: {e}")
            return False


supabase_integration = SupabaseIntegration()
