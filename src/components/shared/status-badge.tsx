import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  SUCCESS: "bg-success/15 text-success border-success/20",
  ACTIVE: "bg-success/15 text-success border-success/20",
  PAID: "bg-success/15 text-success border-success/20",
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  OPEN: "bg-accent/15 text-accent border-accent/20",
  FAILED: "bg-destructive/15 text-destructive border-destructive/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
  REVOKED: "bg-muted text-muted-foreground border-border",
  TIMEOUT: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  REJECTED: "bg-destructive/15 text-destructive border-destructive/20",
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-[11px] uppercase tracking-wide",
        statusStyles[normalized] ?? "bg-secondary text-muted-foreground",
      )}
    >
      {status}
    </Badge>
  );
}
