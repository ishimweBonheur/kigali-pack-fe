import type { Metadata } from "next";
import { LandingPage } from "@/features/public/landing-page";

export const metadata: Metadata = {
  title: "Kigali-Pack — Build Rwanda-ready applications faster",
  description:
    "Locations, Compliance, Payments Sandbox, Analytics, and Developer Infrastructure in one platform.",
  openGraph: {
    title: "Kigali-Pack Cloud Engine",
    description:
      "Developer infrastructure for Rwanda — locations, compliance, payments, and analytics.",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
