"""
GridFlowX Production Backend Settings & Environment Configuration
==================================================================
Centralized configuration for Backend API server, Firebase, Edge hardware,
database, and Agentic AI integration bindings.
"""

import os
from typing import List
from pydantic import BaseModel


class BackendSettings(BaseModel):
    app_name: str = "GridFlowX Production Backend API Gateway"
    app_version: str = "3.0.0"
    env: str = os.getenv("ENVIRONMENT", "development")
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", os.getenv("AI_SERVICE_PORT", "8000")))

    # CORS Allowed Origins
    allowed_origins: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,https://gridflowx.web.app,https://gridflowx.app"
        ).split(",")
        if origin.strip()
    ]

    # Security & Tokens
    device_ws_token: str = os.getenv("DEVICE_WS_TOKEN", "GFX-DEVICE-SECRET-KEY-2026")
    edge_device_id: str = os.getenv("EDGE_DEVICE_ID", "GFX-ESP32-MASTER-01")
    edge_shared_secret: str = os.getenv("EDGE_SHARED_SECRET", "GFX-DEVICE-SECRET-KEY-2026")
    dev_bypass_auth: bool = os.getenv("DEV_BYPASS_AUTH", "true").lower() in ("true", "1", "yes")

    # Supabase Configuration (Primary Database & Auth Platform)
    supabase_url: str = os.getenv("SUPABASE_URL", os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://esdsdkxwgjwambmomcha.supabase.co"))
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_4bylAPK4v_2RjPWN9Rx_wg_0wLu54Dd"))
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_ANON_KEY", "sb_publishable_4bylAPK4v_2RjPWN9Rx_wg_0wLu54Dd"))

    # Firebase has been fully replaced by Supabase

    # Telemetry Streaming
    telemetry_stream_hz: int = int(os.getenv("TELEMETRY_STREAM_HZ", "1"))
    core0_safety_loop_hz: int = int(os.getenv("CORE0_SAFETY_LOOP_HZ", "100"))

    # Physical Microgrid Electrical Bounds
    voltage_cutoff_low: float = float(os.getenv("VOLTAGE_CUTOFF_LOW", "10.5"))
    voltage_cutoff_high: float = float(os.getenv("VOLTAGE_CUTOFF_HIGH", "14.8"))
    current_limit_max: float = float(os.getenv("CURRENT_LIMIT_MAX", "20.0"))
    heatsink_temp_limit_c: float = float(os.getenv("HEATSINK_TEMP_LIMIT_C", "85.0"))


settings = BackendSettings()
