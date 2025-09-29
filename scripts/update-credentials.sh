#!/bin/bash

# Script to update Sentry and LogRocket credentials

echo "🔧 Updating monitoring credentials..."

echo ""
echo "Please provide your credentials:"
echo ""

# Get Sentry DSN
read -p "Enter your Sentry DSN (e.g., https://abc123@sentry.io/123456): " SENTRY_DSN

# Get LogRocket App ID
read -p "Enter your LogRocket App ID (e.g., your-org/your-app-id): " LOGROCKET_APP_ID

echo ""
echo "Updating .env file..."

# Update Sentry DSN
if [ ! -z "$SENTRY_DSN" ]; then
    sed -i.bak "s|SENTRY_DSN=\"your-sentry-dsn\"|SENTRY_DSN=\"$SENTRY_DSN\"|g" .env
    echo "✅ Sentry DSN updated"
else
    echo "⚠️  Sentry DSN not provided, keeping placeholder"
fi

# Update LogRocket App ID
if [ ! -z "$LOGROCKET_APP_ID" ]; then
    sed -i.bak "s|NEXT_PUBLIC_LOGROCKET_APP_ID=\"your-logrocket-app-id\"|NEXT_PUBLIC_LOGROCKET_APP_ID=\"$LOGROCKET_APP_ID\"|g" .env
    echo "✅ LogRocket App ID updated"
else
    echo "⚠️  LogRocket App ID not provided, keeping placeholder"
fi

echo ""
echo "🎉 Credentials updated successfully!"
echo ""
echo "Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Test Sentry integration"
echo "3. Test LogRocket integration"
echo "4. Check the monitoring dashboard" 