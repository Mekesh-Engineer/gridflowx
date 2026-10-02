"""
GridFlowX Backend Configuration
===============================
Loads environment variables, server settings, and service URLs.
"""

import os
from typing import List
from pydantic_settings import BaseSettings


class BackendSettings(BaseSettings):
    app_name: str = "GridFlowX Enterprise Backend"
    app_version: str = "3.2.0"
    environment: str = os.getenv("NODE_ENV", os.getenv("ENVIRONMENT", "development"))
    host: str = "0.0.0.0"
    port: int = int(os.getenv("BACKEND_PORT", os.getenv("PORT", "8000")))

    # CORS settings - include Next.js frontend on 3000
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://gridflowx.app",
    ]

    # Supabase configuration
    supabase_url: str = os.getenv("SUPABASE_URL", os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://esdsdkxwgjwambmomcha.supabase.co"))
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_4bylAPK4v_2RjPWN9Rx_wg_0wLu54Dd"))
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_ANON_KEY", "sb_publishable_4bylAPK4v_2RjPWN9Rx_wg_0wLu54Dd"))

    # Security
    jwt_secret: str = os.getenv("JWT_SECRET", "gridflowx-super-secret-production-key-2026")
    token_expire_minutes: int = 1440

    class Config:
        env_file = ".env"
        extra = "allow"


settings = BackendSettings()

