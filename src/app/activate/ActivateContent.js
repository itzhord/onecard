"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  Check,
  AlertCircle,
  ArrowLeft,
  Loader,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { activateCard, getCardByCardId, isApiError } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";

export default function ActivateContent() {
  const [step, setStep] = useState(1); // 1: Enter Card ID, 2: Success/Instructions
  const [cardId, setCardId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cardData, setCardData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if card ID is provided in URL
    const urlCardId = searchParams.get("card");
    if (urlCardId) {
      setCardId(urlCardId);
    }
  }, [searchParams]);

  const handleCardActivation = async (e) => {
    e.preventDefault();

    if (!cardId.trim()) {
      setError("Please enter your card ID");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let card;

      try {
        const { card: fetchedCard } = await getCardByCardId(cardId.trim());
        card = fetchedCard;
      } catch (apiError) {
        if (isApiError(apiError) && apiError.status === 404) {
          throw new Error("Card not found. Please check your card ID.");
        }
        if (isApiError(apiError) && apiError.status === 403) {
          throw new Error("This card is already activated by another user");
        }
        throw apiError;
      }

      if (!card) {
        throw new Error("Card not found. Please check your card ID.");
      }

      if (card.isActive) {
        setError("This card is already activated in your account");
        return;
      }

      const { card: activatedCard } = await activateCard(cardId.trim());

      if (!activatedCard) {
        throw new Error("Failed to activate card");
      }

      setCardData(activatedCard);
      setStep(2);
    } catch (error) {
      console.error("Card activation error:", error);
      setError(error.message || "Failed to activate card");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Retry activation after successful auth
    handleCardActivation({ preventDefault: () => {} });
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Card Icon */}
      <div className="flex justify-center mb-6 md:mb-8">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
          Activate Your Card
        </h1>
        <p className="text-base md:text-lg text-gray-600 px-4 md:px-0">
          Enter the card ID found on the back of your Onecard
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleCardActivation} className="space-y-4 md:space-y-6">
        <div>
          <label
            htmlFor="cardId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Card ID
          </label>
          <input
            id="cardId"
            type="text"
            value={cardId}
            onChange={(e) => setCardId(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 md:py-4 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-mono transition-colors"
            placeholder="1NC123456789"
            maxLength={12}
          />
          <p className="mt-2 text-sm text-gray-500">
            Format: 1NC followed by numbers (e.g., 1NC123456789)
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="text-sm md:text-base">{error}</span>
          </motion.div>
        )}

        {!isAuthenticated && (
          <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm md:text-base text-blue-700">
              You need to sign in or create an account to activate your card.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !cardId.trim()}
          className="w-full bg-blue-600 text-white px-6 py-3 md:py-4 text-base font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center min-h-[48px] md:min-h-[56px]"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Activate Card
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>

        <div className="text-center pt-2 md:pt-4">
          <p className="text-sm md:text-base text-gray-600">
            Don&apos;t have a card yet?{" "}
            <a
              href="/get-card"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Get one here
            </a>
          </p>
        </div>
      </form>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Success Icon */}
      <div className="flex justify-center mb-6 md:mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center"
        >
          <Check className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
        </motion.div>
      </div>

      {/* Success Message */}
      <div className="text-center mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
          Card Activated!
        </h1>
        <p className="text-base md:text-lg text-gray-600 px-4 md:px-0">
          Your Onecard is now linked to your account and ready to use.
        </p>
      </div>

      {/* Next Steps */}
      <div className="mb-8 md:mb-10">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 text-center">
          Next Steps:
        </h2>

        <div className="space-y-4 md:space-y-6">
          <div className="flex items-start gap-4 p-4 md:p-6 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2">
                Complete your profile
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                Add your contact information and customize your card
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 md:p-6 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2">
                Start sharing
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                Tap your card on any smartphone to share your details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 md:space-y-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-blue-600 text-white px-6 py-3 md:py-4 text-base font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center min-h-[48px] md:min-h-[56px]"
        >
          Complete Profile Setup
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>

        <button
          onClick={() => router.push("/dashboard?tab=analytics")}
          className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 md:py-4 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center bg-white min-h-[48px] md:min-h-[56px]"
        >
          View Analytics
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                1necard
              </h1>
            </div>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-8 md:py-12">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            {/* Progress Indicator */}
            {step === 1 && (
              <div className="w-full max-w-md mx-auto mb-8 md:mb-12">
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-4 md:space-x-8">
                    <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-blue-600 text-white rounded-full text-sm md:text-base font-semibold">
                      1
                    </div>
                    <div className="w-16 md:w-24 h-0.5 bg-gray-300"></div>
                    <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gray-300 text-gray-500 rounded-full text-sm md:text-base font-semibold">
                      2
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </div>

          {/* Help Text */}
          <div className="text-center mt-8 md:mt-12">
            <p className="text-sm md:text-base text-gray-500">
              Need help? Contact{" "}
              <a
                href="mailto:support@1necard.com"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                support@1necard.com
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode="signin"
      />
    </>
  );
}
