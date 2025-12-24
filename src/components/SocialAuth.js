"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { signIn } from "@/lib/auth-client";

// Logo component for official brand logos
const BrandLogo = ({ src, alt, className = "w-4 h-4 sm:w-5 sm:h-5" }) => (
  <img src={src} alt={alt} className={className} style={{ filter: "none" }} />
);

export default function SocialAuth({
  onSuccess,
  onError,
  redirectUrl = "/dashboard",
}) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const { data, error } = await signIn.social({
        provider: "google",
      });

      if (error) throw error;

      // Success callback
      onSuccess?.(data);
    } catch (error) {
      console.error("Google login error:", error);
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center py-2.5 sm:py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
      >
        {loading ? (
          <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2 sm:mr-3" />
        ) : (
          <BrandLogo
            src="https://cdn.simpleicons.org/google/white"
            alt="Google logo"
            className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3"
          />
        )}
        <span className="truncate">
          {loading ? "Connecting..." : "Continue with Google"}
        </span>
      </motion.button>

      <div className="relative my-4 sm:my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="px-2 bg-white text-gray-500">
            or continue with email
          </span>
        </div>
      </div>
    </div>
  );
}

// Social Login Button Component (for individual use)
export function SocialLoginButton({
  label = "Continue with Google",
  className = "",
  onSuccess,
  onError,
}) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const { data, error } = await signIn.social({
        provider: "google",
      });

      if (error) throw error;
      onSuccess?.(data);
    } catch (error) {
      console.error("Google login error:", error);
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className={`flex items-center justify-center py-2.5 sm:py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base ${className}`}
    >
      {loading ? (
        <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
      ) : (
        <BrandLogo
          src="https://cdn.simpleicons.org/google/white"
          alt="Google logo"
          className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
        />
      )}
      <span className="truncate">{loading ? "Connecting..." : label}</span>
    </button>
  );
}

// Social Account Linking Component (for settings)
export function SocialAccountLinking({ userId }) {
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLinkAccount = async () => {
    try {
      setLoading(true);

      // Better Auth handles social account linking differently
      // For now, we'll implement this as a social sign-in that links to existing account
      const { data, error } = await signIn.social({
        provider: "google",
      });

      if (error) throw error;

      setIsLinked(true);
    } catch (error) {
      console.error("Error linking Google:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkAccount = async () => {
    try {
      setLoading(true);

      // Better Auth doesn't have a direct unlink method
      // This would need to be handled through the admin API or database directly
      // For now, we'll show an error
      throw new Error("Account unlinking not yet implemented with Better Auth");
    } catch (error) {
      console.error("Error unlinking Google:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
        Connected Accounts
      </h3>
      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
        Link your Google account for easier sign-in
      </p>

      <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200">
        <div className="flex items-center min-w-0 flex-1">
          <BrandLogo
            src="https://cdn.simpleicons.org/google"
            alt="Google logo"
            className="w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
              Google
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {isLinked ? "Connected" : "Not connected"}
            </p>
          </div>
        </div>

        <button
          onClick={isLinked ? handleUnlinkAccount : handleLinkAccount}
          disabled={loading}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm flex-shrink-0 ml-3 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isLinked
              ? "bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500"
              : "bg-accent text-white hover:bg-blue-600 focus:ring-blue-500"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
          ) : isLinked ? (
            "Disconnect"
          ) : (
            "Connect"
          )}
        </button>
      </div>
    </div>
  );
}
