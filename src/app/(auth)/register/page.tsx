import { redirect } from "next/navigation";
import { PUBLIC_ROUTES } from "@/constants/public";

/** Legacy /register URL — onboarding lives at /get-started */
export default function RegisterRedirectPage() {
  redirect(PUBLIC_ROUTES.getStarted);
}
