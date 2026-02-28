import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const server = createServer(app);

// userId -> socketId map for direct user-to-user real-time events.
const onlineUsers = new Map();

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length === 1 && allowedOrigins[0] === "*"
      ? "*"
      : allowedOrigins,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.use((socket, next) => {
  try {
    const authHeader = socket.handshake.headers?.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    const token = socket.handshake.auth?.token || bearerToken;

    if (!token) {
      return next(new Error("Unauthorized: missing token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRETE_KEY);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error("Unauthorized: invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = String(socket.userId);
  onlineUsers.set(userId, socket.id);

  // Broadcast online users so clients can update presence.
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));

  socket.on("disconnect", () => {
    const currentSocketId = onlineUsers.get(userId);

    // Remove only if this disconnect belongs to the tracked active socket.
    if (currentSocketId === socket.id) {
      onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }
  });
});

const getReceiverSocketId = (userId) => onlineUsers.get(String(userId));

const getOnlineUsers = () => Array.from(onlineUsers.keys());

export { app, server, io, getReceiverSocketId, getOnlineUsers };
