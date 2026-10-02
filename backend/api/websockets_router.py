"""
GridFlowX Real-Time WebSocket Router
====================================
Streams:
- /ws/telemetry: 1Hz live sensor frames and relay state
- /ws/client: client events and alerts
- /ws/agent: streaming agent responses
"""

import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.websocket.connection_manager import ws_manager
from backend.services.telemetry_service import telemetry_service

router = APIRouter(tags=["WebSockets"])


@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket, channel="telemetry")
    # Send immediate latest frame on connect
    initial_frame = telemetry_service.get_latest_telemetry()
    await websocket.send_text(json.dumps(initial_frame))
    try:
        while True:
            # Keep connection alive & handle incoming pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel="telemetry")
    except Exception:
        ws_manager.disconnect(websocket, channel="telemetry")


@router.websocket("/ws/client")
async def websocket_client_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket, channel="alerts")
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel="alerts")
    except Exception:
        ws_manager.disconnect(websocket, channel="alerts")


@router.websocket("/ws/agent")
async def websocket_agent_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket, channel="agent")
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel="agent")
    except Exception:
        ws_manager.disconnect(websocket, channel="agent")
