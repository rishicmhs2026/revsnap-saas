#!/bin/bash

# RevSnap SaaS - Monitoring System Setup Script
# This script sets up comprehensive monitoring for the RevSnap SaaS platform

set -e

echo "🚀 Setting up RevSnap SaaS Monitoring System..."

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

print_status "Creating logs directory..."
mkdir -p logs
chmod 755 logs

print_status "Creating monitoring configuration files..."

# Create Sentry configuration files if they don't exist
if [ ! -f "sentry.client.config.ts" ]; then
    print_warning "Sentry client config not found. Please ensure it's created."
fi

if [ ! -f "sentry.server.config.ts" ]; then
    print_warning "Sentry server config not found. Please ensure it's created."
fi

# Install dependencies
print_status "Installing monitoring dependencies..."
npm install @sentry/nextjs logrocket winston winston-daily-rotate-file

# Create environment variables template
print_status "Creating environment variables template..."

cat > .env.monitoring.example << EOF
# Monitoring & Error Tracking
SENTRY_DSN="your-sentry-dsn"
SENTRY_ORG="your-sentry-org"
SENTRY_PROJECT="your-sentry-project"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# LogRocket
NEXT_PUBLIC_LOGROCKET_APP_ID="your-logrocket-app-id"

# Uptime Monitoring
UPTIME_ROBOT_API_KEY="your-uptime-robot-api-key"
UPTIME_ROBOT_MONITOR_URL="https://your-app-domain.com/api/health"

# Logging
LOG_LEVEL="info"
LOG_FILE_PATH="./logs"
ENABLE_STRUCTURED_LOGGING="true"

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING="true"
PERFORMANCE_SAMPLE_RATE="0.1"

# Uptime Monitoring
ENABLE_UPTIME_MONITORING="true"
EOF

print_success "Environment variables template created: .env.monitoring.example"

# Create monitoring documentation
print_status "Creating monitoring documentation..."

cat > MONITORING_SETUP.md << 'EOF'
# RevSnap SaaS Monitoring Setup Guide

## Overview
This guide covers the comprehensive monitoring system implemented for RevSnap SaaS, including error tracking, performance monitoring, uptime monitoring, and centralized logging.

## Components

### 1. Sentry Integration
- **Purpose**: Error tracking and performance monitoring
- **Setup**: 
  1. Create a Sentry account at https://sentry.io
  2. Create a new project for your Next.js application
  3. Copy the DSN to your environment variables
  4. Configure `SENTRY_DSN` in your `.env` file

### 2. LogRocket Integration
- **Purpose**: Session replay and error tracking
- **Setup**:
  1. Create a LogRocket account at https://logrocket.com
  2. Create a new project
  3. Copy the app ID to your environment variables
  4. Configure `NEXT_PUBLIC_LOGROCKET_APP_ID` in your `.env` file

### 3. Winston Logging
- **Purpose**: Centralized structured logging
- **Features**:
  - Daily log rotation
  - Multiple log levels
  - JSON structured logging
  - File and console output

### 4. Performance Monitoring
- **Purpose**: Track API response times, database queries, and application performance
- **Features**:
  - Real-time performance metrics
  - Database operation tracking
  - API request monitoring
  - Custom performance decorators

### 5. Uptime Monitoring
- **Purpose**: Service availability tracking
- **Features**:
  - Health checks for database, API, and external services
  - Automatic monitoring intervals
  - Uptime percentage calculation
  - Alert generation

## Environment Variables

Add these to your `.env` file:

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

## API Endpoints

### Health Check
- **Endpoint**: `/api/health`
- **Method**: GET
- **Purpose**: System health status for load balancers and monitoring tools

### Admin Monitoring
- **Endpoint**: `/api/admin/monitoring`
- **Method**: GET
- **Purpose**: Detailed monitoring data for administrators
- **Authentication**: Admin access required

## Usage Examples

### Performance Monitoring
```typescript
import { withPerformanceMonitoring } from '@/lib/monitoring-middleware';

const expensiveOperation = withPerformanceMonitoring(
  'expensive-calculation',
  async (data: any) => {
    // Your expensive operation here
    return result;
  }
);
```

### Database Monitoring
```typescript
import { withDatabaseMonitoring } from '@/lib/monitoring-middleware';

const getUserData = withDatabaseMonitoring(
  'select',
  'users',
  async (userId: string) => {
    return await prisma.user.findUnique({ where: { id: userId } });
  }
);
```

### Logging
```typescript
import { logInfo, logError, logWarn } from '@/lib/logger';

logInfo('User logged in', { userId: '123', timestamp: new Date() });
logError(new Error('Database connection failed'), { context: 'auth' });
logWarn('High memory usage detected', { usage: '85%' });
```

## Monitoring Dashboard

Access the monitoring dashboard at `/admin/monitoring` (admin access required).

Features:
- Real-time system health status
- Performance metrics
- API request statistics
- Database operation metrics
- Active alerts
- Environment configuration status

## Alerts and Notifications

The system automatically generates alerts for:
- System health degradation
- High response times (>1000ms)
- Database query failures
- Low success rates (<95%)
- Memory usage spikes

## Log Management

Logs are stored in the `./logs` directory with:
- Daily rotation
- Automatic cleanup (14 days retention)
- Structured JSON format
- Separate error and combined logs

## Troubleshooting

### Common Issues

1. **Sentry not capturing errors**
   - Verify `SENTRY_DSN` is set correctly
   - Check that Sentry is initialized in your app

2. **LogRocket not working**
   - Ensure `NEXT_PUBLIC_LOGROCKET_APP_ID` is set
   - Check browser console for initialization errors

3. **Performance monitoring not tracking**
   - Verify `ENABLE_PERFORMANCE_MONITORING=true`
   - Check that monitoring middleware is applied

4. **Health checks failing**
   - Verify database connection
   - Check external API configurations
   - Review health check endpoints

### Debug Mode

Enable debug mode by setting:
```bash
NODE_ENV=development
LOG_LEVEL=debug
```

## Security Considerations

- Admin monitoring endpoints require authentication
- Sensitive data is filtered from logs
- Environment variables are properly secured
- Health check endpoints are public but limited

## Performance Impact

The monitoring system is designed to have minimal performance impact:
- Sampling rates are configurable
- Logging is asynchronous
- Performance tracking is lightweight
- Health checks run on intervals

## Support

For issues with the monitoring system:
1. Check the logs in `./logs` directory
2. Review environment variable configuration
3. Verify external service credentials
4. Check the monitoring dashboard for alerts
EOF

print_success "Monitoring documentation created: MONITORING_SETUP.md"

# Create logs directory structure
print_status "Setting up log directory structure..."
mkdir -p logs/errors
mkdir -p logs/combined
mkdir -p logs/performance

# Set proper permissions
chmod 755 logs/errors
chmod 755 logs/combined
chmod 755 logs/performance

# Create initial log files
touch logs/errors/error-$(date +%Y-%m-%d).log
touch logs/combined/combined-$(date +%Y-%m-%d).log
touch logs/performance/performance-$(date +%Y-%m-%d).log

print_success "Log directory structure created"

# Verify setup
print_status "Verifying setup..."

# Check if required files exist
required_files=(
    "src/lib/logger.ts"
    "src/lib/performance-monitor.ts"
    "src/lib/uptime-monitor.ts"
    "src/app/api/health/route.ts"
    "src/app/api/admin/monitoring/route.ts"
    "src/components/MonitoringDashboard.tsx"
    "src/app/admin/monitoring/page.tsx"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file missing"
    fi
done

# Check if logs directory exists and is writable
if [ -d "logs" ] && [ -w "logs" ]; then
    print_success "✓ Logs directory is writable"
else
    print_error "✗ Logs directory is not writable"
fi

print_status "Setup verification complete"

# Final instructions
echo ""
print_success "🎉 Monitoring system setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.monitoring.example to .env and configure your monitoring services"
echo "2. Set up your Sentry account and add the DSN"
echo "3. Set up your LogRocket account and add the app ID"
echo "4. Configure uptime monitoring if needed"
echo "5. Start your application and test the monitoring dashboard"
echo ""
echo "Access the monitoring dashboard at: /admin/monitoring"
echo "Health check endpoint: /api/health"
echo ""
echo "For detailed setup instructions, see: MONITORING_SETUP.md" 