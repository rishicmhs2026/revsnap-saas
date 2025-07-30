#!/bin/bash

# RevSnap SaaS Database Setup Script
echo "🚀 Setting up RevSnap SaaS Database..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update .env file with your database credentials and API keys"
fi

# Install dependencies if not already installed
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

# Seed database with initial data (optional)
echo "🌱 Seeding database with initial data..."
npx prisma db seed

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with real credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to access the application" 