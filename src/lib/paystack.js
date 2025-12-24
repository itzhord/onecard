// Paystack Payment Integration
import { supabase } from './supabase'

// Initialize Paystack
export const initializePaystack = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.onload = () => resolve(window.PaystackPop)
      script.onerror = reject
      document.head.appendChild(script)
    }
  })
}

// Payment plans configuration
export const paymentPlans = {
  basic: {
    name: 'Basic Card',
    price: 40000, // in kobo (₦400)
    currency: 'NGN',
    features: [
      'Physical NFC card',
      'Digital profile page', 
      'Basic templates',
      'Contact export',
      'Unlimited updates',
      'Email support'
    ]
  },
  premium: {
    name: 'Premium Card',
    price: 75000, // in kobo (₦750)
    currency: 'NGN',
    monthly: 8000, // ₦80 monthly for premium features
    features: [
      'Everything in Basic',
      'Premium templates',
      'Custom branding',
      'Advanced analytics',
      'Social integrations',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // Custom pricing
    currency: 'NGN',
    features: [
      'Everything in Premium',
      'Bulk ordering',
      'Team dashboard',
      'Custom domain',
      'API integration',
      'Account manager'
    ]
  }
}

// Process one-time card payment
export const processCardPayment = async (plan, userEmail, metadata = {}) => {
  try {
    const PaystackPop = await initializePaystack()
    
    return new Promise((resolve, reject) => {
      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: userEmail,
        amount: plan.price * 100, // Amount in cents
        currency: plan.currency,
        ref: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          plan_type: plan.name,
          card_purchase: true,
          ...metadata
        },
        callback: function(response) {
          // Payment successful
          console.log('Payment successful:', response)
          resolve(response)
        },
        onClose: function() {
          reject(new Error('Payment cancelled'))
        }
      })
      
      handler.openIframe()
    })
  } catch (error) {
    throw new Error(`Payment initialization failed: ${error.message}`)
  }
}

// Process subscription payment
export const processSubscriptionPayment = async (plan, userEmail, metadata = {}) => {
  try {
    const PaystackPop = await initializePaystack()
    
    return new Promise((resolve, reject) => {
      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: userEmail,
        amount: plan.monthly * 100 * 12, // Annual subscription
        currency: plan.currency,
        ref: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        plan: `premium_annual_${plan.monthly * 12}`, // Paystack plan code
        metadata: {
          plan_type: plan.name,
          subscription: true,
          billing_cycle: 'annual',
          ...metadata
        },
        callback: function(response) {
          console.log('Subscription payment successful:', response)
          resolve(response)
        },
        onClose: function() {
          reject(new Error('Subscription payment cancelled'))
        }
      })
      
      handler.openIframe()
    })
  } catch (error) {
    throw new Error(`Subscription initialization failed: ${error.message}`)
  }
}

// Verify payment with backend
export const verifyPayment = async (reference) => {
  try {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference })
    })
    
    if (!response.ok) {
      throw new Error('Payment verification failed')
    }
    
    return await response.json()
  } catch (error) {
    throw new Error(`Payment verification failed: ${error.message}`)
  }
}

// Create payment record in database
export const createPaymentRecord = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        user_id: paymentData.userId,
        reference: paymentData.reference,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        plan_type: paymentData.planType,
        payment_type: paymentData.paymentType, // 'card' or 'subscription'
        metadata: paymentData.metadata
      }])
      .select()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Update user subscription status
export const updateUserSubscription = async (userId, subscriptionData) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert([{
        user_id: userId,
        plan_type: subscriptionData.planType,
        status: 'active',
        paystack_subscription_id: subscriptionData.subscriptionId,
        started_at: new Date().toISOString(),
        expires_at: subscriptionData.expiresAt
      }])
      .select()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Cancel subscription
export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await fetch('/api/payments/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId })
    })
    
    if (!response.ok) {
      throw new Error('Subscription cancellation failed')
    }
    
    return await response.json()
  } catch (error) {
    throw new Error(`Subscription cancellation failed: ${error.message}`)
  }
}

// Get user's active subscription
export const getUserSubscription = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Payment webhook handler (for API route)
export const handlePaymentWebhook = async (payload, signature) => {
  try {
    // Verify webhook signature
    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex')
    
    if (hash !== signature) {
      throw new Error('Invalid webhook signature')
    }
    
    // Process different webhook events
    switch (payload.event) {
      case 'charge.success':
        return await handleSuccessfulPayment(payload.data)
      case 'subscription.create':
        return await handleSubscriptionCreated(payload.data)
      case 'subscription.disable':
        return await handleSubscriptionCancelled(payload.data)
      default:
        console.log('Unhandled webhook event:', payload.event)
        return { status: 'ignored' }
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    throw error
  }
}

// Handle successful payment
const handleSuccessfulPayment = async (paymentData) => {
  try {
    // Update payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('reference', paymentData.reference)
    
    if (paymentError) throw paymentError
    
    // If it's a subscription payment, update subscription
    if (paymentData.metadata?.subscription) {
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Add 1 year
      
      await updateUserSubscription(paymentData.metadata.user_id, {
        planType: paymentData.metadata.plan_type,
        subscriptionId: paymentData.subscription?.subscription_code,
        expiresAt: expiresAt.toISOString()
      })
    }
    
    return { status: 'processed' }
  } catch (error) {
    console.error('Error handling successful payment:', error)
    throw error
  }
}