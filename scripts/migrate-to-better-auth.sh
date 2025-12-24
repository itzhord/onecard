#!/bin/bash

# =============================================================================
# Better Auth Migration Script
# =============================================================================
# This script helps migrate from Supabase Auth to Better Auth
#
# Prerequisites:
# 1. PostgreSQL database (can be Supabase, Neon, or any PostgreSQL provider)
# 2. Node.js and npm/yarn/pnpm/bun installed
# 3. .env file configured with DATABASE_URL and other required variables
# =============================================================================

set -e  # Exit on error

echo "🚀 OneCard - Better Auth Migration Script"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check environment
echo "📋 Step 1: Checking environment..."
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and configure your environment variables"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
if command -v bun &> /dev/null; then
    bun install
elif command -v pnpm &> /dev/null; then
    pnpm install
elif command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Generate Better Auth schema
echo "🗄️  Step 3: Generating Better Auth schema..."
echo "This will create Better Auth tables (user, session, account, verification)"

# Ask for confirmation
read -p "Continue with Better Auth migration? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
fi

# Run Better Auth CLI migration
npx @better-auth/cli migrate

echo -e "${GREEN}✓ Better Auth tables created${NC}"
echo ""

# Step 4: Create application tables
echo "📊 Step 4: Creating application tables..."
echo "This will create: profiles, cards, payments, subscriptions, analytics, etc."

read -p "Create application tables? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if psql is available
    if command -v psql &> /dev/null; then
        # Extract DATABASE_URL from .env
        DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2)
        
        echo "Running migration SQL..."
        psql "$DATABASE_URL" -f migrations/001_create_app_tables.sql
        
        echo -e "${GREEN}✓ Application tables created${NC}"
    else
        echo -e "${YELLOW}⚠️  psql not found. Please run the migration manually:${NC}"
        echo "   psql \$DATABASE_URL -f migrations/001_create_app_tables.sql"
        echo ""
        echo "   Or use your database GUI tool to execute: migrations/001_create_app_tables.sql"
    fi
fi
echo ""

# Step 5: Migration from existing data (optional)
echo "🔄 Step 5: Data Migration (Optional)"
echo "If you have existing users in Supabase Auth, you can migrate them now."
read -p "Do you have existing users to migrate? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Manual data migration required${NC}"
    echo ""
    echo "To migrate existing users, you'll need to:"
    echo "1. Export users from Supabase (including hashed passwords)"
    echo "2. Import them into Better Auth user table"
    echo "3. Create corresponding profile records"
    echo ""
    echo "See the migration guide for detailed instructions:"
    echo "https://better-auth.com/docs/guides/supabase-migration-guide"
    echo ""
fi

# Step 6: Test the setup
echo "🧪 Step 6: Testing setup..."
echo "Starting development server to test authentication..."
echo ""
echo "After the server starts:"
echo "1. Visit http://localhost:3000"
echo "2. Try signing up with a new account"
echo "3. Check your email for verification link"
echo "4. Verify the profile was created in the database"
echo ""

read -p "Start development server? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting server... (Press Ctrl+C to stop)"
    npm run dev
else
    echo ""
    echo "Migration setup complete! 🎉"
    echo ""
    echo "Next steps:"
    echo "1. Configure your email provider (Resend API key in .env)"
    echo "2. Set up Google OAuth credentials"
    echo "3. Configure Paystack for payments"
    echo "4. Run 'npm run dev' to start the development server"
    echo ""
    echo "Documentation:"
    echo "- Better Auth: https://better-auth.com"
    echo "- Migration Plan: ./BETTER_AUTH_MIGRATION_PLAN.md"
fi
