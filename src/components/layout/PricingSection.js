'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Crown, Building2, Star, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Basic',
    icon: Zap,
    price: 40000,
    description: 'Perfect for individuals',
    features: [
      'Physical NFC card',
      'QR code ',
      'Digital profile page',
      'Basic templates',
      'Unlimited updates',
      'Contact export',
      'Basic analytics',
      'Email support'
    ],
    popular: false,
    buttonText: 'Get Basic',
    color: 'blue'
  },
  {
    name: 'Premium',
    icon: Crown,
    price: 75000,
    monthly: 8000,
    description: 'Enhanced for professionals',
    features: [
      'Everything in Basic',
      'Premium templates',
      'Custom branding',
      'Advanced analytics',
      'Social integrations',
      'Booking links',
      'Lead capture',
      'Priority support'
    ],
    popular: true,
    buttonText: 'Get Premium',
    color: 'purple'
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 'Custom',
    description: 'Scalable for teams',
    features: [
      'Everything in Premium',
      'Bulk ordering',
      'Team dashboard',
      'Custom domain',
      'API integration',
      'Advanced security',
      'Account manager',
      'Custom features'
    ],
    popular: false,
    buttonText: 'Contact Sales',
    color: 'black'
  }
]

const trustIndicators = [
  { label: '30-Day', sublabel: 'Money Back Guarantee', icon: '🛡️' },
  { label: 'Free', sublabel: 'Worldwide Shipping', icon: '🚚' },
  { label: '24/7', sublabel: 'Customer Support', icon: '💬' },
  { label: '100%', sublabel: 'Secure Payments', icon: '🔒' }
]

export default function OptimizedMinimalPricing() {
  const [billingCycle, setBillingCycle] = useState('annual')

  const handlePurchase = (plan) => {
    console.log(`Purchasing ${plan.name}`)
  }

  const getCardStyles = (color, index) => {
    const styles = {
      blue: {
        card: 'border-blue-200 dark:border-white/10 bg-gradient-to-br from-white to-blue-50/50 dark:from-[hsl(0,0%,10%)] dark:to-[hsl(0,0%,12%)] hover:border-blue-300 dark:hover:border-white/20 hover:shadow-blue-100/50',
        icon: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
        button: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-blue-200/50',
        check: 'bg-blue-600'
      },
      purple: {
        card: 'border-purple-200 dark:border-white/10 bg-gradient-to-br from-white to-purple-50/50 dark:from-[hsl(0,0%,10%)] dark:to-[hsl(0,0%,12%)] hover:border-purple-300 dark:hover:border-white/20 hover:shadow-purple-100/50 shadow-lg lg:scale-105 relative z-10',
        icon: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
        button: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-purple-200/50',
        check: 'bg-purple-600'
      },
      black: {
        card: 'border-gray-300 dark:border-white/10 bg-gradient-to-br from-white to-gray-50/50 dark:from-[hsl(0,0%,10%)] dark:to-[hsl(0,0%,12%)] hover:border-gray-400 dark:hover:border-white/20 hover:shadow-gray-100/50',
        icon: 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white',
        button: 'border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black text-black dark:text-white',
        check: 'bg-black dark:bg-white'
      }
    }
    return styles[color]
  }

  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50/50 to-white dark:from-[hsl(0,0%,3.9%)] dark:to-[hsl(0,0%,8%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-black dark:text-white mb-4 sm:mb-6 leading-tight">
            Simple, transparent
            <span className="block text-blue-600 dark:text-blue-400">pricing</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-black/70 dark:text-white/90 max-w-3xl mx-auto font-normal leading-relaxed mb-6 sm:mb-8 lg:mb-10 px-4 sm:px-0">
            Choose the plan that fits your networking needs. One-time card purchase with optional premium features.
          </p>
          
          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-white dark:bg-[hsl(0,0%,10%)] rounded-full p-1.5 border-2 border-gray-200 dark:border-white/10 shadow-sm"
          >
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                  : 'text-black/70 dark:text-white/80 hover:text-black dark:hover:text-white'
              }`}
            >
              Annual
              {billingCycle === 'annual' && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">Save 20%</span>
              )}
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                  : 'text-black/70 dark:text-white/80 hover:text-black dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 mb-12 sm:mb-16 lg:mb-20">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon
            const styles = getCardStyles(plan.color, index)
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl lg:rounded-3xl border-2 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${styles.card}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center py-3 text-xs sm:text-sm font-semibold tracking-wide"
                  >
                    <Star className="inline w-4 h-4 mr-1" />
                    MOST POPULAR
                  </motion.div>
                )}

                <div className={`p-6 sm:p-8 lg:p-10 ${plan.popular ? 'pt-12 sm:pt-16 lg:pt-18' : ''}`}>
                  {/* Plan Header */}
                  <div className="text-center mb-6 sm:mb-8 lg:mb-10">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 mx-auto mb-4 sm:mb-6 rounded-2xl ${styles.icon} flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-110`}>
                      <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-black dark:text-white mb-2 sm:mb-3">{plan.name}</h3>
                    <p className="text-black/70 dark:text-white/80 text-sm sm:text-base font-medium mb-6 sm:mb-8">{plan.description}</p>
                    
                    {/* Pricing */}
                    <div className="mb-6 sm:mb-8">
                      {plan.price === 'Custom' ? (
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-black dark:text-white">Custom</div>
                      ) : (
                        <div>
                          <div className="flex items-baseline justify-center mb-2">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-black dark:text-white">₦{plan.price.toLocaleString()}</span>
                            <span className="text-black/60 dark:text-white/60 ml-2 text-sm sm:text-base font-medium">NGN</span>
                          </div>
                          <div className="text-xs sm:text-sm text-black/60 dark:text-white/60 font-medium mb-4">One-time card purchase</div>
                          {plan.monthly && (
                            <div className="pt-4 border-t-2 border-black/10 dark:border-white/10">
                              <div className="text-black dark:text-white font-medium text-sm sm:text-base">
                                + ₦{billingCycle === 'annual' 
                                  ? (plan.monthly * 10).toLocaleString() 
                                  : plan.monthly.toLocaleString()
                                }/{billingCycle === 'annual' ? 'year' : 'month'}
                              </div>
                              <div className="text-xs sm:text-sm text-black/60 dark:text-white/60 font-medium">for premium features</div>
                              {billingCycle === 'annual' && (
                                <div className="text-xs text-emerald-600 font-medium mt-1">Save 2 months!</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: featureIndex * 0.05 }}
                        viewport={{ once: true }}
                        className="flex items-start"
                      >
                        <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-0.5 ${styles.check}`}>
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <span className="text-black/90 dark:text-white/90 text-sm sm:text-base font-medium leading-relaxed">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePurchase(plan)}
                    className={`w-full py-3.5 sm:py-4 lg:py-5 px-6 rounded-full font-medium transition-all duration-300 text-sm sm:text-base lg:text-lg flex items-center justify-center group ${styles.button} touch-manipulation`}
                  >
                    {plan.buttonText}
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16 lg:mb-20"
        >
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-[hsl(0,0%,10%)] dark:to-[hsl(0,0%,14.9%)] rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12 border-2 border-emerald-200/50 dark:border-white/10 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {trustIndicators.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group cursor-pointer"
                >
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                    {item.label}
                  </div>
                  <div className="text-xs sm:text-sm lg:text-base text-black/70 dark:text-white/70 font-medium">
                    {item.sublabel}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="bg-white dark:bg-[hsl(0,0%,10%)] rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12 border-2 border-gray-200 dark:border-white/10 shadow-sm">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-black dark:text-white mb-3 sm:mb-4 lg:mb-6">
              Still have questions?
            </h3>
            <p className="text-black/70 dark:text-white/90 mb-6 sm:mb-8 lg:mb-10 font-normal text-sm sm:text-base lg:text-lg px-4 sm:px-0">
              Our support team is here to help you choose the perfect plan and get started with your professional networking journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto sm:max-w-none">
              <button className="border-2 border-black dark:border-white text-black dark:text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 font-medium text-sm sm:text-base shadow-sm hover:shadow-md touch-manipulation">
                View FAQ
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium text-sm sm:text-base shadow-md hover:shadow-lg touch-manipulation">
                Contact Support
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}