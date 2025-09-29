# 🔧 Vercel Environment Variables Setup

## Essential Variables (Required for Basic Functionality)

Add these to your Vercel project settings:

### 1. Core Application
```bash
NODE_ENV=production
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-nextauth-key-here-minimum-32-characters
```

### 2. Database
```bash
DATABASE_URL=your-database-connection-string
```

### 3. Stripe (Minimum for Subscriptions)
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
```

### 4. Stripe Price IDs (Create in Stripe Dashboard)
```bash
STRIPE_STARTER_PRICE_ID=price_your-starter-price-id
STRIPE_PROFESSIONAL_PRICE_ID=price_your-professional-price-id
STRIPE_ENTERPRISE_PRICE_ID=price_your-enterprise-price-id
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** tab
3. Click **Environment Variables** in the sidebar
4. Click **Add New**
5. Enter the **Name** and **Value**
6. Select **Production** environment
7. Click **Save**
8. **Redeploy** your application

## Quick Setup Commands

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Test Environment Variables
```bash
# Check if variables are set
vercel env ls

# Pull environment variables locally (for testing)
vercel env pull .env.local
```

## Database Setup Options

### Option 1: Vercel Postgres (Recommended)
1. In Vercel dashboard → **Storage** tab
2. Click **Create Database** → **Postgres**
3. Copy the `DATABASE_URL` from the database settings
4. Add to environment variables

### Option 2: External Database
- **Neon**: [neon.tech](https://neon.tech) (Free tier)
- **PlanetScale**: [planetscale.com](https://planetscale.com)
- **Supabase**: [supabase.com](https://supabase.com)

## Stripe Setup

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Create account and get API keys

### 2. Create Price IDs
1. Go to Stripe Dashboard → **Products**
2. Create products for each plan:
   - Starter Plan ($49/month)
   - Professional Plan ($149/month)
   - Enterprise Plan ($399/month)
3. Copy the Price IDs and add to environment variables

### 3. Set Up Webhooks
1. Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret and add to environment variables

## Testing Your Setup

### 1. Test Database Connection
Visit: `https://your-app.vercel.app/api/health`

### 2. Test Authentication
- Try signing up/signing in
- Check if user data is saved to database

### 3. Test Subscriptions
- Try the subscription flow
- Check if webhooks are received

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check all required environment variables are set
   - Verify variable names match exactly
   - Check for typos in values

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database credentials
   - Ensure database is accessible from Vercel

3. **Stripe Issues**
   - Verify API keys are correct
   - Check webhook URL is correct
   - Ensure webhook secret matches

### Debug Commands

```bash
# Check deployment logs
vercel logs

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local

# Deploy with debug info
vercel --prod --debug
```

## Security Notes

- Never commit environment variables to Git
- Use strong, unique secrets
- Regularly rotate API keys
- Monitor for unauthorized access
- Use different keys for test/production

## Next Steps After Setup

1. **Deploy**: `vercel --prod`
2. **Run Migrations**: `npx prisma migrate deploy`
3. **Test Application**: Visit your deployed URL
4. **Configure Monitoring**: Set up error tracking
5. **Set Up Analytics**: Configure user analytics

---

## Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **NextAuth Docs**: [next-auth.js.org](https://next-auth.js.org)
