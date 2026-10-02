"""
GridFlowX Real-Time WebSocket Connection Manager
================================================
Manages active WebSocket subscribers across multiple streams:
- Telemetry stream (/ws/telemetry)
- Client notifications (/ws/client)
- Agent dialogue & real-time reasoning traces (/ws/agent)
"""

import json
import logging
from typing import Dict, List, Set, Any
from fastapi import WebSocket

logger = logging.getLogger("gridflowx.backend.ws")


class WebSocketConnectionManager:
    """Centralized WebSocket connection pool."""

    def __init__(self):
        self.active_clients: Set[WebSocket] = set()
        self.channel_subscribers: Dict[str, Set[WebSocket]] = {
            "telemetry": set(),
            "alerts": set(),
            "agent": set(),
        }
        self.active_devices: Set[str] = {"GFX-ESP32-MASTER-01"}

    async def connect(self, websocket: WebSocket, channel: str = "telemetry"):
        await websocket.accept()
        self.active_clients.add(websocket)
        if channel in self.channel_subscribers:
            self.channel_subscribers[channel].add(websocket)
        logger.info(f"WebSocket client connected to [{channel}]. Total: {len(self.active_clients)}")

    def disconnect(self, websocket: WebSocket, channel: str = "telemetry"):
        if websocket in self.active_clients:
            self.active_clients.remove(websocket)
        if channel in self.channel_subscribers and websocket in self.channel_subscribers[channel]:
            self.channel_subscribers[channel].remove(websocket)
        logger.info(f"WebSocket client disconnected from [{channel}]. Total: {len(self.active_clients)}")

    async def broadcast(self, message: Dict[str, Any], channel: str = "telemetry"):
        """Broadcasts JSON payload to all subscribers of a channel."""
        subscribers = self.channel_subscribers.get(channel, self.active_clients)
        disconnected = []
        payload = json.dumps(message)

        for client in list(subscribers):
            try:
                await client.send_text(payload)
            except Exception:
                disconnected.append(client)

        for dead_client in disconnected:
            self.disconnect(dead_client, channel)

    async def broadcast_all(self, message: Dict[str, Any]):
        """Broadcasts payload to every connected client across all channels."""
        disconnected = []
        payload = json.dumps(message)
        for client in list(self.active_clients):
            try:
                await client.send_text(payload)
            except Exception:
                disconnected.append(client)

        for dead_client in disconnected:
            if dead_client in self.active_clients:
                self.active_clients.remove(dead_client)


ws_manager = WebSocketConnectionManager()
