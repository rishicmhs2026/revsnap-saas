#!/bin/bash

# Script to add monitoring variables to existing .env file

echo "🔧 Adding monitoring variables to .env file..."

# Check if variables already exist
if grep -q "ENABLE_PERFORMANCE_MONITORING" .env; then
    echo "✅ Monitoring variables already exist in .env file"
    exit 0
fi

# Add monitoring variables to .env file
cat >> .env << 'EOF'

# ========================================
# MONITORING & ERROR TRACKING
# ========================================

# Sentry Configuration (update with your actual values)
SENTRY_DSN="your-sentry-dsn"
SENTRY_ORG="your-sentry-org"
SENTRY_PROJECT="your-sentry-project"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# LogRocket Configuration (update with your actual values)
NEXT_PUBLIC_LOGROCKET_APP_ID="your-logrocket-app-id"

# Uptime Monitoring (Optional)
UPTIME_ROBOT_API_KEY="your-uptime-robot-api-key"
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
EOF

echo "✅ Monitoring variables added to .env file"
echo ""
echo "Next steps:"
echo "1. Update the placeholder values with your actual credentials"
echo "2. Test the monitoring system" 