import { Suspense } from "react";
import { VerifyEmailErrorPage } from "@/features/auth/verify-email-error-page";

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailErrorPage />
    </Suspense>
  );
}
