import { useContext } from "react";
import SocketContext from "@/context/socket-context";

export function useSocket() {
  // Pull socket state from the standalone socket context module.
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }

  return context;
}
