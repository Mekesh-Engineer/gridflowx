let socket: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 30000;

interface WebSocketCallbacks {
  onMessage: (type: string, payload: any) => void;
  onStatusChange: (online: boolean) => void;
}

export function initializeWebSocket(token: string, callbacks: WebSocketCallbacks) {
  if (typeof window === "undefined") return;

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  // Clear any existing reconnect timer
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  const wsBase = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
  const wsUrl = `${wsBase}/ws/client?token=${encodeURIComponent(token)}`;

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
        console.warn("[WS] Failed to parse WebSocket frame:", err);
      }
    };

    socket.onclose = (event) => {
      console.log(`[WS] Connection standby (code: ${event.code}). Auto-reconnecting...`);
      callbacks.onStatusChange(false);
      scheduleReconnect(token, callbacks);
    };

    socket.onerror = () => {
      // Use warn rather than error to prevent Next.js React-Dev-Overlay popups during server standby/reconnects
      console.warn("[WS] Telemetry WebSocket connection offline or reconnecting to FastAPI gateway");
    };
  } catch (err) {
    console.warn("[WS] Initialization standby:", err);
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
