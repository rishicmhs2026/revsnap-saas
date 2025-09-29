# 🚀 Google OAuth Setup - Step-by-Step Implementation

## 📋 **What We're Implementing**

Setting up **Google OAuth** for RevSnap so users can sign in with their Google accounts. This will replace the placeholder credentials and make the "Sign in with Google" button fully functional.

---

## 🎯 **Step 1: Create Google Cloud Project**

### 1.1 Access Google Cloud Console
1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. Sign in with your Google account
3. If you don't have a project, you'll see "Select a project" at the top

### 1.2 Create New Project
1. Click **"Select a project"** → **"New Project"**
2. Fill in project details:
   ```
   Project name: RevSnap SaaS Platform
   Organization: (leave as default or select your org)
   Location: (leave as default)
   ```
3. Click **"CREATE"**
4. **📝 Important**: Note your Project ID (it appears below the project name)

---

## 🔧 **Step 2: Enable Required APIs**

### 2.1 Enable Google+ API
1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on **"Google+ API"** → Click **"ENABLE"**

### 2.2 Enable People API (Recommended)
1. Still in the Library, search for **"People API"**
2. Click on **"People API"** → Click **"ENABLE"**

---

## 🎨 **Step 3: Configure OAuth Consent Screen**

### 3.1 Access OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type (unless you have Google Workspace)
3. Click **"CREATE"**

### 3.2 Fill App Information
```
App name: RevSnap - AI-Powered Pricing Intelligence
User support email: [your-email@domain.com]
App logo: [Optional - upload if you have one]

App domain (if you have a custom domain):
- Application home page: https://your-domain.com
- Application privacy policy link: https://your-domain.com/privacy-policy
- Application terms of service link: https://your-domain.com/terms-of-service

Authorized domains:
- localhost (for development)
- your-domain.com (if you have a production domain)

Developer contact information:
- Email addresses: [your-email@domain.com]
```

### 3.3 Add Required Scopes
1. Click **"ADD OR REMOVE SCOPES"**
2. Add these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
3. Click **"UPDATE"** → **"SAVE AND CONTINUE"**

### 3.4 Test Users (Development Only)
1. Add your own email as a test user
2. Click **"SAVE AND CONTINUE"**

---

## 🔑 **Step 4: Create OAuth Credentials**

### 4.1 Create OAuth 2.0 Client ID
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client IDs"**

### 4.2 Configure Web Application
```
Application type: Web application
Name: RevSnap Web Client

Authorized JavaScript origins:
- http://localhost:3000
- http://127.0.0.1:3000
- https://your-domain.com (if you have production domain)

Authorized redirect URIs:
- http://localhost:3000/api/auth/callback/google
- http://127.0.0.1:3000/api/auth/callback/google
- https://your-domain.com/api/auth/callback/google (if production)
```

### 4.3 Save Your Credentials
1. Click **"CREATE"**
2. **🚨 CRITICAL**: Copy the **Client ID** and **Client Secret** immediately
3. Store them securely - you'll need them for the next step

---

## ⚙️ **Step 5: Update Environment Variables**

Once you have your Google OAuth credentials, I'll help you update the `.env` file automatically.

---

## ✅ **Next Steps**

After completing the Google Cloud Console setup:
1. Provide me with your **Client ID** and **Client Secret**
2. I'll update your `.env` file securely
3. We'll test the OAuth flow
4. You'll have fully functional Google authentication!

---

## 🔒 **Security Notes**

- ✅ Never commit OAuth secrets to version control
- ✅ Use different credentials for development and production
- ✅ Regularly rotate your OAuth secrets
- ✅ Monitor OAuth usage in Google Cloud Console

---

## 🆘 **Need Help?**

If you encounter any issues:
1. Check the Google Cloud Console error messages
2. Verify all URLs are correct (especially redirect URIs)
3. Ensure APIs are enabled
4. Make sure OAuth consent screen is configured

Ready to proceed? Complete the Google Cloud Console setup above, then provide me with your credentials to continue!