"""
GridFlowX Supabase Client & Connection Manager
===============================================
Initializes and manages the primary Supabase client for PostgreSQL database operations,
Auth token verification, Storage bucket management, and Realtime broadcasts.
"""

from typing import Optional, Dict, Any, List
from backend.core.settings import settings
from backend.core.logging import logger

try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False
    Client = Any  # type: ignore


class SupabaseManager:
    """Singleton manager for Supabase database access."""

    def __init__(self):
        self._client: Optional[Client] = None
        self._connected = False
        self._init_client()

    def _init_client(self):
        if not HAS_SUPABASE:
            logger.warning("supabase-py library not installed. Operating in in-memory simulation mode.")
            return

        try:
            url = settings.supabase_url
            key = settings.supabase_service_role_key or settings.supabase_anon_key

            if url and key and "your-project-id" not in url:
                self._client = create_client(url, key)
                self._connected = True
                logger.info(f"Supabase client initialized successfully against endpoint: {url}")
            else:
                logger.info("Supabase client running in local development simulated mode (default keys).")
        except Exception as e:
            logger.warning(f"Supabase client initialization bypassed ({e}). Falling back to local store.")
            self._client = None
            self._connected = False

    @property
    def client(self) -> Optional[Client]:
        return self._client

    @property
    def is_connected(self) -> bool:
        return self._connected and self._client is not None

    def table(self, table_name: str):
        """Returns postgrest query builder for table if connected, else None."""
        if self._client:
            return self._client.table(table_name)
        return None


# Global singleton instance
supabase_manager = SupabaseManager()


class SupabaseAdminProxy:
    """Proxy object that delegates to the active Supabase client or returns safe fallback."""

    def __getattr__(self, name: str):
        if supabase_manager.client is not None:
            return getattr(supabase_manager.client, name)
        raise AttributeError(f"Supabase client is not connected. Cannot access '{name}'.")


supabase_admin = SupabaseAdminProxy()
supabase_client = supabase_manager.client


def get_supabase() -> Optional[Client]:
    """Helper to access active Supabase client."""
    return supabase_manager.client

