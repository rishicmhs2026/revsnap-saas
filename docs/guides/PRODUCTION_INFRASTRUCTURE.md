# Production Infrastructure Setup Guide

## Overview
This guide provides a complete production infrastructure setup for RevSnap SaaS, addressing all critical infrastructure components needed for a production-ready B2B SaaS platform.

## 1. PostgreSQL Database Migration

### Current State
- Using SQLite (development only)
- Need to migrate to PostgreSQL for production

### Migration Steps

#### 1.1 Update Prisma Schema
```bash
# Update datasource in prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 1.2 Database Setup Options

**Option A: Managed PostgreSQL (Recommended)**
- **Supabase**: Free tier + paid plans
- **Neon**: Serverless PostgreSQL
- **Railway**: Easy deployment
- **PlanetScale**: MySQL with PostgreSQL compatibility

**Option B: Self-hosted PostgreSQL**
- **DigitalOcean**: Managed PostgreSQL
- **AWS RDS**: Enterprise-grade
- **Google Cloud SQL**: Fully managed

#### 1.3 Migration Commands
```bash
# Generate new migration for PostgreSQL
npm run db:generate
npx prisma migrate dev --name postgresql-migration

# Deploy to production
npx prisma migrate deploy
```

## 2. Redis for Caching & Session Storage

### 2.1 Redis Setup Options

**Option A: Managed Redis**
- **Upstash**: Serverless Redis
- **Redis Cloud**: Enterprise Redis
- **Railway**: Easy setup

**Option B: Self-hosted Redis**
- **DigitalOcean**: Managed Redis
- **AWS ElastiCache**: Enterprise-grade

### 2.2 Redis Configuration
```typescript
// lib/redis.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

export default redis;
```

### 2.3 Session Storage with Redis
```typescript
// lib/session-store.ts
import { Redis } from 'ioredis';

export class RedisSessionStore {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  async get(sessionId: string) {
    const data = await this.redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }
  
  async set(sessionId: string, data: any, ttl?: number) {
    const key = `session:${sessionId}`;
    await this.redis.setex(key, ttl || 86400, JSON.stringify(data));
  }
  
  async delete(sessionId: string) {
    await this.redis.del(`session:${sessionId}`);
  }
}
```

## 3. CDN Setup

### 3.1 Vercel Edge Network (Built-in)
- Automatic CDN for static assets
- Global edge caching
- Image optimization

### 3.2 Cloudflare CDN
```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### 3.3 AWS CloudFront Setup
```yaml
# cloudfront-distribution.yml
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - DomainName: your-app-domain.com
            Id: S3Origin
            CustomOriginConfig:
              HTTPPort: 80
              HTTPSPort: 443
              OriginProtocolPolicy: https-only
        Enabled: true
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad
```

## 4. Backup Strategy

### 4.1 Database Backups

#### Automated PostgreSQL Backups
```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="revsnap_saas"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://your-backup-bucket/
```

#### Cron Job Setup
```bash
# Add to crontab
0 2 * * * /path/to/scripts/backup-database.sh
```

### 4.2 File Backups
```typescript
// lib/backup-service.ts
import { S3 } from 'aws-sdk';
import fs from 'fs';
import path from 'path';

export class BackupService {
  private s3: S3;
  
  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }
  
  async backupFiles(sourcePath: string, bucketName: string) {
    const files = fs.readdirSync(sourcePath);
    
    for (const file of files) {
      const filePath = path.join(sourcePath, file);
      const fileContent = fs.readFileSync(filePath);
      
      await this.s3.upload({
        Bucket: bucketName,
        Key: `backups/${new Date().toISOString()}/${file}`,
        Body: fileContent,
      }).promise();
    }
  }
}
```

## 5. SSL Certificate Setup

### 5.1 Vercel (Automatic)
- Automatic SSL certificates
- Custom domain support
- HTTP/2 and HTTP/3

### 5.2 Custom Domain SSL
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};
```

### 5.3 Let's Encrypt Setup
```bash
#!/bin/bash
# scripts/setup-ssl.sh

# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 6. Environment Configuration

### 6.1 Production Environment Variables
```bash
# .env.production
# Database
DATABASE_URL="postgresql://username:password@host:5432/revsnap_saas"

# Redis
REDIS_URL="redis://username:password@host:6379"

# CDN
CDN_URL="https://your-cdn-domain.com"

# Backup
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
BACKUP_BUCKET="your-backup-bucket"

# SSL
SSL_CERT_PATH="/etc/letsencrypt/live/your-domain.com/fullchain.pem"
SSL_KEY_PATH="/etc/letsencrypt/live/your-domain.com/privkey.pem"
```

## 7. Deployment Scripts

### 7.1 Production Deployment
```bash
#!/bin/bash
# scripts/deploy-production.sh

echo "🚀 Starting production deployment..."

# Build application
echo "📦 Building application..."
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

# Run health checks
echo "🏥 Running health checks..."
curl -f https://your-domain.com/api/health || exit 1

echo "✅ Production deployment completed!"
```

### 7.2 Health Check Script
```bash
#!/bin/bash
# scripts/health-check.sh

HEALTH_URL="https://your-domain.com/api/health"
SLACK_WEBHOOK="your-slack-webhook-url"

# Check application health
response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $response -ne 200 ]; then
    echo "❌ Health check failed with status: $response"
    
    # Send Slack notification
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 RevSnap SaaS health check failed! Status: $response\"}" \
        $SLACK_WEBHOOK
    
    exit 1
else
    echo "✅ Health check passed"
fi
```

## 8. Monitoring & Alerting

### 8.1 Uptime Monitoring
```typescript
// lib/uptime-monitor.ts
import cron from 'node-cron';
import axios from 'axios';

export class UptimeMonitor {
  private endpoints = [
    'https://your-domain.com/api/health',
    'https://your-domain.com/api/analytics',
  ];
  
  start() {
    // Check every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      for (const endpoint of this.endpoints) {
        try {
          const response = await axios.get(endpoint, { timeout: 10000 });
          console.log(`✅ ${endpoint} - Status: ${response.status}`);
        } catch (error) {
          console.error(`❌ ${endpoint} - Error: ${error.message}`);
          // Send alert
          await this.sendAlert(endpoint, error.message);
        }
      }
    });
  }
  
  private async sendAlert(endpoint: string, error: string) {
    // Send to Slack, email, or monitoring service
  }
}
```

## 9. Cost Optimization

### 9.1 Infrastructure Costs (Monthly Estimates)
- **PostgreSQL**: $25-100 (depending on size)
- **Redis**: $15-50 (depending on usage)
- **CDN**: $10-30 (depending on traffic)
- **SSL**: Free (Let's Encrypt) or $20-100 (managed)
- **Backup Storage**: $5-20 (depending on size)

### 9.2 Optimization Tips
- Use connection pooling for database
- Implement Redis caching strategies
- Enable CDN compression
- Set up automated scaling
- Monitor resource usage

## 10. Security Considerations

### 10.1 Database Security
- Use connection pooling
- Implement row-level security
- Regular security updates
- Encrypted connections

### 10.2 Redis Security
- Enable authentication
- Use SSL connections
- Network isolation
- Regular key rotation

### 10.3 CDN Security
- Enable WAF (Web Application Firewall)
- DDoS protection
- Rate limiting
- Geographic restrictions

## Next Steps

1. **Choose your infrastructure providers**
2. **Set up PostgreSQL database**
3. **Configure Redis for caching**
4. **Deploy CDN setup**
5. **Implement backup strategy**
6. **Configure SSL certificates**
7. **Set up monitoring and alerting**
8. **Test all components**
9. **Deploy to production**

## Support

For questions or issues with the production infrastructure setup, please refer to:
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Redis Documentation](https://redis.io/documentation)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) 