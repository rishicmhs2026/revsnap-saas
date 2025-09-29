#!/bin/bash

# RevSnap Quick Diagnostic Script
echo "🔧 RevSnap Diagnostic Tool"
echo "=========================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in RevSnap directory. Please run from project root."
    exit 1
fi

echo "✅ In RevSnap directory"

# Check Node.js version
echo "📦 Node.js version:"
node --version

# Check npm version
echo "📦 npm version:"
npm --version

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Run: npm install"
    exit 1
fi
echo "✅ Dependencies installed"

# Check environment file
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Firebase features may not work."
else
    echo "✅ Environment file found"
fi

# Check database
if [ ! -f "prisma/dev.db" ]; then
    echo "⚠️  Warning: Database not found. Run: npx prisma db push"
else
    echo "✅ Database file found"
fi

# Check TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript errors found. Run: npx tsc --noEmit"
fi

# Check if app can build
echo "🔍 Checking build process..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Check the output above."
fi

# Check if dev server can start
echo "🔍 Testing dev server startup..."
timeout 10s npm run dev > /dev/null 2>&1
if [ $? -eq 124 ]; then
    echo "✅ Dev server starts successfully"
else
    echo "❌ Dev server failed to start"
fi

# Check API endpoints
echo "🔍 Testing API endpoints..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ API health endpoint responding"
else
    echo "⚠️  API health endpoint not responding (server may not be running)"
fi

echo ""
echo "🎯 Quick Fixes:"
echo "1. If dependencies missing: npm install"
echo "2. If database missing: npx prisma db push"
echo "3. If TypeScript errors: npx tsc --noEmit"
echo "4. If build fails: npm run build"
echo "5. If dev server fails: npm run dev"
echo ""
echo "📚 For detailed troubleshooting, see: TROUBLESHOOTING_GUIDE.md"
