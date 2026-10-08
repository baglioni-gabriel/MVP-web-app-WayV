"use client";

import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/lib/context/AuthContext";

/**
 * Hook to access authentication state and actions.
 * Must be used inside an <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
