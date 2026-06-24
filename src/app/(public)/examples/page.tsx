import type { Metadata } from "next";
import { ExamplesPage } from "@/features/public/examples-page";

export const metadata: Metadata = {
  title: "API Examples — Kigali-Pack",
  description: "Interactive API examples with live responses from Kigali-Pack.",
};

export default function Page() {
  return <ExamplesPage />;
}
