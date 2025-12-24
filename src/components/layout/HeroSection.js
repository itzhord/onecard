'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import AuthModal from '@/components/AuthModal'
import Image from 'next/image'

export default function OptimizedMinimalHero() {
  const [isCardTouched, setIsCardTouched] = useState(false)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('signup')
  
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setIsCardTouched(true)
      setTimeout(() => setShowContactInfo(true), 600)
      setTimeout(() => {
        setShowContactInfo(false)
        setIsCardTouched(false)
      }, 3500)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const handleGetCardClick = () => {
    if (isAuthenticated) {
      router.push('/pricing')
    } else {
      setAuthMode('signup')
      setShowAuthModal(true)
    }
  }

  const handleLearnMoreClick = () => {
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    router.push('/pricing')
  }

  const cardVariants = {
    initial: { 
      x: -80, 
      y: 60, 
      rotate: -18, 
      scale: 0.75,
      zIndex: 10
    },
    touching: {
      x: -15, 
      y: -20, 
      rotate: -8, 
      scale: 0.85,
      zIndex: 35,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  }

  const phoneVariants = {
    initial: { scale: 1 },
    touched: { 
      scale: 1.02, 
      y: -2,
      transition: { duration: 0.4, ease: "easeOut" } 
    }
  }

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.8 },
    animate: { 
      scale: [1, 2.8, 3.5], 
      opacity: [0.8, 0.3, 0] 
    }
  }

  return (
    <>
      <section className="min-h-screen flex items-center bg-gradient-to-b from-white to-blue-50/30 dark:from-[hsl(0,0%,3.9%)] dark:to-[hsl(0,0%,8%)] pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left order-2 lg:order-1 px-2 sm:px-0"
            >
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-medium text-black dark:text-white leading-[1.15] sm:leading-tight mb-4 sm:mb-6"
              >
                Professional networking,
                <span className="block font-semibold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                  simplified
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-base sm:text-lg lg:text-xl text-black/70 dark:text-white/90 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed"
              >
                Share your contact details instantly with a simple tap. 
                <span className="block sm:inline"> No apps required.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8 sm:mb-12"
              >
                <motion.button 
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGetCardClick}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium flex items-center justify-center shadow-lg hover:shadow-xl touch-manipulation text-sm sm:text-base"
                >
                  {isAuthenticated ? 'View Pricing' : 'Get Your Card'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLearnMoreClick}
                  className="border-2 border-black dark:border-white text-black dark:text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 font-medium shadow-sm hover:shadow-md touch-manipulation text-sm sm:text-base"
                >
                  Learn More
                </motion.button>
              </motion.div>

              {/* Status indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex items-center justify-center lg:justify-start space-x-6 sm:space-x-8 text-xs sm:text-sm text-black/60 dark:text-white/70 font-medium"
              >
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse flex-shrink-0"></div>
                  <span className="whitespace-nowrap">NFC Enabled</span>
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse flex-shrink-0"></div>
                  <span className="whitespace-nowrap">Instant Updates</span>
                </span>
              </motion.div>
            </motion.div>

            {/* Animation - Phone Demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex justify-center order-1 lg:order-2 py-8 lg:py-0"
            >
              <div className="relative scale-[0.65] sm:scale-75 md:scale-85 lg:scale-90 xl:scale-100">
                
                {/* Phone with Images */}
                <motion.div
                  variants={phoneVariants}
                  animate={isCardTouched ? "touched" : "initial"}
                  className="relative z-20 mx-auto"
                >
                  {/* Phone Frame */}
                  <div className="relative w-44 h-[350px] sm:w-48 sm:h-[400px] lg:w-52 lg:h-[430px] xl:w-56 xl:h-[460px] bg-gradient-to-b from-gray-800 to-black rounded-[2.5rem] p-2.5 shadow-2xl">
                    <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                      <AnimatePresence mode="wait">
                        {!showContactInfo ? (
                          <motion.div
                            key="phone"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 z-10"
                          >
                            <Image
                              src="/images/phone.png"
                              alt="Phone screen"
                              fill
                              className="object-cover rounded-[1.75rem]"
                              priority
                              sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 208px, 224px"
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="cardinfo"
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute inset-0 z-10"
                          >
                            <Image
                              src="/images/cardinfo.png"
                              alt="Card information displayed"
                              fill
                              className="object-cover rounded-[1.75rem]"
                              sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 208px, 224px"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* NFC indicator rings */}
                  <AnimatePresence>
                    {isCardTouched && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                      >
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            variants={pulseVariants}
                            initial="initial"
                            animate="animate"
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              delay: i * 0.3,
                              ease: "easeOut"
                            }}
                            className="absolute w-10 h-10 border-2 border-blue-400 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          />
                        ))}
                        <div className="w-4 h-4 bg-blue-500 rounded-full relative z-10 mx-auto"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* NFC Card Image */}
                <motion.div
                  variants={cardVariants}
                  animate={isCardTouched ? "touching" : "initial"}
                  className="absolute top-20 sm:top-24 -left-20 sm:-left-24 w-40 h-24 sm:w-44 sm:h-28 lg:w-48 lg:h-30 xl:w-52 xl:h-32"
                  style={{ zIndex: isCardTouched ? 35 : 10 }}
                >
                  <Image
                    src="/images/onecard.png"
                    alt="OneCard NFC Card"
                    fill
                    className="object-contain drop-shadow-2xl"
                    sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 208px"
                  />
                  
                  {/* NFC Symbol on Card */}
                  <AnimatePresence>
                    {isCardTouched && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 w-6 h-6 border-2 border-blue-400 rounded-full flex items-center justify-center bg-blue-50/90 backdrop-blur-sm"
                      >
                        <motion.div 
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [1, 0.7, 1]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-3 h-3 bg-blue-500 rounded-full"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Subtle background glow */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </>
  )
}