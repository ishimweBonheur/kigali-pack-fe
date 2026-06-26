import { cn } from "@/lib/utils";

const PUBLIC_PAGE_PADDING =
  "w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16";

interface PublicPageShellProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "main";
}

/** Full-width public page container with consistent horizontal padding. */
export function PublicPageShell({
  children,
  className,
  as: Tag = "div",
}: PublicPageShellProps) {
  return <Tag className={cn(PUBLIC_PAGE_PADDING, className)}>{children}</Tag>;
}

export { PUBLIC_PAGE_PADDING };
