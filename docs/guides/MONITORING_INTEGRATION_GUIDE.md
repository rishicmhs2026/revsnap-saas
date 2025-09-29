# RevSnap SaaS - Comprehensive Monitoring Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the comprehensive monitoring system into your RevSnap SaaS application. The monitoring system includes:

1. **Sentry** - Error tracking and performance monitoring
2. **LogRocket** - Session replay and error tracking  
3. **Winston** - Centralized structured logging
4. **Performance Monitoring** - Custom APM implementation
5. **Uptime Monitoring** - Service availability tracking

## Prerequisites

- Node.js 18+ installed
- Access to Sentry account (free tier available)
- Access to LogRocket account (free tier available)
- Admin access to your application

## Step 1: Install Dependencies

The monitoring dependencies have been added to `package.json`. Install them:

```bash
npm install
```

This will install:
- `@sentry/nextjs` - Sentry integration for Next.js
- `logrocket` - LogRocket session replay
- `winston` - Structured logging
- `winston-daily-rotate-file` - Log rotation

## Step 2: Configure Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Sentry Configuration
SENTRY_DSN="your-sentry-dsn"
SENTRY_ORG="your-sentry-org"
SENTRY_PROJECT="your-sentry-project"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# LogRocket Configuration
NEXT_PUBLIC_LOGROCKET_APP_ID="your-logrocket-app-id"

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

## Step 3: Set Up Sentry

### 3.1 Create Sentry Account
1. Go to [Sentry.io](https://sentry.io)
2. Create a free account
3. Create a new organization
4. Create a new project for your Next.js application

### 3.2 Configure Sentry
1. Copy your DSN from the Sentry project settings
2. Add it to your `.env` file as `SENTRY_DSN`
3. The Sentry configuration files are already created:
   - `sentry.client.config.ts` - Client-side configuration
   - `sentry.server.config.ts` - Server-side configuration

### 3.3 Test Sentry Integration
Add this to any API route to test:

```typescript
import * as Sentry from '@sentry/nextjs';

// Test error capture
Sentry.captureException(new Error('Test error from RevSnap SaaS'));
```

## Step 4: Set Up LogRocket

### 4.1 Create LogRocket Account
1. Go to [LogRocket.com](https://logrocket.com)
2. Create a free account
3. Create a new project

### 4.2 Configure LogRocket
1. Copy your app ID from LogRocket
2. Add it to your `.env` file as `NEXT_PUBLIC_LOGROCKET_APP_ID`
3. The LogRocket integration is already created in `src/lib/logrocket.ts`

### 4.3 Initialize LogRocket
Add this to your main layout or app component:

```typescript
import { initializeLogRocket } from '@/lib/logrocket';

// Initialize LogRocket
if (typeof window !== 'undefined') {
  initializeLogRocket();
}
```

## Step 5: Integrate Monitoring Middleware

### 5.1 Update API Routes
Add monitoring to your existing API routes:

```typescript
import { withPerformanceMonitoring } from '@/lib/monitoring-middleware';
import { logInfo, logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  return withPerformanceMonitoring('api-get-users', async () => {
    try {
      logInfo('Fetching users', { endpoint: '/api/users' });
      
      // Your existing API logic here
      const users = await prisma.user.findMany();
      
      return NextResponse.json({ users });
    } catch (error) {
      logError(error as Error, { endpoint: '/api/users' });
      throw error;
    }
  })();
}
```

### 5.2 Update Database Operations
Wrap your Prisma operations with monitoring:

```typescript
import { withDatabaseMonitoring } from '@/lib/monitoring-middleware';

const getUserById = withDatabaseMonitoring(
  'select',
  'users',
  async (userId: string) => {
    return await prisma.user.findUnique({ where: { id: userId } });
  }
);
```

## Step 6: Add Logging Throughout Application

### 6.1 Authentication Logging
Update your auth routes:

```typescript
import { logInfo, logError } from '@/lib/logger';

// In your signin route
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    logInfo('User login attempt', { email });
    
    // Your authentication logic
    
    logInfo('User logged in successfully', { email });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, { email, action: 'login' });
    throw error;
  }
}
```

### 6.2 Error Handling
Add error logging to your error boundaries:

```typescript
import { logError } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

// In your error boundary component
componentDidCatch(error: Error, errorInfo: any) {
  logError(error, { errorInfo });
  Sentry.captureException(error, { extra: errorInfo });
}
```

## Step 7: Test the Monitoring System

### 7.1 Test Health Check
Visit `/api/health` to test the health check endpoint.

### 7.2 Test Admin Monitoring
1. Log in as an admin user
2. Visit `/admin/monitoring`
3. Verify all monitoring data is displayed

### 7.3 Test Error Tracking
1. Trigger a test error in your application
2. Check Sentry dashboard for the error
3. Check LogRocket for session replay

### 7.4 Test Logging
1. Perform various actions in your application
2. Check the logs in `./logs` directory
3. Verify structured logging is working

## Step 8: Configure Alerts and Notifications

### 8.1 Sentry Alerts
1. Go to your Sentry project settings
2. Configure alert rules for:
   - Error rate spikes
   - Performance degradation
   - New error types

### 8.2 LogRocket Alerts
1. Configure LogRocket to alert on:
   - JavaScript errors
   - Network failures
   - Performance issues

### 8.3 Custom Alerts
The monitoring system automatically generates alerts for:
- System health degradation
- High response times
- Database failures
- Low success rates

## Step 9: Production Deployment

### 9.1 Environment Variables
Ensure all monitoring environment variables are set in production:

```bash
# Production environment variables
SENTRY_DSN="your-production-sentry-dsn"
NEXT_PUBLIC_LOGROCKET_APP_ID="your-production-logrocket-app-id"
ENABLE_PERFORMANCE_MONITORING="true"
ENABLE_UPTIME_MONITORING="true"
LOG_LEVEL="warn"  # Less verbose in production
```

### 9.2 Log Management
1. Configure log rotation in production
2. Set up log aggregation (optional)
3. Monitor log storage usage

### 9.3 Performance Monitoring
1. Set appropriate sampling rates for production
2. Monitor the impact of monitoring on performance
3. Adjust settings as needed

## Step 10: Monitoring Dashboard Usage

### 10.1 Accessing the Dashboard
- URL: `/admin/monitoring`
- Requires admin authentication
- Real-time data updates every 30 seconds

### 10.2 Dashboard Features
- **System Health**: Overall system status and health checks
- **Performance Metrics**: API response times and database performance
- **Alerts**: Active system alerts and warnings
- **Environment**: Configuration status and system information

### 10.3 Dashboard Actions
- **Clear Metrics**: Reset performance metrics
- **Auto-refresh**: Toggle automatic data refresh
- **Health Checks**: Manual trigger of health checks

## Troubleshooting

### Common Issues

1. **Sentry not capturing errors**
   - Verify `SENTRY_DSN` is correct
   - Check Sentry initialization in your app
   - Ensure Sentry is not blocked by ad blockers

2. **LogRocket not working**
   - Verify `NEXT_PUBLIC_LOGROCKET_APP_ID` is set
   - Check browser console for errors
   - Ensure LogRocket is initialized after page load

3. **Performance monitoring not tracking**
   - Verify `ENABLE_PERFORMANCE_MONITORING=true`
   - Check that monitoring middleware is applied
   - Review sampling rate settings

4. **Health checks failing**
   - Verify database connection
   - Check external API configurations
   - Review health check endpoints

### Debug Mode

Enable debug mode for troubleshooting:

```bash
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_PERFORMANCE_MONITORING=true
```

### Log Analysis

Check logs for issues:

```bash
# View recent errors
tail -f logs/errors/error-$(date +%Y-%m-%d).log

# View all logs
tail -f logs/combined/combined-$(date +%Y-%m-%d).log

# View performance logs
tail -f logs/performance/performance-$(date +%Y-%m-%d).log
```

## Best Practices

### 1. Logging Best Practices
- Use structured logging with context
- Don't log sensitive information
- Use appropriate log levels
- Include relevant metadata

### 2. Performance Monitoring
- Set appropriate sampling rates
- Monitor the impact of monitoring
- Use performance decorators for expensive operations
- Track database query performance

### 3. Error Tracking
- Capture meaningful error context
- Don't capture sensitive data
- Use error boundaries in React components
- Monitor error rates and trends

### 4. Security
- Secure admin monitoring endpoints
- Filter sensitive data from logs
- Use environment variables for configuration
- Regular security audits

## Support and Maintenance

### Regular Maintenance
1. **Weekly**: Review monitoring dashboard
2. **Monthly**: Analyze performance trends
3. **Quarterly**: Review and update alert rules
4. **Annually**: Audit monitoring configuration

### Monitoring System Updates
- Keep monitoring dependencies updated
- Review new features in Sentry and LogRocket
- Update monitoring configuration as needed
- Test monitoring system regularly

### Documentation
- Keep this guide updated
- Document any custom monitoring rules
- Maintain runbooks for common issues
- Train team members on monitoring usage

## Conclusion

The comprehensive monitoring system is now integrated into your RevSnap SaaS application. This system provides:

- **Real-time error tracking** with Sentry
- **Session replay and debugging** with LogRocket
- **Structured logging** with Winston
- **Performance monitoring** with custom APM
- **Uptime monitoring** with health checks
- **Admin dashboard** for monitoring overview

This monitoring system will help you:
- Identify and fix issues quickly
- Monitor application performance
- Track user experience
- Maintain high availability
- Make data-driven decisions

For ongoing support and questions, refer to the individual service documentation:
- [Sentry Documentation](https://docs.sentry.io/)
- [LogRocket Documentation](https://docs.logrocket.com/)
- [Winston Documentation](https://github.com/winstonjs/winston) 