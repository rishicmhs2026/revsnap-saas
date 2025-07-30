# RevSnap SaaS Backend Setup Guide

This guide will help you set up the backend infrastructure for the RevSnap SaaS platform, including the database, authentication, and API endpoints.

## 🗄️ Database Setup

### Prerequisites

1. **PostgreSQL Database**
   - Install PostgreSQL on your system
   - Create a new database for the project
   - Note down the connection details

2. **Node.js and npm**
   - Ensure you have Node.js 18+ installed
   - Verify with `node --version` and `npm --version`

### Quick Setup

1. **Install Dependencies**
   ```bash
   npm install prisma @prisma/client @auth/prisma-adapter next-auth bcryptjs @types/bcryptjs tsx
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/revsnap_saas"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Database Migration**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Seed Database**
   ```bash
   npm run db:seed
   ```

### Alternative: Automated Setup

Run the automated setup script:
```bash
npm run setup
```

## 🔐 Authentication Setup

### OAuth Providers (Optional)

1. **Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add to `.env`:
     ```env
     GOOGLE_CLIENT_ID="your-google-client-id"
     GOOGLE_CLIENT_SECRET="your-google-client-secret"
     ```

2. **GitHub OAuth**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create a new OAuth App
   - Add to `.env`:
     ```env
     GITHUB_CLIENT_ID="your-github-client-id"
     GITHUB_CLIENT_SECRET="your-github-client-secret"
     ```

## 💳 Stripe Integration (Optional)

1. **Stripe Account**
   - Create a Stripe account at [stripe.com](https://stripe.com)
   - Get your API keys from the dashboard

2. **Environment Variables**
   ```env
   STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
   STRIPE_SECRET_KEY="sk_test_your-key"
   STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
   ```

## 📧 Email Configuration (Optional)

For email notifications, configure SMTP settings:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

## 🚀 API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Sign out

### Organizations
- `GET /api/organizations` - List user's organizations
- `POST /api/organizations` - Create new organization

### Products
- `GET /api/products?organizationId=xxx` - List organization products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Competitor Tracking
- `GET /api/competitor-tracking` - Track competitors
- `POST /api/competitor-tracking` - Start tracking
- `PUT /api/competitor-tracking` - Webhook for updates

### Analytics
- `GET /api/analytics?organizationId=xxx` - Organization analytics
- `GET /api/analytics?productId=xxx` - Product analytics

## 🗂️ Database Schema

The database includes the following main tables:

### Core Tables
- **users** - User accounts and authentication
- **organizations** - Company/organization data
- **products** - Products being tracked
- **competitor_data** - Historical competitor pricing data
- **price_alerts** - Price change notifications
- **tracking_jobs** - Scheduled tracking tasks

### Supporting Tables
- **accounts** - OAuth provider accounts
- **sessions** - User sessions
- **subscriptions** - Stripe subscription data
- **api_keys** - API access keys
- **webhooks** - Webhook configurations

## 🔧 Development Commands

```bash
# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run migrations
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed database
npm run db:reset       # Reset database

# Development
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
npm run type-check     # Run TypeScript checks
```

## 🧪 Testing the Setup

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Access the application**
   - Open http://localhost:3000
   - Sign in with the demo account:
     - Email: `admin@revsnap.com`
     - Password: `password123`

3. **Test API endpoints**
   ```bash
   # Test authentication
   curl -X POST http://localhost:3000/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@revsnap.com","password":"password123"}'

   # Test products API
   curl http://localhost:3000/api/products?organizationId=your-org-id
   ```

## 🔍 Database Management

### Prisma Studio
View and edit data through the web interface:
```bash
npm run db:studio
```

### Manual Database Access
```bash
# Connect to PostgreSQL
psql -h localhost -U username -d revsnap_saas

# View tables
\dt

# Query data
SELECT * FROM "User";
SELECT * FROM "Organization";
SELECT * FROM "Product";
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL in `.env`
   - Ensure PostgreSQL is running
   - Check database permissions

2. **Prisma Client Not Generated**
   ```bash
   npm run db:generate
   ```

3. **Migration Errors**
   ```bash
   npm run db:reset
   npm run db:migrate
   npm run db:seed
   ```

4. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check OAuth provider credentials
   - Ensure NEXTAUTH_URL matches your domain

### Getting Help

- Check the [Prisma documentation](https://www.prisma.io/docs/)
- Review [NextAuth.js docs](https://next-auth.js.org/)
- Check the application logs for detailed error messages

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, unique secrets for production
   - Rotate API keys regularly

2. **Database Security**
   - Use strong database passwords
   - Limit database access to application only
   - Enable SSL for database connections in production

3. **API Security**
   - All endpoints require authentication
   - Implement rate limiting for production
   - Validate all input data

## 📈 Production Deployment

For production deployment:

1. **Database**
   - Use a managed PostgreSQL service (e.g., Supabase, PlanetScale)
   - Enable connection pooling
   - Set up automated backups

2. **Environment**
   - Use production-grade secrets
   - Enable HTTPS
   - Set up monitoring and logging

3. **Scaling**
   - Consider using Redis for caching
   - Implement job queues for background tasks
   - Set up CDN for static assets

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) 