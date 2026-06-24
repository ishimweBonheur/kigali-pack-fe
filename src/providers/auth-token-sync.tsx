"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { setAuthTokens } from "@/services/api";
import { sessionToTokens } from "@/services/auth.service";

export function AuthTokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      setAuthTokens(sessionToTokens(session.user));
    } else {
      setAuthTokens(null);
    }
  }, [session]);

  return null;
}
