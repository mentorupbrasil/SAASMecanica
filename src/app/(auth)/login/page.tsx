import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { isPublicRegistrationEnabled } from "@/lib/super-admin";

export default function LoginPage() {
  const allowRegistration = isPublicRegistrationEnabled();

  return (
    <Suspense>
      <LoginForm allowRegistration={allowRegistration} />
    </Suspense>
  );
}
