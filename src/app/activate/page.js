// src/app/activate/page.js
import { Suspense } from 'react'
import ActivateContent from './ActivateContent'

// Loading component
function ActivateLoading() {
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
          </div>
        </div>
      </header>

      {/* Loading Content */}
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-8 md:py-12">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Loading...
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Preparing your activation page
          </p>
        </div>
      </main>
    </>
  )
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<ActivateLoading />}>
      <ActivateContent />
    </Suspense>
  )
}