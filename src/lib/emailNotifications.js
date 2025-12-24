// Email Notifications System with Postmark Templates
import { supabase } from './supabase'

// Postmark configuration
const POSTMARK_CONFIG = {
  serverToken: process.env.POSTMARK_SERVER_TOKEN,
  fromEmail: process.env.FROM_EMAIL || 'noreply@1necard.com',
  fromName: process.env.FROM_NAME || 'Onecard'
}

// Postmark template aliases (set these up in your Postmark dashboard)
const POSTMARK_TEMPLATES = {
  welcome: 'welcome-template',
  cardActivated: 'card-activated-template', 
  paymentSuccess: 'payment-success-template',
  profileViewed: 'profile-viewed-template',
  weeklyReport: 'weekly-report-template',
  passwordReset: 'password-reset-template',
  subscriptionExpiring: 'subscription-expiring-template',
  profileShared: 'profile-shared-template',
  teamInvite: 'team-invite-template',
  supportTicket: 'support-ticket-template'
}

// Main email sending function using Postmark templates
export const sendEmailWithTemplate = async (to, templateAlias, templateModel = {}) => {
  try {
    if (!POSTMARK_CONFIG.serverToken) {
      throw new Error('Postmark server token not configured')
    }

    // Send email via API route
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        templateAlias,
        templateModel: {
          ...templateModel,
          company_name: '1necard',
          company_address: 'San Francisco, CA',
          support_email: 'support@1necard.com',
          unsubscribe_url: `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(to)}`
        }
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email')
    }

    // Log email in database
    await logEmail(to, templateAlias, templateModel, 'sent')

    return { success: true, messageId: result.messageId }

  } catch (error) {
    console.error('Email sending error:', error)
    
    // Log failed email
    await logEmail(to, templateAlias, templateModel, 'failed', error.message)

    return { success: false, error: error.message }
  }
}

// Helper function to log emails
const logEmail = async (recipient, template, templateModel, status, errorMessage = null) => {
  try {
    await supabase.from('email_logs').insert([{
      recipient,
      template,
      template_data: templateModel,
      status,
      error_message: errorMessage,
      sent_at: new Date().toISOString()
    }])
  } catch (error) {
    console.error('Error logging email:', error)
  }
}

// Specific email functions
export const sendWelcomeEmail = async (userEmail, userData) => {
  return await sendEmailWithTemplate(userEmail, POSTMARK_TEMPLATES.welcome, {
    user_name: userData.name,
    dashboard_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    activation_url: `${process.env.NEXT_PUBLIC_BASE_URL}/activate`,
    profile_completion_steps: [
      'Complete your profile information',
      'Choose your template design', 
      'Add your social media links',
      'Start sharing your digital card'
    ]
  })
}

export const sendCardActivatedEmail = async (userEmail, userData) => {
  return await sendEmailWithTemplate(userEmail, POSTMARK_TEMPLATES.cardActivated, {
    user_name: userData.name,
    job_title: userData.jobTitle || '',
    company: userData.company || '',
    profile_url: userData.profileUrl,
    dashboard_url: userData.dashboardUrl,
    qr_code_url: userData.qrCodeUrl || '',
    card_features: [
      'Tap to share with NFC',
      'Scan QR code for instant access',
      'Real-time profile updates',
      'Analytics tracking'
    ]
  })
}

export const sendPaymentSuccessEmail = async (userEmail, paymentData) => {
  return await sendEmailWithTemplate(userEmail, POSTMARK_TEMPLATES.paymentSuccess, {
    user_name: paymentData.name,
    plan_name: paymentData.planName,
    amount: paymentData.amount,
    currency: paymentData.currency || 'NGN',
    transaction_id: paymentData.transactionId,
    payment_date: new Date().toLocaleDateString(),
    dashboard_url: paymentData.dashboardUrl,
    premium_features: [
      'Premium templates and customization',
      'Advanced analytics and insights',
      'Lead capture forms',
      'Custom branding options',
      'Priority support'
    ],
    billing_cycle: paymentData.billingCycle || 'one-time'
  })
}

export const sendProfileViewedEmail = async (userEmail, viewData) => {
  // Only send if user has notifications enabled
  const preferences = await getEmailPreferences(viewData.userId)
  if (preferences && !preferences.activity_notifications) {
    return { success: true, skipped: true }
  }

  return await sendEmailWithTemplate(userEmail, POSTMARK_TEMPLATES.profileViewed, {
    user_name: viewData.name,
    viewer_location: viewData.location || 'Unknown location',
    view_time: viewData.viewTime || 'just now',
    total_views: viewData.totalViews || 0,
    unique_visitors: viewData.uniqueVisitors || 0,
    dashboard_url: viewData.dashboardUrl,
    profile_url: viewData.profileUrl
  })
}

export const sendWeeklyReportEmail = async (userEmail, reportData) => {
  return await sendEmailWithTemplate(userEmail, POSTMARK_TEMPLATES.weeklyReport, {
    user_name: reportData.name,
    week_start: reportData.weekStart,
    week_end: reportData.weekEnd,
    weekly_views: reportData.weeklyViews || 0,
    contact_saves: reportData.contactSaves || 0,
    social_clicks: reportData.socialClicks || 0,
    top_clicked_item: reportData.topClick || 'Profile views',
    peak_activity_time: reportData.peakTime || '2:00 PM',
    top_location: reportData.topLocation || 'Unknown',
    dashboard_url: reportData.dashboardUrl,
    growth_percentage: reportData.growthPercentage || 0,
    
    // Fix for insights section
    has_insights: reportData.insights && reportData.insights.length > 0,
    insights: reportData.insights || []
  })
}

export const sendPasswordResetEmail = async (userEmail, resetData) => {
  return await sendEmailWithTemplate(userEmail, POSTMARK_TEMPLATES.passwordReset, {
    user_name: resetData.name,
    reset_url: resetData.resetUrl,
    expiry_time: '1 hour',
    login_url: `${process.env.NEXT_PUBLIC_BASE_URL}/login`
  })
}

export const sendSubscriptionExpiringEmail = async (userEmail, subscriptionData) => {
  return await sendEmailWithTemplate(userEmail, POSTMARK_TEMPLATES.subscriptionExpiring, {
    user_name: subscriptionData.name,
    plan_name: subscriptionData.planName,
    expiry_date: subscriptionData.expiryDate,
    days_until_expiry: subscriptionData.daysUntilExpiry,
    renew_url: subscriptionData.renewUrl,
    features_to_lose: [
      'Premium templates',
      'Advanced analytics',
      'Custom branding',
      'Priority support'
    ]
  })
}

export const sendProfileSharedEmail = async (userEmail, shareData) => {
  return await sendEmailWithTemplate(userEmail, POSTMARK_TEMPLATES.profileShared, {
    user_name: shareData.name,
    sharer_name: shareData.sharerName,
    share_method: shareData.method, // 'email', 'link', 'qr'
    recipient_email: shareData.recipientEmail,
    profile_url: shareData.profileUrl,
    dashboard_url: shareData.dashboardUrl
  })
}

export const sendTeamInviteEmail = async (inviteEmail, inviteData) => {
  return await sendEmailWithTemplate(inviteEmail, POSTMARK_TEMPLATES.teamInvite, {
    invitee_name: inviteData.inviteeName,
    inviter_name: inviteData.inviterName,
    company_name: inviteData.companyName,
    team_role: inviteData.role,
    invite_url: inviteData.inviteUrl,
    invite_expires: inviteData.expiresAt,
    team_benefits: [
      'Centralized team management',
      'Bulk card ordering',
      'Analytics dashboard',
      'Custom branding'
    ]
  })
}

export const sendSupportTicketEmail = async (userEmail, ticketData) => {
  return await sendEmailWithTemplate(userEmail, POSTMARK_TEMPLATES.supportTicket, {
    user_name: ticketData.name,
    ticket_id: ticketData.ticketId,
    ticket_subject: ticketData.subject,
    ticket_status: ticketData.status,
    response_time: ticketData.expectedResponseTime || '24 hours',
    support_url: `${process.env.NEXT_PUBLIC_BASE_URL}/support`,
    ticket_url: `${process.env.NEXT_PUBLIC_BASE_URL}/support/tickets/${ticketData.ticketId}`
  })
}

// Email preferences management
export const updateEmailPreferences = async (userId, preferences) => {
  try {
    const { data, error } = await supabase
      .from('email_preferences')
      .upsert([{
        user_id: userId,
        welcome_emails: preferences.welcome ?? true,
        activity_notifications: preferences.activity ?? true,
        weekly_reports: preferences.weeklyReports ?? true,
        marketing_emails: preferences.marketing ?? false,
        payment_notifications: preferences.payments ?? true,
        security_alerts: preferences.security ?? true,
        product_updates: preferences.productUpdates ?? true,
        updated_at: new Date().toISOString()
      }])

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error updating email preferences:', error)
    return { success: false, error: error.message }
  }
}

export const getEmailPreferences = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    // Return default preferences if none found
    return data || {
      welcome_emails: true,
      activity_notifications: true,
      weekly_reports: true,
      marketing_emails: false,
      payment_notifications: true,
      security_alerts: true,
      product_updates: true
    }
  } catch (error) {
    console.error('Error fetching email preferences:', error)
    return null
  }
}

// Bulk email functions
export const sendBulkEmailWithTemplate = async (recipients, templateAlias, baseTemplateModel = {}) => {
  const results = []
  
  for (const recipient of recipients) {
    try {
      // Check user's email preferences
      if (recipient.userId) {
        const preferences = await getEmailPreferences(recipient.userId)
        
        // Map template to preference setting
        const preferenceMap = {
          [POSTMARK_TEMPLATES.welcome]: 'welcome_emails',
          [POSTMARK_TEMPLATES.profileViewed]: 'activity_notifications',
          [POSTMARK_TEMPLATES.weeklyReport]: 'weekly_reports',
          [POSTMARK_TEMPLATES.paymentSuccess]: 'payment_notifications',
          [POSTMARK_TEMPLATES.passwordReset]: 'security_alerts'
        }
        
        const preferenceKey = preferenceMap[templateAlias]
        if (preferenceKey && preferences && !preferences[preferenceKey]) {
          results.push({
            email: recipient.email,
            success: false,
            error: 'User opted out of this email type'
          })
          continue
        }
      }
      
      const result = await sendEmailWithTemplate(recipient.email, templateAlias, {
        ...baseTemplateModel,
        user_name: recipient.name,
        ...recipient.customData
      })
      
      results.push({
        email: recipient.email,
        success: result.success,
        error: result.error,
        messageId: result.messageId
      })
      
    } catch (error) {
      results.push({
        email: recipient.email,
        success: false,
        error: error.message
      })
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}

// Automated weekly reports
export const scheduleWeeklyReports = async () => {
  try {
    // Get all users who want weekly reports
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        email,
        full_name,
        email_preferences (weekly_reports)
      `)
      .eq('is_active', true)

    if (error) throw error

    const recipients = users.filter(user => 
      !user.email_preferences || user.email_preferences.weekly_reports !== false
    )

    let successCount = 0

    for (const user of recipients) {
      try {
        // Get user's weekly analytics
        const weeklyData = await getUserWeeklyAnalytics(user.user_id)
        
        if (weeklyData) {
          const result = await sendWeeklyReportEmail(user.email, {
            name: user.full_name,
            weekStart: weeklyData.weekStart,
            weekEnd: weeklyData.weekEnd,
            weeklyViews: weeklyData.views,
            contactSaves: weeklyData.contactSaves,
            socialClicks: weeklyData.socialClicks,
            topClick: weeklyData.topClick,
            peakTime: weeklyData.peakTime,
            topLocation: weeklyData.topLocation,
            dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
            growthPercentage: weeklyData.growthPercentage,
            insights: weeklyData.insights
          })

          if (result.success) successCount++
        }
      } catch (error) {
        console.error(`Error sending weekly report to ${user.email}:`, error)
      }

      // Add delay between emails
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log(`Sent weekly reports to ${successCount} users`)
    return { success: true, count: successCount, total: recipients.length }

  } catch (error) {
    console.error('Error scheduling weekly reports:', error)
    return { success: false, error: error.message }
  }
}

// Helper function to get weekly analytics
const getUserWeeklyAnalytics = async (userId) => {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    const endDate = new Date()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!profile) return null

    const { data: views, error } = await supabase
      .from('profile_views')
      .select('*')
      .eq('profile_id', profile.id)
      .gte('viewed_at', startDate.toISOString())

    if (error) throw error

    const totalViews = views?.length || 0
    if (totalViews === 0) return null

    const contactSaves = views?.filter(v => v.action_type === 'contact_save').length || 0
    const socialClicks = views?.filter(v => v.action_type === 'social_click').length || 0

    // Calculate insights
    const insights = []
    if (totalViews > 0) {
      insights.push(`You had ${totalViews} profile views this week`)
    }
    if (contactSaves > 0) {
      insights.push(`${contactSaves} people saved your contact information`)
    }
    if (socialClicks > 0) {
      insights.push(`Your social links were clicked ${socialClicks} times`)
    }

    // Calculate top click type
    const clickTypes = {}
    views?.forEach(view => {
      if (view.action_type) {
        clickTypes[view.action_type] = (clickTypes[view.action_type] || 0) + 1
      }
    })

    const topClick = Object.entries(clickTypes)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Profile views'

    // Calculate peak time
    const hourCounts = {}
    views?.forEach(view => {
      const hour = new Date(view.viewed_at).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })

    const peakHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0]
    const peakTime = peakHour ? `${peakHour}:00` : '12:00 PM'

    // Calculate top location
    const locationCounts = {}
    views?.forEach(view => {
      const location = view.viewer_location || 'Unknown'
      locationCounts[location] = (locationCounts[location] || 0) + 1
    })

    const topLocation = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown'

    return {
      weekStart: startDate.toLocaleDateString(),
      weekEnd: endDate.toLocaleDateString(),
      views: totalViews,
      contactSaves,
      socialClicks,
      topClick,
      peakTime,
      topLocation,
      growthPercentage: Math.floor(Math.random() * 20), // Mock data
      insights
    }

  } catch (error) {
    console.error('Error getting weekly analytics:', error)
    return null
  }
}

// Email template testing
export const sendTestEmail = async (templateAlias, testEmail, testData = {}) => {
  const defaultTestData = {
    user_name: 'Test User',
    dashboard_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    profile_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/testuser`,
    company_name: '1necard',
    support_email: 'support@1necard.com',
    ...testData
  }

  return await sendEmailWithTemplate(testEmail, templateAlias, defaultTestData)
}

// Unsubscribe handling
export const handleUnsubscribe = async (email, type = 'all') => {
  try {
    const { data: user } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single()

    if (!user) {
      // Add to global opt-out list even if user not found
      await supabase.from('email_opt_outs').upsert([{
        email: email,
        opt_out_type: type,
        opted_out_at: new Date().toISOString()
      }])
      return { success: true }
    }

    const preferences = await getEmailPreferences(user.user_id)
    const updatedPreferences = { ...preferences }

    if (type === 'all') {
      updatedPreferences.welcome_emails = false
      updatedPreferences.activity_notifications = false
      updatedPreferences.weekly_reports = false
      updatedPreferences.marketing_emails = false
      updatedPreferences.payment_notifications = false
      updatedPreferences.product_updates = false
      // Keep security alerts enabled for account safety
    } else {
      updatedPreferences[type] = false
    }

    return await updateEmailPreferences(user.user_id, updatedPreferences)

  } catch (error) {
    console.error('Error handling unsubscribe:', error)
    return { success: false, error: error.message }
  }
}

// Email analytics
export const getEmailAnalytics = async (timeRange = '30d') => {
  try {
    const startDate = new Date()
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    startDate.setDate(startDate.getDate() - days)

    const { data: emailLogs, error } = await supabase
      .from('email_logs')
      .select('*')
      .gte('sent_at', startDate.toISOString())
      .order('sent_at', { ascending: false })

    if (error) throw error

    const total = emailLogs.length
    const sent = emailLogs.filter(log => log.status === 'sent').length
    const failed = emailLogs.filter(log => log.status === 'failed').length
    const deliveryRate = total > 0 ? (sent / total) * 100 : 0

    // Group by template
    const templateStats = emailLogs.reduce((acc, log) => {
      acc[log.template] = acc[log.template] || { sent: 0, failed: 0 }
      acc[log.template][log.status] = (acc[log.template][log.status] || 0) + 1
      return acc
    }, {})

    return {
      total,
      sent,
      failed,
      deliveryRate,
      templateStats,
      status: deliveryRate > 95 ? 'excellent' : 
              deliveryRate > 90 ? 'good' : 
              deliveryRate > 80 ? 'fair' : 'poor'
    }
  } catch (error) {
    console.error('Error getting email analytics:', error)
    return null
  }
}

// Export all functions
export default {
  sendEmailWithTemplate,
  sendWelcomeEmail,
  sendCardActivatedEmail,
  sendPaymentSuccessEmail,
  sendProfileViewedEmail,
  sendWeeklyReportEmail,
  sendPasswordResetEmail,
  sendSubscriptionExpiringEmail,
  sendProfileSharedEmail,
  sendTeamInviteEmail,
  sendSupportTicketEmail,
  updateEmailPreferences,
  getEmailPreferences,
  sendBulkEmailWithTemplate,
  scheduleWeeklyReports,
  sendTestEmail,
  handleUnsubscribe,
  getEmailAnalytics,
  POSTMARK_TEMPLATES
}