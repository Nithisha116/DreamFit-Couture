import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket Server", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Disconnected from WebSocket Server:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ WebSocket Connection Error:", error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};
