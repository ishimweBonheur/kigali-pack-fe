"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUBLIC_ROUTES } from "@/constants/public";

interface CtaBannerProps {
  title?: string;
  description?: string;
}

export function CtaBanner({
  title = "Ready to build?",
  description = "Create your account, generate an API key, and start integrating in minutes.",
}: CtaBannerProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
      <div className="glass-card rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/5 to-transparent" />
        <h2 className="font-heading text-2xl md:text-3xl font-semibold">
          {title}
        </h2>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
          {description}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={PUBLIC_ROUTES.getStarted}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={PUBLIC_ROUTES.docs}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-hover"
          >
            Read documentation
          </Link>
        </div>
      </div>
    </section>
  );
}
