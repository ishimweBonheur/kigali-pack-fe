"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthReadyProvider } from "@/providers/auth-ready-context";
import { ThemeProvider } from "@/providers/theme-provider";
import { KeyboardShortcuts } from "@/providers/keyboard-shortcuts";

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403 || status === 429) return false;
  }
  if (axios.isCancel(error)) return false;
  return failureCount < 1;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: shouldRetryQuery,
          },
        },
      }),
  );

  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <QueryClientProvider client={queryClient}>
        <AuthReadyProvider>
          <ThemeProvider>
            <TooltipProvider>
              <KeyboardShortcuts />
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  classNames: {
                    toast: "glass-card border-border text-foreground",
                  },
                }}
              />
            </TooltipProvider>
          </ThemeProvider>
        </AuthReadyProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
