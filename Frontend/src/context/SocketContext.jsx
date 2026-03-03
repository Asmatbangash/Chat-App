import { useEffect, useMemo, useState } from "react";
import { connectSocket, disconnectSocket } from "@/socket/socket";
import { useAuth } from "@/hooks/useAuth";
import SocketContext from "@/context/socket-context";

export function SocketProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user?._id || !token) {
      disconnectSocket();
      return;
    }

    // Keep socket reference in React state only when connection is live.
    const socketInstance = connectSocket({ userId: user._id, token });
    const handleConnect = () => {
      setSocket(socketInstance);
    };
    const handleDisconnect = () => {
      setSocket(null);
      setOnlineUsers([]);
    };

    const handleOnlineUsers = (users = []) => {
      setOnlineUsers(users.map((id) => String(id)));
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    // Support both backend event names.
    socketInstance.on("onlineUsers", handleOnlineUsers);
    socketInstance.on("getOnlineUsers", handleOnlineUsers);

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("onlineUsers", handleOnlineUsers);
      socketInstance.off("getOnlineUsers", handleOnlineUsers);
      disconnectSocket();
    };
  }, [isAuthenticated, user?._id, token]);

  const value = useMemo(
    () => ({
      // Expose empty socket state when auth is missing.
      socket: isAuthenticated ? socket : null,
      onlineUsers: isAuthenticated ? onlineUsers : [],
      isSocketConnected: isAuthenticated ? Boolean(socket?.connected) : false,
    }),
    [isAuthenticated, socket, onlineUsers],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
