"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { PUBLIC_ROUTES } from "@/constants/public";
import { ONBOARDING_STORAGE_KEY } from "@/constants";
import { getErrorMessage } from "@/utils";
import { PublicPageShell } from "@/components/public/public-page-shell";

export function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        await authService.verifyEmail(token);
        if (cancelled) return;

        try {
          const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
          if (raw) {
            const state = JSON.parse(raw);
            localStorage.setItem(
              ONBOARDING_STORAGE_KEY,
              JSON.stringify({ ...state, verified: true, step: Math.max(state.step ?? 2, 3) }),
            );
          }
        } catch {
          /* ignore storage errors */
        }

        router.replace("/verify-email/success");
      } catch (error) {
        if (cancelled) return;
        const message = encodeURIComponent(getErrorMessage(error));
        router.replace(`/verify-email/error?reason=${message}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  if (!token) {
    return (
      <PublicPageShell className="py-16 text-center">
        <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-2xl font-bold">Verification link invalid</h1>
        <p className="mt-3 text-muted-foreground">
          This page requires a token from your verification email.
        </p>
        <Link
          href={PUBLIC_ROUTES.getStarted}
          className="inline-flex mt-6 h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Go to Get Started
        </Link>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell className="py-24 text-center">
      <Loader2 className="h-10 w-10 animate-spin mx-auto text-accent" />
      <p className="mt-4 text-muted-foreground">Verifying your email…</p>
    </PublicPageShell>
  );
}
