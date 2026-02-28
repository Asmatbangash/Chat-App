import { createContext, useEffect, useMemo, useState } from "react";
import { connectSocket, disconnectSocket } from "@/socket/socket";
import { useAuth } from "@/context/AuthContext";

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user?._id || !token) {
      disconnectSocket();
      setSocket(null);
      setOnlineUsers([]);
      return;
    }

    const socketInstance = connectSocket({ userId: user._id, token });
    setSocket(socketInstance);

    const handleOnlineUsers = (users = []) => {
      setOnlineUsers(users.map((id) => String(id)));
    };

    // Support both backend event names.
    socketInstance.on("onlineUsers", handleOnlineUsers);
    socketInstance.on("getOnlineUsers", handleOnlineUsers);

    return () => {
      socketInstance.off("onlineUsers", handleOnlineUsers);
      socketInstance.off("getOnlineUsers", handleOnlineUsers);
      disconnectSocket();
      setSocket(null);
      setOnlineUsers([]);
    };
  }, [isAuthenticated, user?._id, token]);

  const value = useMemo(
    () => ({
      socket,
      onlineUsers,
      isSocketConnected: Boolean(socket?.connected),
    }),
    [socket, onlineUsers],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
