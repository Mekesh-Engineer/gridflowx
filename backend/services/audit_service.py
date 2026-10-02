"""
GridFlowX Audit Logging & Compliance Service
============================================
Records all high-consequence operations, relay switching events, and HITL overrides.
"""

from typing import Dict, Any, List
from backend.database.memory_store import memory_store
from backend.integrations.supabase_integration import supabase_integration


class AuditService:
    async def record_action(self, actor: str, action: str, details: Dict[str, Any]) -> Dict[str, Any]:
        log_entry = memory_store.add_audit_log(actor, action, details)
        await supabase_integration.save_audit_event(log_entry)
        return log_entry

    def get_audit_trail(self, limit: int = 50) -> List[Dict[str, Any]]:
        return memory_store.audit_logs[-limit:]


audit_service = AuditService()
