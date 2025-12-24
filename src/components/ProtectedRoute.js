"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getProfile } from "@/lib/supabase";

export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = "/auth",
  adminOnly = false,
  loadingComponent,
}) {
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthorization();
  }, [user, loading]);

  const checkAuthorization = async () => {
    if (loading) {
      return;
    }

    setAuthLoading(true);

    try {
      // If authentication is not required
      if (!requireAuth) {
        setIsAuthorized(true);
        return;
      }

      // Check if user is authenticated
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Check for admin access if required
      if (adminOnly) {
        try {
          const { profile } = await getProfile();

          if (profile?.role !== "admin") {
            router.push("/dashboard");
            return;
          }
        } catch (error) {
          console.error("Error verifying admin role:", error);
          router.push("/dashboard");
          return;
        }
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Authorization error:", error);
      router.push(redirectTo);
    } finally {
      setAuthLoading(false);
    }
  };

  // Show loading state
  if (loading || authLoading) {
    if (loadingComponent) {
      return loadingComponent;
    }

    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthorized) {
    return null;
  }

  return children;
}

// Higher-order component wrapper
export function withProtectedRoute(Component, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Admin route wrapper
export function AdminRoute({ children, ...props }) {
  return (
    <ProtectedRoute adminOnly={true} redirectTo="/dashboard" {...props}>
      {children}
    </ProtectedRoute>
  );
}
