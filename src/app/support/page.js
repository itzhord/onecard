'use client'

import { motion } from 'framer-motion'
import { Mail, MessageCircle, FileText, Users, Activity, ChevronRight, Search } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function SupportPage() {
  const faqs = [
    {
      question: "How do I create my digital business card?",
      answer: "Sign up for an account, go to your dashboard, and click 'Create Card'. You can customize your card with your photo, contact details, and social links."
    },
    {
      question: "Is Onecard free to use?",
      answer: "Yes, we offer a free plan that includes all essential features. We also have premium plans for advanced analytics and custom branding."
    },
    {
      question: "Can I use my own domain?",
      answer: "Yes, premium users can connect their own custom domain to their digital business card for a more professional look."
    },
    {
      question: "How do I share my card?",
      answer: "You can share your card via QR code, direct link, or by adding it to your Apple Wallet or Google Pay."
    }
  ]

  const supportOptions = [
    {
      icon: <Mail className="w-6 h-6 text-blue-600" />,
      title: "Email Support",
      description: "Get in touch with our support team for personalized assistance.",
      action: "Email Us",
      href: "mailto:support@1necard.co"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: "Community",
      description: "Join our community to connect with other users and share tips.",
      action: "Join Community",
      href: "#"
    },
    {
      icon: <Activity className="w-6 h-6 text-green-600" />,
      title: "System Status",
      description: "Check the current status of our systems and services.",
      action: "Check Status",
      href: "#"
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-50 dark:bg-blue-950/20 rounded-full blur-3xl opacity-50" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            >
              How can we help you?
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto"
            >
              Search our knowledge base or get in touch with our support team.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search for answers..." 
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Support Options Grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {supportOptions.map((option, index) => (
                <motion.a
                  key={option.title}
                  href={option.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                  className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    {option.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {option.description}
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    {option.action}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 lg:py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Quick answers to common questions about Onecard.
              </p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="max-w-4xl mx-auto bg-blue-600 dark:bg-blue-600 rounded-3xl p-8 sm:p-12 text-center text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/grid-pattern.svg')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
                Can't find the answer you're looking for? Our friendly support team is here to help.
              </p>
              <a 
                href="mailto:support@1necard.co"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-blue-600 bg-white rounded-full hover:bg-blue-50 transition-colors duration-200 shadow-lg"
              >
                Contact Support
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
