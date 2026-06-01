import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://127.0.0.1:5177",
    "http://localhost:5000",
    "https://dream-fitcouture-bnuc.vercel.app",
    "https://dream-fitcouture.vercel.app",
    "https://dream-fit-couture.vercel.app",
  ];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🟢 New client connected to Socket.IO: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
