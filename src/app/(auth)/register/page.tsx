import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { isPublicRegistrationEnabled } from "@/lib/super-admin";

export default function RegisterPage() {
  if (!isPublicRegistrationEnabled()) {
    redirect("/login?error=RegistrationDisabled");
  }

  return <RegisterForm />;
}
