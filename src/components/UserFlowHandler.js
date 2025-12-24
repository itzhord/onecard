'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

/**
 * Complete User Flow Handler
 * Manages the flow from hero section → auth → plan selection → payment
 */
export default function UserFlowHandler() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [flowStep, setFlowStep] = useState('hero') // hero, auth, planning, payment
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Handle "Get Your Card" button from hero section
  const handleGetCardClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      setFlowStep('auth')
    } else {
      // User is authenticated, go to pricing
      router.push('/pricing')
    }
  }

  // Handle "Learn More" button from hero section  
  const handleLearnMoreClick = () => {
    // Scroll to features section or go to features page
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    setFlowStep('planning')
    
    // Redirect to pricing page after successful auth
    router.push('/pricing')
  }

  // Handle plan selection from pricing page
  const handlePlanSelection = (plan) => {
    if (!isAuthenticated) {
      setSelectedPlan(plan)
      setShowAuthModal(true)
      setFlowStep('auth')
      return
    }

    setSelectedPlan(plan)
    setFlowStep('payment')
    // Payment will be handled by PaystackPayment component
  }

  // Handle successful payment
  const handlePaymentSuccess = (paymentResult) => {
    // Redirect to dashboard or success page
    router.push('/dashboard?welcome=true')
  }

  return {
    // Export these functions to be used in your components
    handleGetCardClick,
    handleLearnMoreClick,
    handleAuthSuccess,
    handlePlanSelection,
    handlePaymentSuccess,
    showAuthModal,
    setShowAuthModal,
    selectedPlan,
    flowStep
  }
}

// Hook version for easier use in components
export function useUserFlow() {
  return UserFlowHandler()
}