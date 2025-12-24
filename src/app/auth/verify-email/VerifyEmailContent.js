'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { useSession } from '@/lib/auth-client'

export default function VerifyEmailContent() {
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const verifiedParam = searchParams.get('verified')
  const errorParam = searchParams.get('error')
  const { data: session } = useSession()

  useEffect(() => {
    // Check if verification was successful from URL param
    if (verifiedParam === 'true') {
      setVerified(true)
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      return
    }

    // Check for errors from URL param
    if (errorParam) {
      const errorMessages = {
        invalid_link: 'Invalid verification link',
        expired_link: 'Verification link has expired',
        user_not_found: 'User not found',
        verification_failed: 'Verification failed. Please try again.',
      }
      setError(errorMessages[errorParam] || 'An error occurred')
      return
    }

    // Check if user is verified via Better Auth session
    if (session?.user?.emailVerified) {
      setVerified(true)
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }, [session, router, verifiedParam, errorParam])

  const resendVerification = async () => {
    if (!email) {
      setError('Email address not found')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email')
      }

      // Show success message
      alert('Verification email sent! Please check your inbox.')
    } catch (error) {
      console.error('Resend error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center max-w-sm sm:max-w-md w-full"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Email Verified!
          </h1>
          
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
            Your email has been successfully verified. Redirecting to your dashboard...
          </p>

          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base font-medium"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Responsive */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <a 
              href="/" 
              className="text-xl sm:text-2xl font-semibold tracking-wide text-black hover:text-gray-700 transition-colors duration-200"
            >
              Onecard
            </a>
            <a 
              href="/auth" 
              className="text-black/80 hover:text-black transition-colors font-medium text-sm sm:text-base"
            >
              Back to Sign In
            </a>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive */}
      <div className="flex items-center justify-center min-h-screen pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center max-w-sm sm:max-w-md w-full"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Check your email
          </h1>

          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed px-2">
            {email ? (
              <>
                We&apos;ve sent a verification link to{' '}
                <span className="font-medium text-gray-900 break-all">{email}</span>
              </>
            ) : (
              'We&apos;ve sent you a verification link'
            )}
          </p>

          <div className="space-y-4 sm:space-y-6">
            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                Next steps:
              </p>
              <ol className="text-xs sm:text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Check your email inbox</li>
                <li>Click the verification link</li>
                <li>Return to this page</li>
              </ol>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-xs sm:text-sm text-red-700 break-words">{error}</p>
              </motion.div>
            )}

            <div className="space-y-3">
              <button
                onClick={resendVerification}
                disabled={loading || !email}
                className="w-full flex items-center justify-center px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Resend verification email
              </button>

              <button
                onClick={() => router.push('/auth')}
                className="w-full px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base font-medium"
              >
                Back to Sign In
              </button>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              Didn&apos;t receive an email? Check your spam folder or try a different email address.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}