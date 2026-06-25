"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import {
  setAuthTokens,
  setSessionStatus,
} from "@/services/api";
import { sessionToTokens } from "@/services/auth.service";

interface AuthReadyContextValue {
  authReady: boolean;
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthReadyContext = createContext<AuthReadyContextValue>({
  authReady: false,
  status: "loading",
});

export function AuthReadyProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "authenticated" && session?.user) {
    setAuthTokens(sessionToTokens(session.user));
    setSessionStatus("authenticated");
  } else if (status === "unauthenticated") {
    setAuthTokens(null);
    setSessionStatus("unauthenticated");
  } else {
    setSessionStatus("loading");
  }

  const authReady = status === "authenticated" && !!session?.user;

  return (
    <AuthReadyContext.Provider value={{ authReady, status }}>
      {children}
    </AuthReadyContext.Provider>
  );
}

export function useAuthReady() {
  return useContext(AuthReadyContext);
}
