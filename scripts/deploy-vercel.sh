#!/bin/bash

# RevSnap SaaS - Vercel Deployment Script
# This script helps you deploy your application to Vercel

set -e

echo "🚀 RevSnap SaaS - Vercel Deployment Helper"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed successfully!"
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel:"
    vercel login
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. ✅ Code is committed to GitHub"
echo "2. ⏳ Environment variables configured in Vercel dashboard"
echo "3. ⏳ Database set up (Vercel Postgres or external)"
echo "4. ⏳ Stripe webhooks configured"
echo ""

read -p "Have you completed the checklist above? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Please complete the checklist first. See DEPLOY_TO_VERCEL.md for details."
    exit 1
fi

echo ""
echo "🔧 Deploying to Vercel..."

# Deploy to production
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Run database migrations: npx prisma migrate deploy"
echo "2. Test your application at the provided URL"
echo "3. Configure Stripe webhooks"
echo "4. Set up monitoring and analytics"
echo ""
echo "📚 For detailed instructions, see DEPLOY_TO_VERCEL.md"
