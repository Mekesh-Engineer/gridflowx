let socket: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 30000;

interface WebSocketCallbacks {
  onMessage: (type: string, payload: any) => void;
  onStatusChange: (online: boolean) => void;
}

export function initializeWebSocket(token: string, callbacks: WebSocketCallbacks) {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  // Clear any existing reconnect timer
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws/client?token=${token}`;
  
  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("[WS] Connected to GridFlowX telemetry stream");
      reconnectDelay = 1000; // Reset delay on successful connection
      callbacks.onStatusChange(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;
        callbacks.onMessage(type, payload);
      } catch (err) {
        console.error("[WS] Failed to parse WebSocket frame:", err);
      }
    };

    socket.onclose = (event) => {
      console.log(`[WS] Connection closed (code: ${event.code}). Attempting reconnect...`);
      callbacks.onStatusChange(false);
      scheduleReconnect(token, callbacks);
    };

    socket.onerror = (error) => {
      console.error("[WS] WebSocket error:", error);
    };
  } catch (err) {
    console.error("[WS] Initialization failed:", err);
    scheduleReconnect(token, callbacks);
  }
}

function scheduleReconnect(token: string, callbacks: WebSocketCallbacks) {
  if (reconnectTimer) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    // Exponential backoff
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
    initializeWebSocket(token, callbacks);
  }, reconnectDelay);
}

export function disconnectWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.onclose = null; // Remove event listener to prevent auto-reconnect
    socket.close();
    socket = null;
    console.log("[WS] Explicitly disconnected WebSocket client");
  }
}
