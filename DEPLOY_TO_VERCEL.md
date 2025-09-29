# 🚀 Deploy RevSnap SaaS to Vercel

## Prerequisites

1. **GitHub Repository**: Your code is already pushed to GitHub ✅
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Domain** (Optional): Purchase a domain or use Vercel's free subdomain

## Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"New Project"**
3. Import your GitHub repository: `rishicmhs2026/revsnap-saas`
4. Vercel will automatically detect it's a Next.js project

## Step 2: Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

## Step 3: Set Up Environment Variables

### Required Environment Variables (Minimum)

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Core Application
NODE_ENV=production
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-nextauth-key-here-minimum-32-characters

# Database (Use Vercel Postgres or external)
DATABASE_URL=your-database-connection-string

# Stripe (Required for subscriptions)
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# Stripe Price IDs (Create these in Stripe Dashboard)
STRIPE_STARTER_PRICE_ID=price_your-starter-price-id
STRIPE_PROFESSIONAL_PRICE_ID=price_your-professional-price-id
STRIPE_ENTERPRISE_PRICE_ID=price_your-enterprise-price-id
```

### Optional Environment Variables

Add these for enhanced functionality:

```bash
# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
```

## Step 4: Set Up Database

### Option A: Vercel Postgres (Recommended)

1. In your Vercel project dashboard
2. Go to **Storage** tab
3. Click **Create Database** → **Postgres**
4. Copy the `DATABASE_URL` and add it to Environment Variables
5. Run migrations after deployment

### Option B: External Database

- **Neon**: [neon.tech](https://neon.tech) (Free tier available)
- **PlanetScale**: [planetscale.com](https://planetscale.com)
- **Supabase**: [supabase.com](https://supabase.com)

## Step 5: Deploy

1. Click **Deploy** in Vercel
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at: `https://your-app-name.vercel.app`

## Step 6: Run Database Migrations

After deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run database migrations
npx prisma migrate deploy
```

## Step 7: Set Up Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. **Endpoint URL**: `https://your-app-name.vercel.app/api/webhooks/stripe`
5. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Copy the **Webhook Signing Secret** and add to Vercel environment variables

## Step 8: Test Your Deployment

1. **Visit your app**: `https://your-app-name.vercel.app`
2. **Test signup/signin**
3. **Test subscription flow**
4. **Check database connection**
5. **Verify Stripe integration**

## Step 9: Custom Domain (Optional)

1. In Vercel Dashboard → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable

## Troubleshooting

### Build Failures

```bash
# Check build logs in Vercel dashboard
# Common issues:
# 1. Missing environment variables
# 2. Database connection issues
# 3. TypeScript errors
```

### Database Issues

```bash
# Reset database
npx prisma migrate reset

# Deploy migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Environment Variables Not Working

1. Verify all required variables are set
2. Redeploy after adding new variables
3. Check variable names match exactly

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Stripe webhooks configured
- [ ] Custom domain set up (optional)
- [ ] SSL certificate active
- [ ] Analytics configured
- [ ] Error monitoring set up
- [ ] Backup strategy in place

## Monitoring Your App

1. **Vercel Analytics**: Built-in performance monitoring
2. **Function Logs**: Check API route performance
3. **Database Monitoring**: Monitor query performance
4. **Error Tracking**: Set up Sentry for error monitoring

## Scaling Considerations

- **Vercel Pro**: For higher limits and better performance
- **Database Scaling**: Upgrade database plan as needed
- **CDN**: Vercel Edge Network handles global distribution
- **Function Limits**: Monitor Vercel function execution limits

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **HTTPS**: Vercel provides SSL automatically
3. **CORS**: Configure appropriate CORS policies
4. **Rate Limiting**: Implement API rate limiting
5. **Input Validation**: Validate all user inputs

## Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)

---

## Quick Deploy Commands

```bash
# Deploy from local (if you have Vercel CLI)
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Open in browser
vercel open
```

Your RevSnap SaaS application should now be live and accessible to users worldwide! 🎉
