# OAuth Setup Guide for RevSnap

This guide will walk you through setting up Google and GitHub OAuth authentication for your RevSnap application.

## 🔐 Why OAuth is Essential for Premium SaaS

OAuth authentication provides:
- **Professional User Experience**: Users can sign in with familiar accounts
- **Enhanced Security**: No need to manage additional passwords
- **Faster Onboarding**: Reduce friction in user registration
- **Trust & Credibility**: Essential for premium SaaS applications

## 📋 Prerequisites

1. Google Cloud Console account
2. GitHub Developer account
3. Your RevSnap application domain (production URL)

## 🎯 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select existing project
3. Name your project (e.g., "RevSnap SaaS")
4. Note your Project ID

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have Google Workspace)
3. Fill in the required information:
   - **App name**: RevSnap - Pricing Intelligence Platform
   - **User support email**: Your support email
   - **App logo**: Upload your RevSnap logo (120x120px)
   - **App domain**: Your production domain
   - **Authorized domains**: Add your domain (e.g., `revsnap.com`)
   - **Developer contact**: Your email

4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

5. Add test users (for development):
   - Add your email and team member emails

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "RevSnap Web Client"
5. Authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

7. Click "Create"
8. **Copy the Client ID and Client Secret** - you'll need these!

## 🐙 GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: RevSnap - Pricing Intelligence Platform
   - **Homepage URL**: `https://yourdomain.com`
   - **Application description**: AI-powered pricing optimization and competitor tracking
   - **Authorization callback URL**: 
     - Development: `http://localhost:3000/api/auth/callback/github`
     - Production: `https://yourdomain.com/api/auth/callback/github`

4. Click "Register application"

### Step 2: Generate Client Secret

1. In your new OAuth app, click "Generate a new client secret"
2. **Copy the Client ID and Client Secret** - you'll need these!

## ⚙️ Environment Configuration

Update your `.env` file with the real credentials:

```env
# OAuth Providers - REPLACE WITH REAL VALUES
GOOGLE_CLIENT_ID="your-actual-google-client-id"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret"

GITHUB_CLIENT_ID="your-actual-github-client-id"
GITHUB_CLIENT_SECRET="your-actual-github-client-secret"

# Ensure these are also set correctly
NEXTAUTH_URL="http://localhost:3000"  # or your production URL
NEXTAUTH_SECRET="a-long-random-string-for-jwt-signing"
```

## 🔒 Security Best Practices

1. **Never commit credentials to version control**
2. **Use different OAuth apps for development and production**
3. **Regularly rotate client secrets**
4. **Monitor OAuth usage in respective consoles**
5. **Set up proper domain restrictions**

## 🚀 Production Deployment

### For Production:

1. Create separate OAuth applications for production
2. Update authorized domains/URIs with production URLs
3. Set production environment variables
4. Test the complete flow before launch

### Environment Variables for Production:

```env
NEXTAUTH_URL="https://yourdomain.com"
GOOGLE_CLIENT_ID="prod-google-client-id"
GOOGLE_CLIENT_SECRET="prod-google-client-secret"
GITHUB_CLIENT_ID="prod-github-client-id"
GITHUB_CLIENT_SECRET="prod-github-client-secret"
```

## 🧪 Testing Your Setup

1. Start your development server: `npm run dev`
2. Go to `/auth/signin`
3. Try signing in with Google and GitHub
4. Check that user data is properly stored in your database
5. Verify the user is redirected to the dashboard

## 🛠️ Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch"**: Check your callback URLs match exactly
2. **"invalid_client"**: Verify client ID and secret are correct
3. **"access_denied"**: User cancelled or app needs approval
4. **Database errors**: Ensure your Prisma schema supports OAuth users

### Debug Mode:

Add to your `.env` for debugging:
```env
NEXTAUTH_DEBUG="true"
```

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Review NextAuth.js logs
3. Verify OAuth app configurations
4. Ensure environment variables are loaded correctly

---

**Note**: This setup is crucial for a premium SaaS product. Professional OAuth integration builds user trust and provides a seamless experience that users expect from premium applications.