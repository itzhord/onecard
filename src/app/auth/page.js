import { Suspense } from 'react'
import AuthContent from './AuthContent'

// Loading component for auth page
function AuthLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="w-full max-w-sm sm:max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Loading...
          </h1>
          <p className="text-gray-600">
            Preparing authentication
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthContent />
    </Suspense>
  )
}