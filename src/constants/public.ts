export const PUBLIC_ROUTES = {
  home: "/",
  docs: "/docs",
  pricing: "/pricing",
  getStarted: "/get-started",
  examples: "/examples",
  login: "/login",
} as const;

export const PUBLIC_NAV = [
  { label: "Documentation", href: PUBLIC_ROUTES.docs },
  { label: "Pricing", href: PUBLIC_ROUTES.pricing },
  { label: "Examples", href: PUBLIC_ROUTES.examples },
  { label: "Get Started", href: PUBLIC_ROUTES.getStarted },
] as const;

export const FOOTER_LINKS = {
  product: [
    { label: "Documentation", href: PUBLIC_ROUTES.docs },
    { label: "API Examples", href: PUBLIC_ROUTES.examples },
    { label: "Pricing", href: PUBLIC_ROUTES.pricing },
    { label: "Get Started", href: PUBLIC_ROUTES.getStarted },
  ],
  developers: [
    { label: "Quick Start", href: "/docs/quick-start" },
    { label: "Authentication", href: "/docs/authentication" },
    { label: "Locations API", href: "/docs/locations" },
    { label: "Sandbox Payments", href: "/docs/sandbox-payments" },
  ],
  company: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Get Started", href: PUBLIC_ROUTES.getStarted },
    { label: "Sign In", href: PUBLIC_ROUTES.login },
  ],
} as const;
