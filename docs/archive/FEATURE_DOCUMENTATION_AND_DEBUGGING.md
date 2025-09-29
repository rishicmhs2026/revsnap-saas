# RevSnap SaaS - Feature Documentation & Debugging Guide

## 📋 Table of Contents

1. [Authentication System](#authentication-system)
2. [Database & Data Management](#database--data-management)
3. [Product Management](#product-management)
4. [Competitor Tracking](#competitor-tracking)
5. [Analytics & Reporting](#analytics--reporting)
6. [Payment & Subscription System](#payment--subscription-system)
7. [Admin System](#admin-system)
8. [API Endpoints](#api-endpoints)
9. [Real-time Features](#real-time-features)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## 🔐 Authentication System

### How It Works

The authentication system uses NextAuth.js with multiple providers:

#### **1. Credentials Provider (Email/Password)**
- **Location**: `src/lib/auth.ts`
- **Flow**: User enters email/password → bcrypt verification → JWT session creation
- **Session Strategy**: JWT-based sessions stored in cookies

#### **2. OAuth Providers (Google, GitHub)**
- **Location**: `src/lib/auth.ts`
- **Flow**: OAuth redirect → Provider authentication → User creation/update → Session creation
- **Configuration**: Environment variables for client IDs and secrets

#### **3. Session Management**
- **Strategy**: JWT tokens with secure cookies
- **Expiration**: Configurable session timeout
- **Protection**: All API routes require authentication

### Key Files
```
src/lib/auth.ts                    # NextAuth configuration
src/app/auth/signin/page.tsx       # Sign-in page
src/app/auth/signup/page.tsx       # Registration page
src/app/api/auth/[...nextauth]/route.ts  # NextAuth API handler
src/types/next-auth.d.ts          # TypeScript declarations
```

### Debugging Authentication Issues

#### **Problem: Sign-in not working**
```bash
# Check environment variables
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL

# Test authentication API
curl -X POST http://localhost:3000/api/auth/signin/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@revsnap.com&password=password123&redirect=false&json=true"
```

#### **Problem: OAuth not working**
```bash
# Check OAuth environment variables
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# Test OAuth providers
curl http://localhost:3000/api/auth/providers
```

#### **Problem: Session not persisting**
```bash
# Check session endpoint
curl http://localhost:3000/api/auth/session

# Check browser cookies
# Open DevTools → Application → Cookies → localhost:3000
```

#### **Common Solutions**
1. **Environment Variables**: Ensure `.env.local` has correct values
2. **Database**: Verify user exists in database
3. **CORS**: Check if domain matches NEXTAUTH_URL
4. **Cookies**: Clear browser cookies and try again

---

## 🗄️ Database & Data Management

### How It Works

The database uses Prisma ORM with SQLite (development) and PostgreSQL (production):

#### **1. Database Schema**
- **Location**: `prisma/schema.prisma`
- **Models**: 12+ models covering users, products, organizations, etc.
- **Relationships**: Complex relationships between entities

#### **2. Data Operations**
- **CRUD**: Create, Read, Update, Delete operations
- **Queries**: Complex queries with filtering and pagination
- **Transactions**: Atomic operations for data consistency

#### **3. Data Seeding**
- **Location**: `prisma/seed.ts`
- **Demo Data**: Pre-populated with test users and products
- **Organizations**: Demo company with sample data

### Key Files
```
prisma/schema.prisma              # Database schema
prisma/seed.ts                   # Database seeding
src/lib/prisma.ts               # Prisma client
src/lib/database.ts             # Database utilities
```

### Debugging Database Issues

#### **Problem: Database connection failed**
```bash
# Check database file exists
ls -la prisma/dev.db

# Test database connection
npx prisma db push

# Reset database
npx prisma db push --force-reset
```

#### **Problem: Seeding failed**
```bash
# Run seed script directly
npx tsx prisma/seed.ts

# Check for errors in seed script
node -e "console.log(require('./prisma/seed.ts'))"
```

#### **Problem: Data not persisting**
```bash
# Check database content
npx prisma studio

# Verify Prisma client generation
npx prisma generate
```

#### **Common Solutions**
1. **Reset Database**: `npx prisma db push --force-reset && npx tsx prisma/seed.ts`
2. **Regenerate Client**: `npx prisma generate`
3. **Check Schema**: Verify schema.prisma is correct
4. **Environment**: Ensure DATABASE_URL is set correctly

---

## 📦 Product Management

### How It Works

Product management provides CRUD operations for tracking products:

#### **1. Product Creation**
- **Form**: Multi-step form with validation
- **Validation**: Required fields, data types, business rules
- **Storage**: Products stored with organization association

#### **2. Product Listing**
- **Pagination**: Efficient loading of large product lists
- **Filtering**: Search and filter by category, brand, etc.
- **Sorting**: Sort by name, price, date, etc.

#### **3. Product Details**
- **Tabs**: Overview, Competitors, Analytics, Alerts
- **Real-time Data**: Live competitor data and analytics
- **Actions**: Edit, delete, duplicate products

### Key Files
```
src/app/products/page.tsx         # Product listing
src/app/products/[id]/page.tsx    # Product details
src/app/api/products/route.ts     # Product API
src/components/ProductForm.tsx    # Product creation form
```

### Debugging Product Issues

#### **Problem: Products not loading**
```bash
# Test products API
curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  http://localhost:3000/api/products

# Check database for products
npx prisma studio
# Navigate to Product table
```

#### **Problem: Product creation failing**
```bash
# Check form validation
# Open browser DevTools → Console
# Look for validation errors

# Test API directly
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"name":"Test Product","category":"Electronics"}'
```

#### **Problem: Product details not showing**
```bash
# Check product ID in URL
# Verify product exists in database
# Check API response
curl http://localhost:3000/api/products/PRODUCT_ID \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

#### **Common Solutions**
1. **Authentication**: Ensure user is logged in
2. **Organization**: Verify user belongs to organization
3. **Database**: Check if product exists
4. **API**: Test API endpoints directly

---

## 🎯 Competitor Tracking

### How It Works

Competitor tracking monitors prices from multiple sources:

#### **1. Data Collection**
- **Web Scraping**: Puppeteer-based scraping of competitor sites
- **API Integration**: Direct API calls to Amazon, eBay, etc.
- **Rate Limiting**: Respectful scraping with delays
- **Error Handling**: Retry mechanisms and fallbacks

#### **2. Data Processing**
- **Validation**: Data quality checks and normalization
- **Storage**: Historical price data storage
- **Analysis**: Price change detection and alerts

#### **3. Real-time Updates**
- **Polling**: Scheduled price checks every 15-60 minutes
- **WebSocket**: Real-time updates to frontend
- **Alerts**: Email notifications for price changes

### Key Files
```
src/lib/competitor-tracking.ts    # Core tracking logic
src/lib/web-scraping.ts          # Web scraping utilities
src/app/api/competitor-tracking/route.ts  # Tracking API
src/components/CompetitorData.tsx # Competitor display
```

### Debugging Competitor Tracking Issues

#### **Problem: No competitor data**
```bash
# Check tracking jobs
npx prisma studio
# Navigate to TrackingJob table

# Test scraping manually
node -e "
const { scrapeAmazon } = require('./src/lib/web-scraping.ts');
scrapeAmazon('https://amazon.com/dp/B08N5WRWNW').then(console.log);
"
```

#### **Problem: Scraping failing**
```bash
# Check network connectivity
curl -I https://amazon.com

# Test with different user agent
# Check if site is blocking requests
# Verify proxy settings if using VPN
```

#### **Problem: Data not updating**
```bash
# Check tracking job status
npx prisma studio
# Look at TrackingJob table for active jobs

# Check next run time
# Verify cron job is running
# Check server logs for errors
```

#### **Common Solutions**
1. **Rate Limiting**: Increase delays between requests
2. **User Agent**: Rotate user agents to avoid blocking
3. **Proxy**: Use proxy services for blocked IPs
4. **Fallback**: Implement multiple data sources

---

## 📊 Analytics & Reporting

### How It Works

Analytics provides insights into market data and trends:

#### **1. Data Aggregation**
- **Real-time**: Live data from competitor tracking
- **Historical**: Trend analysis over time
- **Statistical**: Mean, median, standard deviation calculations

#### **2. Visualization**
- **Charts**: Interactive charts with Chart.js
- **Dashboards**: Real-time dashboard with key metrics
- **Reports**: Exportable reports in various formats

#### **3. AI Analysis**
- **Trend Prediction**: Machine learning for price forecasting
- **Market Intelligence**: Competitive positioning analysis
- **Risk Assessment**: Multi-factor risk scoring

### Key Files
```
src/app/dashboard/page.tsx        # Main dashboard
src/app/api/analytics/route.ts    # Analytics API
src/components/AnalyticsChart.tsx # Chart components
src/lib/analytics.ts             # Analytics calculations
```

### Debugging Analytics Issues

#### **Problem: Charts not loading**
```bash
# Check analytics API
curl http://localhost:3000/api/analytics \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Check browser console for JavaScript errors
# Verify Chart.js is loaded
```

#### **Problem: Data not updating**
```bash
# Check data sources
npx prisma studio
# Verify CompetitorData table has recent entries

# Check WebSocket connection
# Open DevTools → Network → WS
# Look for WebSocket connection status
```

#### **Problem: Calculations incorrect**
```bash
# Test analytics calculations
node -e "
const { calculateMarketPosition } = require('./src/lib/analytics.ts');
console.log(calculateMarketPosition([10, 20, 30, 40, 50]));
"
```

#### **Common Solutions**
1. **Data Quality**: Ensure competitor data is accurate
2. **Time Range**: Check if data exists for selected time range
3. **Permissions**: Verify user has access to organization data
4. **Cache**: Clear browser cache and reload

---

## 💳 Payment & Subscription System

### How It Works

Payment system integrates with Stripe for subscription management:

#### **1. Stripe Integration**
- **Checkout**: Stripe Checkout for payment processing
- **Webhooks**: Real-time subscription updates
- **Billing Portal**: Customer self-service billing

#### **2. Subscription Plans**
- **Starter**: $49/month - 25 products
- **Professional**: $149/month - 200 products
- **Enterprise**: $399/month - Unlimited products

#### **3. Billing Management**
- **Invoices**: Automatic invoice generation
- **Payments**: Multiple payment methods
- **Cancellation**: Easy subscription cancellation

### Key Files
```
src/app/api/stripe/route.ts       # Stripe webhook handler
src/app/billing/page.tsx          # Billing management
src/components/SubscriptionCard.tsx # Plan selection
src/lib/stripe.ts                # Stripe utilities
```

### Debugging Payment Issues

#### **Problem: Payment not processing**
```bash
# Check Stripe keys
echo $STRIPE_PUBLISHABLE_KEY
echo $STRIPE_SECRET_KEY

# Test Stripe connection
curl -u $STRIPE_SECRET_KEY: \
  https://api.stripe.com/v1/charges
```

#### **Problem: Webhook not working**
```bash
# Check webhook endpoint
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"checkout.session.completed"}'

# Check webhook secret
echo $STRIPE_WEBHOOK_SECRET
```

#### **Problem: Subscription not updating**
```bash
# Check database
npx prisma studio
# Look at Subscription table

# Check webhook logs
# Look at server logs for webhook events
```

#### **Common Solutions**
1. **Keys**: Verify Stripe keys are correct
2. **Webhook**: Ensure webhook URL is accessible
3. **Database**: Check subscription status in database
4. **Logs**: Review server logs for errors

---

## 🔧 Admin System

### How It Works

Admin system provides system management capabilities:

#### **1. Admin Authentication**
- **Dedicated Login**: `/admin/login` with enhanced security
- **Role-based Access**: Super admin, admin, user roles
- **Access Logging**: All admin actions are logged

#### **2. Admin Dashboard**
- **System Overview**: Real-time system statistics
- **User Management**: View and manage all users
- **Subscription Analytics**: Revenue and subscription metrics

#### **3. System Management**
- **Database Management**: Direct database access
- **System Monitoring**: Performance and error tracking
- **Configuration**: System settings and configuration

### Key Files
```
src/app/admin/login/page.tsx      # Admin login
src/app/admin/dashboard/page.tsx  # Admin dashboard
src/app/api/admin/route.ts        # Admin API
src/lib/admin.ts                 # Admin utilities
```

### Debugging Admin Issues

#### **Problem: Admin login not working**
```bash
# Check admin user exists
npx prisma studio
# Look at User table for admin@revsnap.com

# Test admin login
curl -X POST http://localhost:3000/api/auth/signin/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@revsnap.com&password=password123"
```

#### **Problem: Admin dashboard not loading**
```bash
# Check admin API
curl http://localhost:3000/api/admin/stats \
  -H "Cookie: next-auth.session-token=ADMIN_TOKEN"

# Verify admin role
npx prisma studio
# Check User table for isAdmin=true
```

#### **Problem: Admin actions not working**
```bash
# Check admin permissions
# Verify user has admin role
# Check API endpoint permissions
```

#### **Common Solutions**
1. **Role**: Ensure user has admin role
2. **Permissions**: Check API endpoint permissions
3. **Session**: Verify admin session is valid
4. **Database**: Check admin user exists

---

## 🔌 API Endpoints

### How It Works

API provides RESTful endpoints for all operations:

#### **1. Authentication Endpoints**
- `POST /api/auth/signin` - User sign-in
- `POST /api/auth/signup` - User registration
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - User sign-out

#### **2. Product Endpoints**
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

#### **3. Analytics Endpoints**
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/products/[id]` - Product analytics
- `GET /api/analytics/organizations/[id]` - Organization analytics

### Key Files
```
src/app/api/                      # API routes directory
src/lib/middleware.ts            # API middleware
src/types/api.ts                 # API type definitions
```

### Debugging API Issues

#### **Problem: API not responding**
```bash
# Test basic connectivity
curl http://localhost:3000/api/health

# Check server status
ps aux | grep next

# Check server logs
# Look at terminal where npm run dev is running
```

#### **Problem: 401 Unauthorized**
```bash
# Check authentication
curl http://localhost:3000/api/auth/session

# Verify session token
# Check browser cookies
# Try logging in again
```

#### **Problem: 500 Internal Server Error**
```bash
# Check server logs
# Look for error messages in terminal

# Test database connection
npx prisma db push

# Check environment variables
cat .env.local
```

#### **Common Solutions**
1. **Authentication**: Ensure user is logged in
2. **Permissions**: Check user has access to resource
3. **Database**: Verify database connection
4. **Environment**: Check environment variables

---

## ⚡ Real-time Features

### How It Works

Real-time features provide live updates:

#### **1. WebSocket Connection**
- **Connection**: WebSocket connection to server
- **Events**: Real-time event broadcasting
- **Reconnection**: Automatic reconnection on disconnect

#### **2. Live Data Updates**
- **Price Updates**: Real-time price changes
- **Analytics**: Live analytics updates
- **Notifications**: Real-time notifications

#### **3. Data Synchronization**
- **State Management**: React state synchronization
- **Optimistic Updates**: Immediate UI updates
- **Error Handling**: Graceful error handling

### Key Files
```
src/lib/use-websocket.ts         # WebSocket hook
src/app/api/websocket/route.ts   # WebSocket API
src/components/LiveData.tsx      # Live data components
```

### Debugging Real-time Issues

#### **Problem: WebSocket not connecting**
```bash
# Check WebSocket endpoint
curl -I http://localhost:3000/api/websocket

# Check browser console
# Look for WebSocket connection errors
# Verify WebSocket URL is correct
```

#### **Problem: Data not updating**
```bash
# Check WebSocket connection status
# Open DevTools → Network → WS
# Look for connection status

# Test WebSocket manually
# Use browser console to test WebSocket
```

#### **Problem: Connection dropping**
```bash
# Check server logs
# Look for WebSocket errors
# Check network connectivity
# Verify server is not overloaded
```

#### **Common Solutions**
1. **Network**: Check network connectivity
2. **Server**: Ensure server is running
3. **Browser**: Clear browser cache
4. **Reconnection**: Implement automatic reconnection

---

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

#### **1. Server Not Starting**
```bash
# Check port availability
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Restart server
npm run dev
```

#### **2. Database Issues**
```bash
# Reset database
npx prisma db push --force-reset

# Re-seed database
npx tsx prisma/seed.ts

# Check database file
ls -la prisma/dev.db
```

#### **3. Authentication Issues**
```bash
# Clear browser cookies
# Or test in incognito mode

# Check environment variables
cat .env.local

# Test authentication API
curl http://localhost:3000/api/auth/providers
```

#### **4. Build Issues**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

#### **5. Performance Issues**
```bash
# Check memory usage
ps aux | grep node

# Monitor CPU usage
top -p <PID>

# Check database performance
npx prisma studio
```

### Debug Commands

#### **System Health Check**
```bash
# Check server status
curl http://localhost:3000

# Check database
npx prisma db push

# Check authentication
curl http://localhost:3000/api/auth/providers

# Check API endpoints
curl http://localhost:3000/api/products
```

#### **Log Analysis**
```bash
# Check server logs
# Look at terminal where npm run dev is running

# Check browser console
# Open DevTools → Console

# Check network requests
# Open DevTools → Network
```

#### **Database Debugging**
```bash
# Open Prisma Studio
npx prisma studio

# Check database schema
npx prisma db pull

# Generate Prisma client
npx prisma generate
```

### Emergency Procedures

#### **Complete Reset**
```bash
# Stop all processes
pkill -f "next dev"
pkill -f "prisma studio"

# Reset database
npx prisma db push --force-reset

# Re-seed database
npx tsx prisma/seed.ts

# Clear Next.js cache
rm -rf .next

# Restart server
npm run dev
```

#### **Data Recovery**
```bash
# Backup database
cp prisma/dev.db prisma/dev.db.backup

# Restore from backup
cp prisma/dev.db.backup prisma/dev.db

# Check data integrity
npx prisma studio
```

---

## 📞 Support & Resources

### Documentation Links
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)

### Useful Commands
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
```

### Contact Information
- **Technical Issues**: Check this documentation first
- **Feature Requests**: Create GitHub issue
- **Emergency Support**: Check server logs and restart services

---

*This documentation is updated regularly. Last updated: September 2025*


