import { createContext } from "react";

// Exported separately so provider file only exports component logic.
const AuthContext = createContext(null);

export default AuthContext;
