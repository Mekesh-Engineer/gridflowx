"""
GridFlowX Backend Core Package
"""

from backend.core.config import settings, BackendSettings
from backend.core.security import get_current_user_role, require_role
from backend.core.events import create_start_app_handler, create_stop_app_handler

__all__ = [
    "settings",
    "BackendSettings",
    "get_current_user_role",
    "require_role",
    "create_start_app_handler",
    "create_stop_app_handler",
]
