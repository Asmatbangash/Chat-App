import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:4000";

export let socket = null;
let connectedUserId = null;

export const connectSocket = ({ userId, token }) => {
  if (!userId || !token) {
    return null;
  }

  const normalizedUserId = String(userId);

  // Reuse existing live connection for the same user.
  if (
    socket &&
    socket.connected &&
    connectedUserId === normalizedUserId
  ) {
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    query: {
      userId: normalizedUserId,
    },
    auth: {
      token,
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
  });

  connectedUserId = normalizedUserId;
  socket.connect();

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  connectedUserId = null;
};

export const getSocket = () => socket;
