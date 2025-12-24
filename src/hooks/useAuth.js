"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { getProfile } from "@/lib/supabase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const { data: session, isPending } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function syncUser() {
      if (isPending) {
        if (isMounted) {
          setLoading(true);
        }
        return;
      }

      if (!session?.user) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
          setError(null);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
        setError(null);
      }

      try {
        const { profile } = await getProfile();
        if (!isMounted) return;
        setUser({
          ...session.user,
          profile,
        });
      } catch (err) {
        if (!isMounted) return;
        console.error("Error loading user profile:", err);
        setError(err.message || "Failed to load user profile");
        setUser(session.user);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    syncUser();

    return () => {
      isMounted = false;
    };
  }, [session, isPending]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);

      await signOut();

      // Clear local state
      setUser(null);
      setError(null);
      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      setLoading(true);
      // Better Auth handles session refresh automatically
      // We can just wait for the session to update
      setLoading(false);
    } catch (error) {
      console.error("Error refreshing session:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    session,
    loading,
    error,
    signOut: handleSignOut,
    refreshSession,
    clearError,
    isAuthenticated: !!user,
    isLoading: loading,
    hasError: !!error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Additional hook for checking auth state
export const useAuthState = () => {
  const { user, loading, isAuthenticated } = useAuth();
  return {
    user,
    loading,
    isAuthenticated,
    isAnonymous: !isAuthenticated,
  };
};

// Hook for protected routes
export const useRequireAuth = (redirectTo = "/auth") => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  return { isAuthenticated, loading };
};

// Hook for guest-only routes (redirect authenticated users)
export const useRequireGuest = (redirectTo = "/dashboard") => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  return { isAuthenticated, loading };
};

export default useAuth;
