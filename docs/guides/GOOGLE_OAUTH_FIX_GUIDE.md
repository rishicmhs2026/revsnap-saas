# Google OAuth Sign-in Fix Guide

## 🔍 **Current Status**
✅ All environment variables are properly configured  
✅ Server is running on `http://localhost:3000`  
✅ OAuth provider is available  
❌ Google OAuth returning 400 Bad Request  

## 🎯 **Root Cause: Google Cloud Console Configuration**

The error "Error 400: redirect_uri_mismatch" means your Google Cloud Console OAuth configuration doesn't match your current setup.

## ✅ **Step-by-Step Fix**

### **Step 1: Access Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if needed)
3. Navigate to **"APIs & Services"** → **"Credentials"**

### **Step 2: Update OAuth 2.0 Client ID**
1. Find your **OAuth 2.0 Client ID** in the list
2. Click on it to edit
3. In the **"Authorized redirect URIs"** section, add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. If you also want to support port 3001, add:
   ```
   http://localhost:3001/api/auth/callback/google
   ```
5. Click **"Save"**

### **Step 3: Verify OAuth Consent Screen**
1. Go to **"OAuth consent screen"** in the left sidebar
2. Make sure your app is configured with:
   - **App name**: "RevSnap - Pricing Intelligence Platform"
   - **User support email**: Your email
   - **Developer contact information**: Your email
3. Add your email to **"Test users"** if in testing mode

### **Step 4: Wait and Test**
- Changes can take 5-10 minutes to propagate
- Try signing in again after waiting

## 🔧 **Alternative: Use Different Port**

If you prefer to avoid updating Google Cloud Console, you can:

1. **Run on port 3000** (current setup):
   ```bash
   npm run dev
   ```

2. **Run on port 3001** (requires Google Cloud Console update):
   ```bash
   PORT=3001 npm run dev
   ```

## 🧪 **Test OAuth Configuration**

You can test your OAuth setup by visiting:
- **Sign-in page**: `http://localhost:3000/auth/signin`
- **OAuth test**: `http://localhost:3000/api/test-oauth`

## 📋 **Current Environment Variables**
```
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=Set ✅
GOOGLE_CLIENT_SECRET=Set ✅
NEXTAUTH_SECRET=Set ✅
```

## 🚨 **Common Issues**

1. **"redirect_uri_mismatch"**: Google Cloud Console callback URL doesn't match
2. **"invalid_client"**: Wrong client ID or secret
3. **"access_denied"**: OAuth consent screen not configured
4. **"invalid_request"**: Missing required parameters

## 📞 **Need Help?**

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify all URLs in Google Cloud Console match exactly
3. Make sure your app is in "Testing" mode if you haven't verified it yet
4. Try clearing browser cache and cookies

---

**Last Updated**: September 10, 2025  
**Status**: Ready for Google Cloud Console configuration



