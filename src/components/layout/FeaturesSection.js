'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const features = [
  {
    icon: "https://imagedelivery.net/N6_NAPmq3Z6gEZfBCN4EDA/1fbe8bdf-b454-4f01-fe5b-85b7dc955100/cards",
    title: 'Only one person needs a Onecard and everyone can connect',
    description: 'Share your contact information instantly with anyone, regardless of what device they have.',
    color: 'blue'
  },
  {
    icon: "https://imagedelivery.net/N6_NAPmq3Z6gEZfBCN4EDA/c5875aa8-789e-4211-eb63-ce6616492e00/cards",
    title: 'Work with all types of phones. Both iPhone and Android.',
    description: 'Universal compatibility across all smartphone platforms without any limitations.',
    color: 'emerald'
  },
  {
    icon: "https://imagedelivery.net/N6_NAPmq3Z6gEZfBCN4EDA/af29565a-d548-466b-caf0-444f1447a200/cards",
    title: 'No app needed. Your digital profile opens in their browser',
    description: 'Recipients access your information directly through their web browser - no downloads required.',
    color: 'amber'
  },
  {
    icon: "https://imagedelivery.net/N6_NAPmq3Z6gEZfBCN4EDA/9931e535-81c9-4126-6123-ab1fa2b29a00/cards",
    title: 'One contactless card for life. Update your info anytime.',
    description: 'Your card stays current forever - update your details and they reflect immediately.',
    color: 'purple'
  }
]

const cardImages = [
  {
    url: "https://imagedelivery.net/N6_NAPmq3Z6gEZfBCN4EDA/34701a86-771d-457e-2a35-ca310e491100/cards",
    name: "Classic Professional"
  },
  {
    url: "https://imagedelivery.net/N6_NAPmq3Z6gEZfBCN4EDA/28b19b2d-05c5-4d69-f53a-93f9d9df3200/cards",
    name: "Modern Minimal"
  },
  {
    url: "https://imagedelivery.net/N6_NAPmq3Z6gEZfBCN4EDA/c0f32299-bc10-45f8-a15e-a5ed51e0f100/cards",
    name: "Creative Bold"
  },
  {
    url: "https://imagedelivery.net/N6_NAPmq3Z6gEZfBCN4EDA/47299a76-dae8-420e-1ebd-e86d5120c700/cards",
    name: "Executive Elite"
  },
  {
    url: "https://imagedelivery.net/N6_NAPmq3Z6gEZfBCN4EDA/45054188-7b4f-4249-6a78-d92a1a339300/cards",
    name: "Tech Gradient"
  },
  {
    url: "https://imagedelivery.net/N6_NAPmq3Z6gEZfBCN4EDA/154db486-8e5a-47c2-9436-85dd3ce46100/cards",
    name: "Artistic Flow"
  }
]

export default function OptimizedMinimalFeatures() {
  const [selectedCard, setSelectedCard] = useState(null)

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-300',
      icon: 'bg-blue-100',
      text: 'text-blue-700'
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-300',
      icon: 'bg-emerald-100',
      text: 'text-emerald-700'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      hoverBorder: 'hover:border-amber-300',
      icon: 'bg-amber-100',
      text: 'text-amber-700'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      hoverBorder: 'hover:border-purple-300',
      icon: 'bg-purple-100',
      text: 'text-purple-700'
    }
  }

  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50/50 dark:from-[hsl(0,0%,8%)] dark:to-[hsl(0,0%,3.9%)]">
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
            Everything you need to
            <span className="block text-blue-600 dark:text-blue-400">connect professionally</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-black/70 dark:text-white/90 max-w-3xl mx-auto font-normal leading-relaxed px-4 sm:px-0">
            Only one person needs a Onecard and everyone can connect seamlessly
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 mb-16 sm:mb-20 lg:mb-24">
          {features.map((feature, index) => {
            const colors = colorClasses[feature.color]
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`group p-6 sm:p-8 lg:p-10 rounded-2xl lg:rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${colors.bg} dark:bg-[hsl(0,0%,10%)] ${colors.border} dark:border-white/10 ${colors.hoverBorder} dark:hover:border-white/20 touch-manipulation`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                  <div className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 ${colors.icon} dark:bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0 group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                    <img 
                      src={feature.icon} 
                      alt=""
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain" 
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black dark:text-white mb-3 sm:mb-4 leading-tight">
                      {feature.title}
                    </h3>
                    
                    <p className="text-black/70 dark:text-white/80 leading-relaxed font-normal text-sm sm:text-base lg:text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Card Designs Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-black dark:text-white mb-3 sm:mb-4 lg:mb-6">
              Choose your perfect design
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-black/70 dark:text-white/90 font-normal px-4 sm:px-0 max-w-2xl mx-auto">
              Professionally designed templates that make the right impression every time
            </p>
          </div>
          
          {/* Card Images Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {cardImages.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                onClick={() => setSelectedCard(selectedCard === index ? null : index)}
              >
                <div className={`relative rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden bg-white dark:bg-[hsl(0,0%,10%)] border-2 border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 ${selectedCard === index ? 'ring-4 ring-blue-500/20 border-blue-400 dark:border-blue-500 -translate-y-2 shadow-lg' : ''}`}>
                  <div className="aspect-[5/3] overflow-hidden p-3 sm:p-4 lg:p-6">
                    <img 
                      src={card.url} 
                      alt={card.name}
                      className={`w-full h-full object-contain transition-transform duration-300 ${selectedCard === index ? 'scale-105' : 'group-hover:scale-105'}`}
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Card Name Overlay */}
                  <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-6 transition-opacity duration-300 ${selectedCard === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <p className="text-white font-medium text-sm sm:text-base">{card.name}</p>
                  </div>

                  {/* Selection Indicator */}
                  {selectedCard === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-8 sm:mt-12 lg:mt-16"
          >
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-[hsl(0,0%,10%)] dark:to-[hsl(0,0%,14.9%)] rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12 border-2 border-blue-100 dark:border-white/10 max-w-2xl mx-auto">
              <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black dark:text-white mb-3 sm:mb-4">
                Ready to get started?
              </h4>
              <p className="text-black/70 dark:text-white/90 mb-6 sm:mb-8 text-sm sm:text-base px-4 sm:px-0">
                Choose your design and start networking professionally today
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium text-sm sm:text-base shadow-md hover:shadow-lg touch-manipulation">
                  Get Your Card
                </button>
                <button className="border-2 border-black dark:border-white text-black dark:text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 font-medium text-sm sm:text-base touch-manipulation">
                  View Pricing
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}