import type { Metadata } from "next";
import { PricingPage } from "@/features/public/pricing-page";

export const metadata: Metadata = {
  title: "Pricing — Kigali-Pack",
  description: "Transparent pricing for the Kigali-Pack Cloud Engine developer platform.",
  openGraph: {
    title: "Kigali-Pack Pricing",
    description: "Free, Professional, and Enterprise plans for developers.",
  },
};

export default function Page() {
  return <PricingPage />;
}
