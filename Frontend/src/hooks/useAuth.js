import { useContext } from "react";
import AuthContext from "@/context/auth-context";

export function useAuth() {
  // Read auth state from provider without importing provider module directly.
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
