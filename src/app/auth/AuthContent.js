'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { SignInForm, SignUpForm, PasswordResetForm } from '@/components/AuthForms'

export default function AuthContent() {
  const [mode, setMode] = useState('signin') // 'signin', 'signup', 'reset'
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check URL parameters for initial mode
    const modeParam = searchParams.get('mode')
    if (modeParam && ['signin', 'signup', 'reset'].includes(modeParam)) {
      setMode(modeParam)
    }
  }, [searchParams])

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  const switchToSignIn = () => setMode('signin')
  const switchToSignUp = () => setMode('signup')
  const switchToReset = () => setMode('reset')

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Responsive */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo - Responsive sizing */}
            <a 
              href="/" 
              className="text-xl sm:text-2xl font-semibold tracking-wide text-black hover:text-gray-700 transition-colors duration-200"
            >
              Onecard
            </a>

            {/* Back to Home Link - Responsive */}
            <a
              href="/"
              className="flex items-center space-x-1 sm:space-x-2 text-black/80 hover:text-black transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Back to </span>
              <span>Home</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content - Improved responsive layout */}
      <div className="flex items-center justify-center min-h-screen pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="w-full max-w-sm sm:max-w-md">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="w-full"
          >
            {mode === 'signin' && (
              <SignInForm
                onSuccess={handleSuccess}
                switchToSignUp={switchToSignUp}
                switchToReset={switchToReset}
              />
            )}

            {mode === 'signup' && (
              <SignUpForm
                onSuccess={handleSuccess}
                switchToSignIn={switchToSignIn}
              />
            )}

            {mode === 'reset' && (
              <PasswordResetForm
                switchToSignIn={switchToSignIn}
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Mobile-specific adjustments */}
      <style jsx>{`
        @media (max-width: 475px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  )
}