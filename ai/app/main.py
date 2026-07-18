import json
from typing import List, Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="GridFlowX AI Microservice",
    description="Asynchronous telemetry streaming, forecasting, and relay routing manager.",
    version="3.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to dashboard origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connection Manager for WebSockets
class ConnectionManager:
  def __init__(self):
    self.active_clients: List[WebSocket] = []
    self.active_devices: List[WebSocket] = []

  async def connect_client(self, websocket: WebSocket):
    await websocket.accept()
    self.active_clients.append(websocket)

  def disconnect_client(self, websocket: WebSocket):
    self.active_clients.remove(websocket)

  async def connect_device(self, websocket: WebSocket):
    await websocket.accept()
    self.active_devices.append(websocket)

  def disconnect_device(self, websocket: WebSocket):
    self.active_devices.remove(websocket)

  async def broadcast_to_clients(self, message: dict):
    for connection in self.active_clients:
      try:
        await connection.send_json(message)
      except Exception:
        pass

  async def send_to_devices(self, message: dict):
    for connection in self.active_devices:
      try:
        await connection.send_json(message)
      except Exception:
        pass

manager = ConnectionManager()

# Input schemas
class OverridePayload(BaseModel):
  relayIndex: int
  newState: bool
  reason: str

class RecoveryPayload(BaseModel):
  reason: str

@app.get("/health")
def health_check():
  return {"status": "healthy", "service": "gridflowx-ai", "version": "3.0.0"}

@app.post("/api/v1/relays/override")
async def toggle_override(payload: OverridePayload):
  # Log override to Firestore audit logs (mocked)
  print(f"[Override] Toggled channel {payload.relayIndex} to {payload.newState}. Reason: {payload.reason}")
  
  # Push command down to ESP32 devices
  command = {
      "type": "OVERRIDE",
      "payload": {
          "channel": payload.relayIndex,
          "state": payload.newState
      }
  }
  await manager.send_to_devices(command)
  
  return {
      "success": True,
      "message": f"Relay override sent for index {payload.relayIndex}",
      "relayStates": [payload.newState if i == payload.relayIndex else False for i in range(8)]
  }

@app.post("/api/v1/relays/recovery")
async def authorize_recovery(payload: RecoveryPayload):
  print(f"[Recovery] Recovery authorized. Reason: {payload.reason}")
  command = {"type": "RECOVERY_AUTHORIZED", "payload": {"reason": payload.reason}}
  await manager.send_to_devices(command)
  return {"success": True, "message": "Emergency recovery authorization sent"}

# WebSocket Gateways
@app.websocket("/ws/telemetry")
async def telemetry_endpoint(websocket: WebSocket):
  """ESP32 microcontroller telemetry connection endpoint."""
  await manager.connect_device(websocket)
  try:
    while True:
      data = await websocket.receive_text()
      try:
        message = json.loads(data)
        # Verify it's a telemetry packet
        if message.get("type") == "telemetry_update":
          # Broadcast packet directly to dashboard clients
          await manager.broadcast_to_clients({
              "type": "telemetry_update",
              "payload": message.get("payload")
          })
      except json.JSONDecodeError:
        pass
  except WebSocketDisconnect:
    manager.disconnect_device(websocket)
    print("[WS] ESP32 device disconnected")

@app.websocket("/ws/client")
async def client_endpoint(websocket: WebSocket, token: str = None):
  """Browser / Next.js client dashboard connection endpoint."""
  # Validate firebase token here in production
  await manager.connect_client(websocket)
  try:
    while True:
      # Keep connection open; clients are typically read-only or handle overrides via REST API
      await websocket.receive_text()
  except WebSocketDisconnect:
    manager.disconnect_client(websocket)
    print("[WS] Next.js dashboard client disconnected")
