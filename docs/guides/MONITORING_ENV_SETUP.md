# Monitoring Environment Variables Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Create Your .env File

Create a `.env` file in your project root directory and add the following configuration:

```bash
# ========================================
# REVSNAP SAAS - MONITORING CONFIGURATION
# ========================================

# Sentry Configuration
SENTRY_DSN=""
SENTRY_ORG=""
SENTRY_PROJECT=""
SENTRY_AUTH_TOKEN=""

# LogRocket Configuration
NEXT_PUBLIC_LOGROCKET_APP_ID=""

# Uptime Monitoring (Optional)
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
```

## 🔧 Detailed Setup Instructions

### Step 2: Set Up Sentry

1. **Create Sentry Account**:
   - Go to [Sentry.io](https://sentry.io)
   - Sign up for a free account
   - Create a new organization

2. **Create Project**:
   - In your Sentry dashboard, click "Create Project"
   - Select "Next.js" as your platform
   - Give your project a name (e.g., "RevSnap SaaS")

3. **Get Your DSN**:
   - After creating the project, you'll see a DSN (Data Source Name)
   - Copy the DSN and add it to your `.env` file:
   ```bash
   SENTRY_DSN="https://your-dsn@sentry.io/your-project-id"
   ```

4. **Optional: Get Auth Token** (for advanced features):
   - Go to Sentry Settings → Account → API → Auth Tokens
   - Create a new token with project:write scope
   - Add to your `.env` file:
   ```bash
   SENTRY_AUTH_TOKEN="your-auth-token"
   ```

### Step 3: Set Up LogRocket

1. **Create LogRocket Account**:
   - Go to [LogRocket.com](https://logrocket.com)
   - Sign up for a free account

2. **Create Project**:
   - Click "Add Project"
   - Select "Web App"
   - Give your project a name (e.g., "RevSnap SaaS")

3. **Get Your App ID**:
   - After creating the project, you'll see an App ID
   - Copy the App ID and add it to your `.env` file:
   ```bash
   NEXT_PUBLIC_LOGROCKET_APP_ID="your-org/your-app-id"
   ```

### Step 4: Configure Logging (Optional)

The logging system will work with default settings, but you can customize:

```bash
# Log level: error, warn, info, http, debug
LOG_LEVEL="info"

# Log file path (relative to project root)
LOG_FILE_PATH="./logs"

# Enable structured JSON logging
ENABLE_STRUCTURED_LOGGING="true"
```

### Step 5: Configure Performance Monitoring

```bash
# Enable performance monitoring
ENABLE_PERFORMANCE_MONITORING="true"

# Sampling rate (0.0 to 1.0)
# 0.1 = 10% of requests, 1.0 = 100% of requests
PERFORMANCE_SAMPLE_RATE="0.1"
```

### Step 6: Configure Uptime Monitoring

```bash
# Enable uptime monitoring
ENABLE_UPTIME_MONITORING="true"

# Optional: Uptime Robot integration
UPTIME_ROBOT_API_KEY=""
UPTIME_ROBOT_MONITOR_URL="http://localhost:3000/api/health"
```

## 🧪 Testing Your Configuration

### Test 1: Health Check
After setting up your environment variables, test the health check:

```bash
# Start your development server
npm run dev

# Visit in your browser
http://localhost:3000/api/health
```

You should see a JSON response with system health information.

### Test 2: Monitoring Dashboard
1. Log in as an admin user
2. Visit: `http://localhost:3000/admin/monitoring`
3. You should see the monitoring dashboard

### Test 3: Sentry Integration
Add this to any API route to test Sentry:

```typescript
import * as Sentry from '@sentry/nextjs';

// Test error capture
Sentry.captureException(new Error('Test error from RevSnap SaaS'));
```

Check your Sentry dashboard to see if the error appears.

### Test 4: LogRocket Integration
1. Visit your application in the browser
2. Check the browser console for LogRocket initialization messages
3. Visit your LogRocket dashboard to see session recordings

## 🔒 Security Notes

### Development vs Production

**Development Environment**:
```bash
NODE_ENV="development"
LOG_LEVEL="debug"
PERFORMANCE_SAMPLE_RATE="1.0"
```

**Production Environment**:
```bash
NODE_ENV="production"
LOG_LEVEL="warn"
PERFORMANCE_SAMPLE_RATE="0.1"
```

### Environment Variable Security

1. **Never commit `.env` files** to version control
2. **Use different credentials** for development and production
3. **Rotate API keys** regularly
4. **Use environment-specific** configuration

## 📋 Complete Example .env File

Here's a complete example of what your `.env` file should look like:

```bash
# ========================================
# REVSNAP SAAS - MONITORING CONFIGURATION
# ========================================

# Sentry Configuration
SENTRY_DSN="https://abc123def456@sentry.io/123456"
SENTRY_ORG="your-org-name"
SENTRY_PROJECT="revsnap-saas"
SENTRY_AUTH_TOKEN="your-auth-token-here"

# LogRocket Configuration
NEXT_PUBLIC_LOGROCKET_APP_ID="your-org/revsnap-saas"

# Uptime Monitoring (Optional)
UPTIME_ROBOT_API_KEY="u1234567-abc123def456"
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

# Development Settings
NODE_ENV="development"
```

## 🚨 Troubleshooting

### Common Issues

1. **Sentry not capturing errors**:
   - Verify `SENTRY_DSN` is correct
   - Check browser console for Sentry initialization errors
   - Ensure Sentry is not blocked by ad blockers

2. **LogRocket not working**:
   - Verify `NEXT_PUBLIC_LOGROCKET_APP_ID` is set
   - Check browser console for LogRocket errors
   - Ensure LogRocket is initialized after page load

3. **Monitoring dashboard not loading**:
   - Verify all environment variables are set
   - Check browser console for errors
   - Ensure you have admin access

4. **Health check failing**:
   - Verify database connection
   - Check external API configurations
   - Review health check endpoints

### Debug Mode

Enable debug mode for troubleshooting:

```bash
NODE_ENV="development"
LOG_LEVEL="debug"
ENABLE_PERFORMANCE_MONITORING="true"
```

## ✅ Next Steps

After configuring your environment variables:

1. **Test the monitoring system** using the test procedures above
2. **Set up alerts** in Sentry and LogRocket dashboards
3. **Configure production environment** variables
4. **Monitor the system** using the admin dashboard
5. **Review logs** in the `./logs` directory

## 📞 Support

If you encounter issues:

1. Check the logs in `./logs` directory
2. Review the troubleshooting section above
3. Check the monitoring dashboard for alerts
4. Refer to the main monitoring documentation

Your monitoring system is now ready to provide comprehensive visibility into your RevSnap SaaS application! 