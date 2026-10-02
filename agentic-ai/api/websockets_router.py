"""
GridFlowX WebSocket Telemetry & Client Gateways
===============================================
"""

import os
import json
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from services.telemetry_service import telemetry_manager
from config.settings import settings

router = APIRouter(tags=["WebSockets"])


@router.websocket("/ws/telemetry")
async def telemetry_endpoint(websocket: WebSocket, token: Optional[str] = None):
    """ESP32 microcontroller telemetry connection endpoint with security validation."""
    expected_token = settings.device_ws_token
    if token and token != expected_token and token != "dev-esp32":
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        print("[WS Security] Rejected unauthorized ESP32 telemetry connection")
        return

    await telemetry_manager.connect_device(websocket)
    print(f"[WS] ESP32 device connected successfully (Clients active: {len(telemetry_manager.active_clients)})")
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == "telemetry_update":
                    payload = message.get("payload", {})
                    telemetry_manager.latest_telemetry = payload
                    await telemetry_manager.broadcast_to_clients({
                        "type": "telemetry_update",
                        "payload": payload,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        telemetry_manager.disconnect_device(websocket)
        print("[WS] ESP32 device disconnected — microgrid physics simulator automatically engaged.")


@router.websocket("/ws/client")
async def client_endpoint(websocket: WebSocket, token: Optional[str] = None):
    """Browser / Next.js client dashboard connection endpoint."""
    await telemetry_manager.connect_client(websocket)
    try:
        if telemetry_manager.latest_telemetry:
            await websocket.send_json({
                "type": "telemetry_initial",
                "payload": telemetry_manager.latest_telemetry,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        telemetry_manager.disconnect_client(websocket)
        print("[WS] Next.js dashboard client disconnected")
