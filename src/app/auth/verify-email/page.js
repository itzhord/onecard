import { Suspense } from 'react'
import VerifyEmailContent from './VerifyEmailContent'

// Loading component for verify email page
function VerifyEmailLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <a 
              href="/" 
              className="text-xl sm:text-2xl font-semibold tracking-wide text-black hover:text-gray-700 transition-colors duration-200"
            >
              Onecard
            </a>
          </div>
        </div>
      </div>

      {/* Loading Content */}
      <div className="flex items-center justify-center min-h-screen pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="text-center max-w-sm sm:max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Loading...
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed px-2">
            Preparing email verification
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  )
}