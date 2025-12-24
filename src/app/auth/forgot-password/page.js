"use client";

import { PasswordResetForm } from "@/components/AuthForms";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
       <PasswordResetForm switchToSignIn={() => router.push("/auth")} />
    </div>
  );
}
