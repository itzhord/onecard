"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  Loader,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import { signUp, signIn, forgetPassword, resetPassword } from "@/lib/auth-client";
import { updateProfile, generateUsername } from "@/lib/supabase";
import SocialAuth from "@/components/SocialAuth";

// Password strength checker
const validatePassword = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noSpaces: !/\s/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  let strength = "weak";

  if (score >= 5) strength = "strong";
  else if (score >= 3) strength = "medium";

  return { checks, score, strength, isValid: score >= 4 };
};

// Password Requirements Component
function PasswordRequirements({ password, visible = true }) {
  if (!visible) return null;

  const { checks } = validatePassword(password);

  const requirements = [
    { key: "length", label: "At least 8 characters", met: checks.length },
    { key: "uppercase", label: "One uppercase letter", met: checks.uppercase },
    { key: "lowercase", label: "One lowercase letter", met: checks.lowercase },
    { key: "number", label: "One number", met: checks.number },
    {
      key: "special",
      label: "One special character (!@#$%^&*)",
      met: checks.special,
    },
    { key: "noSpaces", label: "No spaces", met: checks.noSpaces },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
    >
      <p className="mb-2 text-xs font-medium text-gray-700">
        Password must contain:
      </p>
      <div className="space-y-1">
        {requirements.map((req) => (
          <div key={req.key} className="flex items-center text-xs">
            {req.met ? (
              <Check className="mr-2 h-3 w-3 flex-shrink-0 text-green-600" />
            ) : (
              <X className="mr-2 h-3 w-3 flex-shrink-0 text-gray-400" />
            )}
            <span className={req.met ? "text-green-700" : "text-gray-600"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Password Strength Indicator
function PasswordStrengthIndicator({ password }) {
  const { strength, score } = validatePassword(password);

  if (!password) return null;

  const colors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    strong: "bg-green-500",
  };

  const labels = {
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
  };

  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-gray-600">Password strength</span>
        <span
          className={`text-xs font-medium ${
            strength === "strong"
              ? "text-green-600"
              : strength === "medium"
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {labels[strength]}
        </span>
      </div>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full ${
              level <= score ? colors[strength] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Sign In Form Component (unchanged)
export function SignInForm({ onSuccess, switchToSignUp, switchToReset }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        onSuccess?.();
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
          Sign in to your account
        </p>
      </div>

      <SocialAuth
        onSuccess={onSuccess}
        onError={setError}
        redirectUrl="/dashboard"
      />

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Email Field */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
            </div>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-3 sm:pl-10 sm:text-base"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-10 text-sm transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-3 sm:pl-10 sm:pr-12 sm:text-base"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center rounded-r-lg pr-3 transition-colors duration-200 hover:bg-gray-50"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start rounded-lg border border-red-200 bg-red-50 p-3"
            >
              <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 sm:h-5 sm:w-5" />
              <span className="break-words text-xs text-red-700 sm:text-sm">
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
          ) : (
            <>
              Sign in
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </>
          )}
        </button>

        {/* Links */}
        <div className="space-y-3 text-center sm:space-y-4">
          <button
            type="button"
            onClick={switchToReset}
            className="text-xs text-blue-600 transition-colors duration-200 hover:text-blue-500 sm:text-sm"
          >
            Forgot your password?
          </button>

          <div className="text-xs text-gray-600 sm:text-sm">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={switchToSignUp}
              className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500"
            >
              Sign up
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Enhanced Sign Up Form Component with Strong Password Requirements
export function SignUpForm({ onSuccess, switchToSignIn }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    const { isValid, checks } = validatePassword(formData.password);
    if (!isValid) {
      const missingRequirements = [];
      if (!checks.length) missingRequirements.push("at least 8 characters");
      if (!checks.uppercase) missingRequirements.push("an uppercase letter");
      if (!checks.lowercase) missingRequirements.push("a lowercase letter");
      if (!checks.number) missingRequirements.push("a number");
      if (!checks.special) missingRequirements.push("a special character");
      if (!checks.noSpaces) missingRequirements.push("no spaces");

      setError(`Password must contain ${missingRequirements.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      // Generate username
      const username = generateUsername(formData.firstName, formData.lastName);

      const { data, error } = await signUp.email({
        email: formData.email,
        password: formData.password,
        name: fullName,
        // Store additional user data that will be available after signup
        // Note: Better Auth handles user creation, profile creation will be handled separately
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        try {
          await updateProfile({
            username,
            firstName: formData.firstName,
            lastName: formData.lastName,
            fullName,
          });
        } catch (profileError) {
          console.error("Profile update error:", profileError);
        }

        onSuccess?.();

        router.push(
          "/auth/verify-email?email=" + encodeURIComponent(formData.email)
        );
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setError(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  const handlePasswordBlur = () => {
    // Keep requirements visible if password is not strong enough
    const { isValid } = validatePassword(formData.password);
    if (isValid) {
      setShowPasswordRequirements(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Create account
        </h2>
        <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
          Get started with your smart contact card
        </p>
      </div>

      <SocialAuth
        onSuccess={onSuccess}
        onError={setError}
        redirectUrl="/dashboard"
      />

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
              First name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              </div>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-3 sm:pl-10 sm:text-base"
                placeholder="John"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
              Last name
            </label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-3 sm:text-base"
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
            </div>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-3 sm:pl-10 sm:text-base"
              placeholder="john@company.com"
            />
          </div>
        </div>

        {/* Password Field with Enhanced Validation */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-10 text-sm transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-3 sm:pl-10 sm:pr-12 sm:text-base"
              placeholder="Create a secure password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center rounded-r-lg pr-3 transition-colors duration-200 hover:bg-gray-50"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          <PasswordStrengthIndicator password={formData.password} />

          {/* Password Requirements */}
          <AnimatePresence>
            {showPasswordRequirements && (
              <PasswordRequirements password={formData.password} />
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
            Confirm password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-10 text-sm transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-3 sm:pl-10 sm:pr-12 sm:text-base"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center rounded-r-lg pr-3 transition-colors duration-200 hover:bg-gray-50"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>

          {/* Password Match Indicator */}
          {formData.confirmPassword && (
            <div className="mt-2 flex items-center text-xs">
              {formData.password === formData.confirmPassword ? (
                <>
                  <Check className="mr-1 h-3 w-3 text-green-600" />
                  <span className="text-green-700">Passwords match</span>
                </>
              ) : (
                <>
                  <X className="mr-1 h-3 w-3 text-red-600" />
                  <span className="text-red-700">Passwords don't match</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start rounded-lg border border-red-200 bg-red-50 p-3"
            >
              <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 sm:h-5 sm:w-5" />
              <span className="break-words text-xs text-red-700 sm:text-sm">
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
          ) : (
            <>
              Create account
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </>
          )}
        </button>

        {/* Sign In Link */}
        <div className="text-center">
          <div className="text-xs text-gray-600 sm:text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={switchToSignIn}
              className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500"
            >
              Sign in
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Password Reset Form Component (unchanged)
export function PasswordResetForm({ onSuccess, switchToSignIn }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await forgetPassword({
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      onSuccess?.();
    } catch (error) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mb-6 sm:mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 sm:mb-4 sm:h-16 sm:w-16">
            <CheckCircle className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Check your email
          </h2>
          <p className="mt-1 break-words px-2 text-sm text-gray-600 sm:mt-2 sm:text-base">
            We've sent a password reset link to{" "}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <button
          onClick={switchToSignIn}
          className="text-xs text-blue-600 transition-colors duration-200 hover:text-blue-500 sm:text-sm"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Reset password
        </h2>
        <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
          Enter your email to receive a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Email Field */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-3 sm:pl-10 sm:text-base"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start rounded-lg border border-red-200 bg-red-50 p-3"
            >
              <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 sm:h-5 sm:w-5" />
              <span className="break-words text-xs text-red-700 sm:text-sm">
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
          ) : (
            "Send reset link"
          )}
        </button>

        {/* Back to Sign In */}
        <div className="text-center">
          <button
            type="button"
            onClick={switchToSignIn}
            className="text-xs text-blue-600 transition-colors duration-200 hover:text-blue-500 sm:text-sm"
          >
            Back to sign in
          </button>
        </div>
      </form>
    </div>
  );
}

// New Password Form Component
export function NewPasswordForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!token) {
      setError("Invalid or missing reset token");
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    const { isValid, checks } = validatePassword(formData.password);
    if (!isValid) {
      const missingRequirements = [];
      if (!checks.length) missingRequirements.push("at least 8 characters");
      if (!checks.uppercase) missingRequirements.push("an uppercase letter");
      if (!checks.lowercase) missingRequirements.push("a lowercase letter");
      if (!checks.number) missingRequirements.push("a number");
      if (!checks.special) missingRequirements.push("a special character");
      if (!checks.noSpaces) missingRequirements.push("no spaces");

      setError(`Password must contain ${missingRequirements.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      const { error } = await resetPassword({
        newPassword: formData.password,
        token,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      // onSuccess?.(); // Don't call onSuccess immediately to keep the success message visible
    } catch (error) {
      console.error("Reset password error:", error);
      setError(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  const handlePasswordBlur = () => {
    const { isValid } = validatePassword(formData.password);
    if (isValid) {
      setShowPasswordRequirements(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mb-6 sm:mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 sm:mb-4 sm:h-16 sm:w-16">
            <CheckCircle className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Password Reset Successful
          </h2>
          <p className="mt-1 break-words px-2 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
        </div>

        <button
          onClick={() => onSuccess?.()}
          className="flex w-full items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:py-3"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-600" />
          <h3 className="text-lg font-medium text-red-900">Invalid Link</h3>
          <p className="mt-1 text-sm text-red-700">
            This password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => router.push("/auth/forgot-password")}
            className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Request a new link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Set new password
        </h2>
        <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
          Create a new secure password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Password Field */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
            New Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-10 text-sm transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-3 sm:pl-10 sm:pr-12 sm:text-base"
              placeholder="New password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center rounded-r-lg pr-3 transition-colors duration-200 hover:bg-gray-50"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>

          <PasswordStrengthIndicator password={formData.password} />

          <AnimatePresence>
            {showPasswordRequirements && (
              <PasswordRequirements password={formData.password} />
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-10 text-sm transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-3 sm:pl-10 sm:pr-12 sm:text-base"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center rounded-r-lg pr-3 transition-colors duration-200 hover:bg-gray-50"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start rounded-lg border border-red-200 bg-red-50 p-3"
            >
              <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 sm:h-5 sm:w-5" />
              <span className="break-words text-xs text-red-700 sm:text-sm">
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}
