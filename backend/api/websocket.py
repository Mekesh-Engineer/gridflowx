"""
GridFlowX WebSocket Endpoints
=============================
Handles real-time 1Hz telemetry streaming (/ws/telemetry)
and client event/command channels (/ws/client).
"""

import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.websocket.connection_manager import ws_manager
from backend.services.telemetry_service import telemetry_service
from backend.core.logging import logger

router = APIRouter(tags=["WebSockets"])


@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect_telemetry(websocket)
    try:
        # Immediately push latest snapshot upon connection
        await websocket.send_text(json.dumps(telemetry_service.get_latest_telemetry()))
        while True:
            # Keep-alive receive loop
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect_telemetry(websocket)
    except Exception as e:
        logger.warning(f"Telemetry WebSocket connection closed: {e}")
        ws_manager.disconnect_telemetry(websocket)


@router.websocket("/ws/client")
async def websocket_client_endpoint(websocket: WebSocket):
    await ws_manager.connect_client(websocket)
    try:
        # Welcome event
        await websocket.send_text(json.dumps({
            "event": "CONNECTED",
            "message": "Connected to GridFlowX Real-Time Event Bus",
        }))
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect_client(websocket)
    except Exception as e:
        logger.warning(f"Client WebSocket connection closed: {e}")
        ws_manager.disconnect_client(websocket)
