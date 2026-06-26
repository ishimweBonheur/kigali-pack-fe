import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { PUBLIC_ROUTES } from "@/constants/public";
import { PublicPageShell } from "@/components/public/public-page-shell";

export function VerifyEmailSuccessPage() {
  return (
    <PublicPageShell className="py-16 text-center">
      <div className="mx-auto max-w-xl">
      <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
      <h1 className="font-heading text-2xl font-bold text-success">
        ✓ Email verified
      </h1>
      <p className="mt-3 text-muted-foreground">
        Your account is verified. Continue onboarding to generate your first API key.
      </p>
      <Link
        href={PUBLIC_ROUTES.getStarted}
        className="inline-flex mt-8 h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
      >
        Continue to Generate API Key
        <ChevronRight className="h-4 w-4" />
      </Link>
      </div>
    </PublicPageShell>
  );
}
