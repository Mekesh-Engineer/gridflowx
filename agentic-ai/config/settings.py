"""
GridFlowX Production Configuration Settings
===========================================
Environment variable bindings and runtime settings using Pydantic BaseSettings.
Configured for Ollama Cloud Dual-Model Runtime (Gemma 4 31B & GPT-OSS 120B)
with local Ollama daemon fallback.
"""

import os
from typing import List
from pydantic import BaseModel, Field


class Settings(BaseModel):
    app_name: str = "GridFlowX AI Microservice & Model Orchestration Layer"
    app_version: str = "3.0.0"
    env: str = os.getenv("ENVIRONMENT", "development")
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    
    # CORS Origins
    allowed_origins: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,https://gridflowx.web.app,https://gridflowx.app"
        ).split(",")
        if origin.strip()
    ]
    
    # --------------------------------------------------------------------------
    # Ollama Cloud & Model Orchestration Runtime
    # --------------------------------------------------------------------------
    ollama_cloud_api_key: str = os.getenv("OLLAMA_CLOUD_API_KEY", "")
    ollama_cloud_base_url: str = os.getenv("OLLAMA_CLOUD_BASE_URL", "https://cloud.ollama.ai/v1")
    
    # Primary Dual-Model Cloud Deployments
    model_micro_fast: str = os.getenv("MODEL_MICRO_FAST", "gemma4:31b-cloud")
    model_macro_reasoning: str = os.getenv("MODEL_MACRO_REASONING", "gpt-oss:120b-cloud")
    
    # Local Self-Hosted LLM (Ollama Engine Fallback)
    ollama_base_url: str = (
        os.getenv("OLLAMA_BASE_URL")
        or os.getenv("OLLAMA_HOST")
        or "http://127.0.0.1:11434"
    ).replace("localhost", "127.0.0.1")
    ollama_model_name: str = os.getenv("OLLAMA_MODEL") or os.getenv("OLLAMA_MODEL_NAME", "gemma4:31b-cloud")
    ollama_timeout_sec: float = float(os.getenv("OLLAMA_TIMEOUT_SEC", "60.0"))
    ollama_auto_start: bool = os.getenv("OLLAMA_AUTO_START", "true").lower() in ("true", "1", "yes")
    ollama_fallback_candidates: List[str] = [
        "gemma4:31b-cloud",
        "gpt-oss:120b-cloud",
        "qwen2.5:3b",
        "qwen2.5:latest",
        "qwen2.5:7b",
        "qwen2.5:1.5b",
        "qwen-backend:latest",
        "qwen-coder:latest",
    ]

    # Security Tokens & Auth
    device_ws_token: str = os.getenv("DEVICE_WS_TOKEN", "GFX-DEVICE-SECRET-KEY-2026")
    dev_bypass_auth: bool = os.getenv("DEV_BYPASS_AUTH", "true").lower() in ("true", "1", "yes")
    supabase_url: str = os.getenv("SUPABASE_URL", os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://esdsdkxwgjwambmomcha.supabase.co"))
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_4bylAPK4v_2RjPWN9Rx_wg_0wLu54Dd"))
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_ANON_KEY", "sb_publishable_4bylAPK4v_2RjPWN9Rx_wg_0wLu54Dd"))
    
    # Hardware & Telemetry
    default_device_id: str = os.getenv("DEFAULT_DEVICE_ID", "GFX-ESP32-MASTER-01")
    telemetry_broadcast_interval_sec: float = 1.0
    
    # AI / ML Inference
    models_dir: str = os.getenv("MODELS_DIR", "ai/app/models")
    use_onnx_runtime: bool = os.getenv("USE_ONNX_RUNTIME", "true").lower() in ("true", "1", "yes")


settings = Settings()
