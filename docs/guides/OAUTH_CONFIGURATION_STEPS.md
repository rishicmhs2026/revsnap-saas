# OAuth Configuration - Step-by-Step Implementation

This document provides the exact steps to configure OAuth applications for RevSnap.

## 🎯 Google OAuth Setup

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one
   - Click "Select a project" → "New Project"
   - Name: "RevSnap SaaS Platform"
   - Note the Project ID for later use

### Step 2: Enable Required APIs
1. Go to "APIs & Services" → "Library"
2. Search for and enable:
   - **Google+ API** (for user profile access)
   - **People API** (for enhanced user information)

### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   ```
   App name: RevSnap - AI-Powered Pricing Intelligence
   User support email: [your-support-email]
   App logo: [upload RevSnap logo - 120x120px recommended]
   App domain: https://your-domain.com
   Authorized domains: your-domain.com
   Developer contact information: [your-email]
   ```
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

### Step 4: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "RevSnap Web Client"
5. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-production-domain.com/api/auth/callback/google
   ```
7. Click "Create"
8. **IMPORTANT**: Copy and save the Client ID and Client Secret immediately

## 🐙 GitHub OAuth Setup

### Step 1: Access GitHub Developer Settings
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Sign in to your GitHub account

### Step 2: Create New OAuth App
1. Click "OAuth Apps" → "New OAuth App"
2. Fill in application details:
   ```
   Application name: RevSnap - Pricing Intelligence Platform
   Homepage URL: https://your-domain.com
   Application description: AI-powered pricing optimization and competitor tracking platform for e-commerce businesses
   Authorization callback URL: 
     - Development: http://localhost:3000/api/auth/callback/github
     - Production: https://your-domain.com/api/auth/callback/github
   ```
3. Click "Register application"

### Step 3: Generate Client Secret
1. Click "Generate a new client secret"
2. **IMPORTANT**: Copy and save the Client ID and Client Secret immediately
3. Store these securely - you won't be able to see the secret again

## ⚙️ Environment Configuration

### Update .env File
Replace the placeholder values in your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-actual-google-client-id"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret"

# GitHub OAuth  
GITHUB_CLIENT_ID="your-actual-github-client-id"
GITHUB_CLIENT_SECRET="your-actual-github-client-secret"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"  # Change to production URL when deploying
NEXTAUTH_SECRET="your-generated-secret-key"
```

### Generate NextAuth Secret
Run one of these commands to generate a secure secret:
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Using our setup script
./scripts/setup-oauth.sh
```

## 🚀 Testing Configuration

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test OAuth Flow
1. Navigate to `http://localhost:3000/auth/signin`
2. Verify that Google and/or GitHub buttons appear
3. Click each OAuth button and complete the authentication flow
4. Verify successful login and redirect to dashboard

### 3. Verify User Data
Check that user information is properly stored in your database:
```bash
# View users table
npx prisma studio
```

## 🔒 Production Deployment

### For Production Environment:

1. **Create separate OAuth applications** for production
2. **Update environment variables** for production:
   ```env
   NEXTAUTH_URL="https://your-production-domain.com"
   GOOGLE_CLIENT_ID="prod-google-client-id"
   GOOGLE_CLIENT_SECRET="prod-google-client-secret"
   GITHUB_CLIENT_ID="prod-github-client-id"
   GITHUB_CLIENT_SECRET="prod-github-client-secret"
   ```

3. **Update OAuth application settings** with production URLs:
   - Google: Update Authorized JavaScript origins and redirect URIs
   - GitHub: Update Authorization callback URL

## 🛠️ Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch"**
   - Ensure callback URLs match exactly in OAuth app settings
   - Check for typos in domain names
   - Verify protocol (http vs https)

2. **"invalid_client"**
   - Verify Client ID and Secret are correct
   - Check environment variables are loaded
   - Ensure no extra spaces or quotes

3. **Buttons not appearing**
   - Check browser console for JavaScript errors
   - Verify API endpoint `/api/auth/providers` returns correct data
   - Ensure OAuth credentials are not placeholder values

### Debug Mode:
Add to your `.env` for detailed debugging:
```env
NEXTAUTH_DEBUG="true"
```

## 📞 Next Steps

1. **Test thoroughly** in development
2. **Set up production OAuth apps** when ready to deploy
3. **Configure domain verification** for Google (if required)
4. **Set up monitoring** for authentication errors
5. **Implement user onboarding flow** for first-time OAuth users

---

**Security Reminder**: Never commit OAuth secrets to version control. Always use environment variables and secure secret management in production.