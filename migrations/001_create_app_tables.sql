-- OneCard Database Migration
-- This script creates all application tables that work alongside Better Auth tables
-- Run this AFTER running: npx @better-auth/cli migrate
-- ============= PROFILES TABLE =============
-- Stores user profile information
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200),
    bio TEXT,
    avatar_url TEXT,
    phone_number VARCHAR(20),
    website VARCHAR(255),
    location VARCHAR(255),
    company VARCHAR(255),
    job_title VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT username_format CHECK (username ~* '^[a-z0-9_]+$')
);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
-- ============= CARDS TABLE =============
-- Stores digital card information
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    card_id VARCHAR(50) NOT NULL UNIQUE,
    card_type VARCHAR(50) DEFAULT 'standard',
    is_activated BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMP WITH TIME ZONE,
    qr_code_data TEXT,
    design_template VARCHAR(100) DEFAULT 'default',
    custom_fields JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_card_id ON cards(card_id);
CREATE INDEX idx_cards_is_activated ON cards(is_activated);
-- ============= PAYMENTS TABLE =============
-- Stores payment transaction records
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    reference VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'NGN',
    status VARCHAR(50) DEFAULT 'pending',
    plan_type VARCHAR(50),
    payment_type VARCHAR(50),
    paystack_reference VARCHAR(255),
    metadata JSONB,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (
        status IN ('pending', 'completed', 'failed', 'cancelled')
    ),
    CONSTRAINT valid_payment_type CHECK (
        payment_type IN ('card', 'subscription', 'one-time')
    )
);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_reference ON payments(reference);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
-- ============= SUBSCRIPTIONS TABLE =============
-- Stores user subscription information
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    paystack_subscription_id VARCHAR(255),
    paystack_customer_code VARCHAR(255),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_plan_type CHECK (
        plan_type IN ('free', 'basic', 'premium', 'enterprise')
    ),
    CONSTRAINT valid_subscription_status CHECK (
        status IN ('active', 'cancelled', 'expired', 'paused')
    )
);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);
-- ============= PROFILE VIEWS TABLE =============
-- Stores analytics data for profile views
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    viewer_ip VARCHAR(45),
    viewer_location VARCHAR(255),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    referrer TEXT,
    action_type VARCHAR(50) DEFAULT 'profile_view',
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_action_type CHECK (
        action_type IN (
            'profile_view',
            'card_scan',
            'link_click',
            'contact_save'
        )
    )
);
CREATE INDEX idx_profile_views_profile_id ON profile_views(profile_id);
CREATE INDEX idx_profile_views_viewed_at ON profile_views(viewed_at DESC);
CREATE INDEX idx_profile_views_action_type ON profile_views(action_type);
-- ============= EMAIL LOGS TABLE =============
-- Stores email sending history
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES "user"(id) ON DELETE
    SET
        NULL,
        recipient VARCHAR(255) NOT NULL,
        template VARCHAR(100) NOT NULL,
        template_data JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        provider VARCHAR(50) DEFAULT 'resend',
        error_message TEXT,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT valid_email_status CHECK (
            status IN ('pending', 'sent', 'failed', 'bounced')
        )
);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
-- ============= EMAIL PREFERENCES TABLE =============
-- Stores user email notification preferences
CREATE TABLE IF NOT EXISTS email_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    welcome_emails BOOLEAN DEFAULT TRUE,
    activity_notifications BOOLEAN DEFAULT TRUE,
    weekly_reports BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    payment_notifications BOOLEAN DEFAULT TRUE,
    security_alerts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_email_preferences_user_id ON email_preferences(user_id);
-- ============= EMAIL OPT OUTS TABLE =============
-- Stores email addresses that have opted out
CREATE TABLE IF NOT EXISTS email_opt_outs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    opt_out_type VARCHAR(50) DEFAULT 'all',
    opted_out_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_opt_out_type CHECK (
        opt_out_type IN ('all', 'marketing', 'notifications')
    )
);
CREATE INDEX idx_email_opt_outs_email ON email_opt_outs(email);
-- ============= TEAMS TABLE =============
-- Stores team/organization information
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    owner_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_teams_owner_id ON teams(owner_id);
-- ============= TEAM MEMBERS TABLE =============
-- Stores team membership information
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_team_role CHECK (role IN ('owner', 'admin', 'member')),
    CONSTRAINT unique_team_member UNIQUE(team_id, user_id)
);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
-- ============= TRIGGERS =============
-- Auto-update updated_at timestamp
CREATE
OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS
$$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$
language 'plpgsql';
-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE
    ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE
UPDATE
    ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE
UPDATE
    ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE
UPDATE
    ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_preferences_updated_at BEFORE
UPDATE
    ON email_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE
UPDATE
    ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============= VIEWS =============
-- Useful view for admin dashboard
CREATE
OR REPLACE VIEW user_stats AS
SELECT
    u.id,
    u.email,
    u."name",
    u."emailVerified",
    u."createdAt",
    p.username,
    p.is_active,
    s.plan_type,
    s.status AS subscription_status,
    COUNT(DISTINCT c.id) AS total_cards,
    COUNT(DISTINCT pv.id) AS total_views,
    COALESCE(SUM(pay.amount), 0) AS total_revenue
FROM
    "user" u
    LEFT JOIN profiles p ON u.id = p.user_id
    LEFT JOIN subscriptions s ON u.id = s.user_id
    LEFT JOIN cards c ON u.id = c.user_id
    LEFT JOIN profile_views pv ON p.id = pv.profile_id
    LEFT JOIN payments pay ON u.id = pay.user_id
    AND pay.status = 'completed'
GROUP BY
    u.id,
    u.email,
    u."name",
    u."emailVerified",
    u."createdAt",
    p.username,
    p.is_active,
    s.plan_type,
    s.status;
-- ============= COMMENTS =============
COMMENT ON TABLE profiles IS 'User profile information and settings';
COMMENT ON TABLE cards IS 'Digital business cards';
COMMENT ON TABLE payments IS 'Payment transaction records';
COMMENT ON TABLE subscriptions IS 'User subscription data';
COMMENT ON TABLE profile_views IS 'Analytics tracking for profile views';
COMMENT ON TABLE email_logs IS 'Email sending history and status';
COMMENT ON TABLE email_preferences IS 'User email notification preferences';
COMMENT ON TABLE email_opt_outs IS 'Email addresses that have opted out';
COMMENT ON TABLE teams IS 'Organization/team information';
COMMENT ON TABLE team_members IS 'Team membership records';
-- ============= INITIAL DATA =============
-- You can add any initial data here if needed
COMMIT;