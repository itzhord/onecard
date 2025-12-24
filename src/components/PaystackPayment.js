"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader, CreditCard, Check, AlertCircle, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createPaymentRecord, verifyPayment } from "@/lib/supabase";

// Payment plans configuration
export const paymentPlans = {
  basic: {
    name: "Basic Card",
    price: 4000000, // in kobo (₦40,000)
    currency: "NGN",
    features: [
      "Physical NFC card",
      "Digital profile page",
      "Basic templates",
      "Contact export",
      "Unlimited updates",
      "Email support",
    ],
  },
  premium: {
    name: "Premium Card",
    price: 7500000, // in kobo (₦75,000)
    currency: "NGN",
    monthly: 8000, // ₦80 monthly for premium features
    features: [
      "Everything in Basic",
      "Premium templates",
      "Custom branding",
      "Advanced analytics",
      "Social integrations",
      "Priority support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: null, // Custom pricing
    currency: "NGN",
    features: [
      "Everything in Premium",
      "Bulk ordering",
      "Team dashboard",
      "Custom domain",
      "API integration",
      "Account manager",
    ],
  },
};

// Initialize Paystack
const initializePaystack = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => resolve(window.PaystackPop);
      script.onerror = reject;
      document.head.appendChild(script);
    } else {
      reject(new Error("Window not available"));
    }
  });
};

// Main Payment Component
export default function PaystackPayment({
  plan,
  onSuccess,
  onError,
  onCancel,
  isSubscription = false,
  buttonText,
  buttonClassName = "",
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      onError?.("Please sign in to continue");
      return;
    }

    if (!plan || (!plan.price && plan.name !== "Enterprise")) {
      onError?.("Invalid payment plan");
      return;
    }

    setLoading(true);

    try {
      // Initialize Paystack
      const PaystackPop = await initializePaystack();

      // Generate payment reference
      const reference = `${isSubscription ? "sub" : "card"}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const amountMajor = (plan.price / 100).toFixed(2);

      // Create payment record
      await createPaymentRecord({
        userId: user.id,
        reference,
        amount: amountMajor,
        currency: plan.currency,
        paymentType: isSubscription ? "subscription" : "card",
        metadata: {
          plan_type: plan.name,
          user_id: user.id,
          subscription: isSubscription,
          card_purchase: !isSubscription,
        },
      });

      // Configure Paystack payment
      const paymentConfig = {
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: plan.price, // Amount in kobo
        currency: plan.currency,
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: "Plan Type",
              variable_name: "plan_type",
              value: plan.name,
            },
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: user.id,
            },
          ],
        },
        callback: function (response) {
          console.log("Payment successful:", response);
          handlePaymentSuccess(response);
        },
        onClose: function () {
          console.log("Payment cancelled");
          setLoading(false);
          onCancel?.();
        },
      };

      // Add subscription-specific config
      if (isSubscription && plan.monthly) {
        paymentConfig.plan = `premium_monthly_${plan.monthly}`;
      }

      // Open Paystack modal
      const handler = PaystackPop.setup(paymentConfig);
      handler.openIframe();
    } catch (error) {
      console.error("Payment initialization error:", error);
      setLoading(false);
      onError?.(error.message || "Payment initialization failed");
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      const verificationResult = await verifyPayment(response.reference);

      console.log("Payment verified:", verificationResult);
      onSuccess?.(verificationResult);
    } catch (error) {
      console.error("Payment verification error:", error);
      onError?.(error.message || "Payment verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (plan.name === "Enterprise") {
    return (
      <button
        onClick={() => window.open("mailto:sales@1necard.com", "_blank")}
        className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-medium transition-all duration-200 border-2 border-black text-black hover:bg-black hover:text-white text-sm sm:text-base ${buttonClassName}`}
        disabled={disabled}
      >
        Contact Sales
      </button>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading || disabled}
      className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${buttonClassName}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          <span className="hidden sm:inline">Processing...</span>
          <span className="sm:hidden">Wait...</span>
        </div>
      ) : (
        buttonText || (
          <>
            <span className="hidden sm:inline">
              Get {plan.name} - ₦{(plan.price / 100).toLocaleString()}
            </span>
            <span className="sm:hidden">
              ₦{(plan.price / 100).toLocaleString()}
            </span>
          </>
        )
      )}
    </button>
  );
}

// Payment Success Modal - Mobile Optimized
export function PaymentSuccessModal({ isOpen, onClose, paymentData, loading = false }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-4 sm:p-8 max-w-sm sm:max-w-md w-full text-center"
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
          Payment Successful!
        </h2>

        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Thank you for your purchase. Your {paymentData?.planType || "card"} is
          being processed.
        </p>

        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm text-gray-600 space-y-2">
            <div className="flex justify-between items-center">
              <span>Amount:</span>
              <span className="font-medium">
                ₦{paymentData?.amount?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span>Reference:</span>
              <span className="font-medium text-right break-all ml-2 text-xs">
                {paymentData?.reference}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Setting up your dashboard...
            </>
          ) : (
            "Continue to Dashboard"
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}

// Payment Error Modal - Mobile Optimized
export function PaymentErrorModal({ isOpen, onClose, error, onRetry }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-4 sm:p-8 max-w-sm sm:max-w-md w-full text-center"
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
          Payment Failed
        </h2>

        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          {error || "Something went wrong with your payment. Please try again."}
        </p>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Try Again
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Payment Plan Card Component - Mobile First Design
export function PaymentPlanCard({ plan, isPopular, onSelect, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
        isPopular
          ? "border-blue-500 shadow-lg sm:scale-105"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-xs sm:text-sm font-semibold z-10">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
          MOST POPULAR
        </div>
      )}

      <div className={`p-4 sm:p-6 lg:p-8 ${isPopular ? "pt-10 sm:pt-12" : ""}`}>
        {/* Plan Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            {plan.name}
          </h3>

          {plan.price ? (
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                ₦{(plan.price / 100).toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                One-time payment
              </div>
              {plan.monthly && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs sm:text-sm text-gray-600">
                    + ₦{plan.monthly}/month for premium features
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              Custom
            </div>
          )}
        </div>

        {/* Features List */}
        <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm lg:text-base text-gray-700">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <PaystackPayment
          plan={plan}
          onSuccess={(data) => onSelect?.(plan, data)}
          onError={(error) => console.error("Payment error:", error)}
          buttonClassName={`${
            isPopular
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
          disabled={loading}
        />
      </div>
    </motion.div>
  );
}

// Responsive Payment Plans Grid
export function PaymentPlansGrid({
  plans = paymentPlans,
  onPlanSelect,
  loading,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
      {Object.entries(plans).map(([key, plan]) => (
        <PaymentPlanCard
          key={key}
          plan={plan}
          isPopular={key === "premium"}
          onSelect={onPlanSelect}
          loading={loading}
        />
      ))}
    </div>
  );
}

// Mobile-First Payment Summary Component
export function PaymentSummary({ plan, isSubscription }) {
  if (!plan) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
      <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
        Order Summary
      </h4>

      <div className="space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{plan.name}</span>
          <span className="font-medium">
            {plan.price ? `₦${(plan.price / 100).toLocaleString()}` : "Custom"}
          </span>
        </div>

        {isSubscription && plan.monthly && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Monthly premium features</span>
            <span className="font-medium">₦{plan.monthly}/month</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-center font-semibold">
            <span>Total</span>
            <span>
              {plan.price
                ? `₦${(plan.price / 100).toLocaleString()}`
                : "Contact Sales"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Payment Button for Mobile
export function QuickPayButton({ plan, onSuccess, onError, className = "" }) {
  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:relative sm:bottom-auto sm:left-auto sm:right-auto ${className}`}
    >
      <PaystackPayment
        plan={plan}
        onSuccess={onSuccess}
        onError={onError}
        buttonClassName="bg-blue-600 text-white hover:bg-blue-700 shadow-lg sm:shadow-none"
        buttonText={`Pay ₦${(plan.price / 100).toLocaleString()}`}
      />
    </div>
  );
}
