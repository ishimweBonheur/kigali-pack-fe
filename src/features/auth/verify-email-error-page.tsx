"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { PUBLIC_ROUTES } from "@/constants/public";
import { Button } from "@/components/ui/button";
import { PublicPageShell } from "@/components/public/public-page-shell";

export function VerifyEmailErrorPage() {
  const searchParams = useSearchParams();
  const reason =
    searchParams.get("reason") ??
    "This verification link is invalid or has expired.";

  return (
    <PublicPageShell className="py-16 text-center">
      <div className="mx-auto max-w-xl">
      <AlertTriangle className="h-14 w-14 text-destructive mx-auto mb-4" />
      <h1 className="font-heading text-2xl font-bold">Verification failed</h1>
      <p className="mt-3 text-muted-foreground break-words">{reason}</p>
      <p className="mt-2 text-small text-muted-foreground">
        Links expire after 20 minutes and can only be used once.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={PUBLIC_ROUTES.getStarted}>
          <Button>Resend from Get Started</Button>
        </Link>
        <Link href={PUBLIC_ROUTES.login}>
          <Button variant="outline">Sign in</Button>
        </Link>
      </div>
      </div>
    </PublicPageShell>
  );
}
