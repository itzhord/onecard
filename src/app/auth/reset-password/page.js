"use client";

import { NewPasswordForm } from "@/components/AuthForms";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordContent() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <NewPasswordForm onSuccess={() => router.push("/auth")} />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
