#!/bin/bash

# RevSnap SaaS - Environment Variables Setup Script
# This script helps you set up environment variables for the monitoring system

set -e

echo "🔧 Setting up RevSnap SaaS Environment Variables..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if .env file exists
if [ -f ".env" ]; then
    print_warning ".env file already exists. This script will not overwrite it."
    print_status "Please manually add the monitoring variables to your existing .env file."
    echo ""
    print_status "Refer to MONITORING_ENV_SETUP.md for detailed instructions."
    exit 0
fi

print_status "Creating .env file with monitoring configuration..."

# Create .env file with monitoring configuration
cat > .env << 'EOF'
# ========================================
# REVSNAP SAAS - MONITORING CONFIGURATION
# ========================================

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/revsnap_saas"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret"
STRIPE_STARTER_PRICE_ID="price_starter_plan_id"
STRIPE_PROFESSIONAL_PRICE_ID="price_professional_plan_id"
STRIPE_ENTERPRISE_PRICE_ID="price_enterprise_plan_id"

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# External APIs
RAINFOREST_API_KEY="your-rainforest-api-key"
EBAY_APP_ID="your-ebay-app-id"

# Redis (for caching and job queues)
REDIS_URL="redis://localhost:6379"

# ========================================
# MONITORING & ERROR TRACKING
# ========================================

# Sentry Configuration
# Get these from: https://sentry.io/settings/projects/
SENTRY_DSN=""
SENTRY_ORG=""
SENTRY_PROJECT=""
SENTRY_AUTH_TOKEN=""

# LogRocket Configuration
# Get this from: https://app.logrocket.com/
NEXT_PUBLIC_LOGROCKET_APP_ID=""

# Uptime Monitoring (Optional)
# Get this from: https://uptimerobot.com/
UPTIME_ROBOT_API_KEY=""
UPTIME_ROBOT_MONITOR_URL="http://localhost:3000/api/health"

# Logging Configuration
LOG_LEVEL="info"
LOG_FILE_PATH="./logs"
ENABLE_STRUCTURED_LOGGING="true"

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING="true"
PERFORMANCE_SAMPLE_RATE="0.1"

# Uptime Monitoring
ENABLE_UPTIME_MONITORING="true"

# Feature flags
ENABLE_ANALYTICS="true"
ENABLE_NOTIFICATIONS="true"
ENABLE_WEBHOOKS="true"

# Development Settings
NODE_ENV="development"
EOF

print_success ".env file created successfully!"

# Set proper permissions
chmod 600 .env

print_status "Setting up log directories..."

# Create log directories if they don't exist
mkdir -p logs/errors logs/combined logs/performance

# Set proper permissions for log directories
chmod 755 logs
chmod 755 logs/errors
chmod 755 logs/combined
chmod 755 logs/performance

print_success "Log directories created and configured"

echo ""
print_success "🎉 Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit the .env file and add your actual values:"
echo "   - SENTRY_DSN (from Sentry.io)"
echo "   - NEXT_PUBLIC_LOGROCKET_APP_ID (from LogRocket.com)"
echo "   - Other service credentials as needed"
echo ""
echo "2. Test the monitoring system:"
echo "   npm run dev"
echo "   # Then visit: http://localhost:3000/api/health"
echo ""
echo "3. For detailed setup instructions, see: MONITORING_ENV_SETUP.md"
echo ""
print_warning "Remember: Never commit .env files to version control!" 