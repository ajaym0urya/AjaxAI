import json
from typing import List
from fastapi import WebSocket

class ConnectionManager:
  def __init__(self):
    self.active_connections: List[WebSocket] = []

  async def connect(self, websocket: WebSocket):
    await websocket.accept()
    self.active_connections.append(websocket)
    try:
      # Send a welcome message in a JSON format matching Express SignalR mock structure
      await websocket.send_text(json.dumps({
        "type": "connection_established",
        "message": "Connected to AjaxAI SignalR Gateway (FastAPI)"
      }))
    except Exception:
      pass
    print(f"[WebSocket Manager] Client connected. Total active connections: {len(self.active_connections)}")

  def disconnect(self, websocket: WebSocket):
    if websocket in self.active_connections:
      self.active_connections.remove(websocket)
      print(f"[WebSocket Manager] Client disconnected. Total active connections: {len(self.active_connections)}")

  async def broadcast(self, type_name: str, data: any):
    payload = json.dumps({ "type": type_name, "data": data })
    for connection in self.active_connections:
      try:
        await connection.send_text(payload)
      except Exception as e:
        # Silently skip failed connections
        pass

manager = ConnectionManager()
