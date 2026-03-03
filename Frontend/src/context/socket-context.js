import { createContext } from "react";

// Exported separately so provider file keeps component-only exports.
const SocketContext = createContext(null);

export default SocketContext;
