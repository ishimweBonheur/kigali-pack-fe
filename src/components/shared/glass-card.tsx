import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-5 transition-colors",
        hover && "hover:bg-hover/40",
        className,
      )}
    >
      {children}
    </div>
  );
}
