export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface ApiEndpointParam {
  name: string;
  in: "path" | "query" | "header";
  required?: boolean;
  description?: string;
  example?: string;
}

export interface ApiEndpointDefinition {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  method: HttpMethod;
  path: string;
  requiresAuth: boolean;
  params?: ApiEndpointParam[];
  bodyExample?: Record<string, unknown>;
  bodySchema?: string;
  docSlug?: string;
  responsePreview?: string;
  errors?: Array<{ status: number; code: string; description: string }>;
  authentication?: string;
}

export const API_CATEGORIES = [
  "Locations",
  "NIDA KYC Sandbox",
  "RRA Tax Engine",
  "RSSB Deductions",
  "Mobile Money Payments",
  "Utilities",
  "Billing",
] as const;

export const API_ENDPOINTS: ApiEndpointDefinition[] = [
  {
    id: "locations-provinces",
    slug: "locations",
    category: "Locations",
    title: "List root provinces",
    description: "Public endpoint — returns all active provinces from the NISR hierarchy.",
    method: "GET",
    path: "/v1/locations/root-provinces",
    requiresAuth: false,
    docSlug: "locations",
    authentication: "None — public endpoint",
    responsePreview: `{
  "success": true,
  "message": "Root provinces retrieved",
  "data": [
    { "id": "uuid", "name": "Kigali City", "level": "PROVINCE", "code": "01" }
  ]
}`,
    errors: [
      { status: 429, code: "RATE_LIMITED", description: "Too many requests" },
    ],
  },
  {
    id: "nida-mock",
    slug: "compliance",
    category: "NIDA KYC Sandbox",
    title: "NIDA mock lookup",
    description: "Sandbox identity verification by national ID number.",
    method: "GET",
    path: "/v1/compliance/nida/mock/1200780064278123",
    requiresAuth: true,
    params: [
      {
        name: "nationalId",
        in: "path",
        required: true,
        description: "16-digit NIDA number",
        example: "1200780064278123",
      },
    ],
    docSlug: "compliance",
  },
  {
    id: "rra-taxes",
    slug: "compliance",
    category: "RRA Tax Engine",
    title: "Compute PAYE & VAT",
    description: "Calculate RRA progressive PAYE and 18% VAT on gross salary.",
    method: "POST",
    path: "/v1/compliance/rra/taxes",
    requiresAuth: true,
    bodyExample: { grossSalary: 500000 },
    bodySchema: '{ "grossSalary": number }',
    docSlug: "compliance",
  },
  {
    id: "rra-rssb",
    slug: "compliance",
    category: "RSSB Deductions",
    title: "RSSB contributions",
    description: "Employee/employer pension and maternity contribution breakdown.",
    method: "POST",
    path: "/v1/compliance/rra/rssb",
    requiresAuth: true,
    bodyExample: { grossSalary: 500000 },
    docSlug: "compliance",
  },
  {
    id: "rra-payroll",
    slug: "compliance",
    category: "RRA Tax Engine",
    title: "Full payroll summary",
    description: "Combined PAYE + RSSB payroll deduction summary.",
    method: "POST",
    path: "/v1/compliance/rra/payroll-summary",
    requiresAuth: true,
    bodyExample: { grossSalary: 500000 },
    docSlug: "compliance",
  },
  {
    id: "sandbox-charge",
    slug: "sandbox-payments",
    category: "Mobile Money Payments",
    title: "Initiate mock charge",
    description: "Simulate MTN MoMo or Airtel Money payment.",
    method: "POST",
    path: "/v1/sandbox/payments/charge",
    requiresAuth: true,
    bodyExample: {
      phoneNumber: "0781234567",
      amount: 5000,
      webhookUrl: "https://example.com/webhook",
      clientReference: "order-001",
    },
    docSlug: "sandbox-payments",
  },
  {
    id: "sandbox-test-accounts",
    slug: "sandbox-payments",
    category: "Mobile Money Payments",
    title: "List test accounts",
    description: "Sandbox phone numbers and magic amount triggers.",
    method: "GET",
    path: "/v1/sandbox/payments/test-accounts",
    requiresAuth: true,
    docSlug: "sandbox-payments",
  },
  {
    id: "phone-validate",
    slug: "utilities",
    category: "Utilities",
    title: "Validate phone number",
    description: "Validate and format a Rwandan mobile number.",
    method: "GET",
    path: "/v1/utilities/phone/validate?phone=0781234567",
    requiresAuth: true,
    docSlug: "utilities",
  },
  {
    id: "phone-carrier",
    slug: "utilities",
    category: "Utilities",
    title: "Detect carrier",
    description: "Detect MTN or Airtel from phone number prefix.",
    method: "GET",
    path: "/v1/utilities/phone/carrier?phone=0781234567",
    requiresAuth: true,
    docSlug: "utilities",
  },
  {
    id: "billing-plans",
    slug: "billing",
    category: "Billing",
    title: "List billing plans",
    description: "Public — available subscription plans.",
    method: "GET",
    path: "/v1/billing/plans",
    requiresAuth: false,
    docSlug: "billing",
  },
];

export function getEndpointsByDocSlug(slug: string): ApiEndpointDefinition[] {
  return API_ENDPOINTS.filter((e) => e.docSlug === slug || e.slug === slug);
}

export function getEndpointById(id: string): ApiEndpointDefinition | undefined {
  return API_ENDPOINTS.find((e) => e.id === id);
}

export function getEndpointsByCategory(): Record<string, ApiEndpointDefinition[]> {
  return API_CATEGORIES.reduce<Record<string, ApiEndpointDefinition[]>>(
    (acc, cat) => {
      acc[cat] = API_ENDPOINTS.filter((e) => e.category === cat);
      return acc;
    },
    {},
  );
}
