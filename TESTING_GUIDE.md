# 🧪 RevSnap SaaS Testing Guide

## 🚀 Quick Start

The RevSnap SaaS application is now running on **http://localhost:3002** with a complete backend and database setup.

## 📋 Pre-Testing Checklist

- ✅ Server is running on port 3002
- ✅ Database is seeded with demo data
- ✅ Authentication system is active
- ✅ API endpoints are functional

## 🎯 Test Scenarios

### 1. **Authentication & User Management**

#### Test User Registration
1. Navigate to http://localhost:3002/auth/signup
2. Fill out the registration form:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Password**: password123
   - **Organization Name**: Test Company
   - **Organization Slug**: test-company
   - **Industry**: Technology
   - **Size**: 1-10 employees
3. Click "Create account"
4. **Expected Result**: Account created successfully, redirected to dashboard

#### Test User Sign In
1. Navigate to http://localhost:3002/auth/signin
2. Use demo credentials:
   - **Email**: admin@revsnap.com
   - **Password**: password123
3. Click "Sign in"
4. **Expected Result**: Successfully logged in, redirected to dashboard

#### Test OAuth (Optional)
1. Click "Sign in with Google" or "Sign in with GitHub"
2. **Expected Result**: OAuth flow works (requires configured OAuth providers)

### 2. **Dashboard & Analytics**

#### Test Dashboard Loading
1. Sign in with demo account
2. Navigate to http://localhost:3002/dashboard
3. **Expected Result**: 
   - Dashboard loads with analytics cards
   - Organization selector is populated
   - Product list displays seeded products

#### Test Analytics Cards
1. Verify the following metrics are displayed:
   - **Total Products**: Should show number of seeded products
   - **Active Tracking**: Should show active tracking jobs
   - **Unread Alerts**: Should show number of price alerts
   - **Avg Price Change**: Should show percentage change

#### Test Organization Switching
1. Use the organization dropdown
2. **Expected Result**: Analytics and products update based on selected organization

### 3. **Product Management**

#### Test Product Creation
1. Click "Add Product" button on dashboard
2. Fill out the product form:
   - **Product Name**: Test Product
   - **SKU**: TEST-001
   - **Brand**: Test Brand
   - **Category**: Electronics
   - **Description**: A test product for testing
   - **Your Price**: 99.99
   - **Currency**: USD
   - **Product URL**: https://example.com/product
   - **Competitors**: Select Amazon and Best Buy
3. Click "Create Product"
4. **Expected Result**: Product created, redirected to product detail page

#### Test Product Detail View
1. Click on any product in the dashboard
2. **Expected Result**: 
   - Product details page loads
   - Tabs for Overview, Competitors, Alerts, Analytics
   - Product information is displayed correctly

#### Test Product Tabs
1. Navigate through each tab:
   - **Overview**: Product details and pricing summary
   - **Competitors**: Competitor price data (may be empty initially)
   - **Alerts**: Price alerts (may be empty initially)
   - **Analytics**: Price history and summary statistics

### 4. **API Endpoints Testing**

#### Test Authentication Required Endpoints
```bash
# Test without authentication (should return 401)
curl http://localhost:3002/api/products

# Test with authentication (should return data)
curl -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" http://localhost:3002/api/products
```

#### Test Product API
```bash
# Create a product
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "name": "API Test Product",
    "description": "Created via API",
    "organizationId": "YOUR_ORG_ID",
    "yourPrice": 149.99,
    "currency": "USD"
  }'

# Get products
curl http://localhost:3002/api/products?organizationId=YOUR_ORG_ID \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Test Analytics API
```bash
# Get organization analytics
curl http://localhost:3002/api/analytics?organizationId=YOUR_ORG_ID \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Get product analytics
curl http://localhost:3002/api/analytics?productId=YOUR_PRODUCT_ID \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### 5. **Competitor Tracking**

#### Test Competitor Tracking API
1. Navigate to a product detail page
2. Go to the "Competitors" tab
3. **Expected Result**: 
   - Competitor data is displayed (if available)
   - Price changes are shown with appropriate colors
   - Links to competitor URLs work

#### Test Price Alerts
1. Go to the "Alerts" tab on a product page
2. **Expected Result**: 
   - Price alerts are displayed (if any)
   - Severity levels are color-coded
   - Timestamps are formatted correctly

### 6. **Database Operations**

#### Test Database Seeding
```bash
# Check if demo data exists
npm run db:studio
# This opens Prisma Studio where you can browse the database
```

#### Test Database Reset
```bash
# Reset database and re-seed
npm run db:reset
```

### 7. **Error Handling**

#### Test Invalid Product ID
1. Navigate to http://localhost:3002/products/invalid-id
2. **Expected Result**: Error page with "Product not found" message

#### Test Unauthorized Access
1. Try to access API endpoints without authentication
2. **Expected Result**: 401 Unauthorized response

#### Test Form Validation
1. Try to create a product with missing required fields
2. **Expected Result**: Form validation errors are displayed

## 🔧 Troubleshooting

### Common Issues

#### 1. **Server Not Starting**
```bash
# Check if port is in use
lsof -i :3002

# Kill process if needed
kill -9 <PID>

# Restart server
npm run dev
```

#### 2. **Database Connection Issues**
```bash
# Check database file exists
ls -la prisma/dev.db

# Reset database if corrupted
npm run db:reset
```

#### 3. **Authentication Issues**
```bash
# Clear browser cookies
# Or test in incognito mode
```

#### 4. **API Endpoints Not Working**
```bash
# Check server logs for errors
# Verify .env file is properly configured
```

### Debug Commands

```bash
# Check server status
curl http://localhost:3002

# Test database connection
npm run db:studio

# View server logs
# Check terminal where npm run dev is running

# Check environment variables
cat .env
```

## 📊 Performance Testing

### Load Testing (Optional)
```bash
# Install Apache Bench if available
ab -n 100 -c 10 http://localhost:3002/

# Or use curl to test multiple requests
for i in {1..50}; do curl http://localhost:3002/api/products; done
```

### Memory Usage
```bash
# Monitor memory usage
ps aux | grep node
```

## 🎯 Success Criteria

### ✅ All Tests Pass When:
1. **Authentication**: Users can sign up, sign in, and access protected routes
2. **Dashboard**: Analytics cards display correct data
3. **Products**: CRUD operations work for products
4. **API**: All endpoints return expected responses
5. **Database**: Data persists and relationships work correctly
6. **UI**: All pages load without errors
7. **Navigation**: Links and routing work properly

### 🚨 Issues to Report:
- 500 server errors
- Database connection failures
- Authentication not working
- Missing data in seeded database
- UI not loading or displaying incorrectly
- API endpoints returning unexpected responses

## 📝 Test Results Template

```
Test Date: _______________
Tester: _________________

✅ Authentication Tests:
- [ ] User registration
- [ ] User sign in
- [ ] OAuth (if configured)

✅ Dashboard Tests:
- [ ] Dashboard loads
- [ ] Analytics cards display
- [ ] Organization switching

✅ Product Tests:
- [ ] Product creation
- [ ] Product detail view
- [ ] Product tabs navigation

✅ API Tests:
- [ ] Authentication required endpoints
- [ ] Product CRUD operations
- [ ] Analytics endpoints

✅ Database Tests:
- [ ] Seeded data exists
- [ ] Relationships work
- [ ] Data persistence

Issues Found:
1. _________________
2. _________________
3. _________________

Overall Status: ✅ PASS / ❌ FAIL
```

## 🚀 Next Steps After Testing

1. **Fix any issues** found during testing
2. **Deploy to staging** environment
3. **Set up production database** (PostgreSQL)
4. **Configure OAuth providers** for production
5. **Set up monitoring** and logging
6. **Implement real-time features** (WebSocket)
7. **Add email notifications**
8. **Set up Stripe integration**

---

**Happy Testing! 🎉**

For support or questions, check the logs or refer to the README.md file. 