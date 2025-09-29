# Google OAuth Troubleshooting Guide

## Current Status
✅ Google OAuth provider is configured and available
✅ Server is running on `http://localhost:3001`
✅ Database is properly set up
❌ OAuth signin returning 400 Bad Request

## Root Cause Identified
The issue is that your `NEXTAUTH_URL` environment variable is set to `http://localhost:3000` but the server is running on port 3001. This causes a mismatch in the OAuth callback URLs.

## Quick Fix

### Step 1: Update Environment Variables
In your `.env.local` file, change:
```env
NEXTAUTH_URL=http://localhost:3000
```
to:
```env
NEXTAUTH_URL=http://localhost:3001
```

### Step 2: Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Update the Authorized redirect URIs to include:
   - `http://localhost:3001/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (keep both for flexibility)

### Step 3: Restart the Server
```bash
pkill -f "next" && PORT=3001 npm run dev
```

### Step 4: Test OAuth
1. Visit `http://localhost:3001/auth/signin`
2. Click "Sign in with Google"
3. You should be redirected to Google's OAuth page

## Alternative Solution: Use Port 3000
If you prefer to use port 3000 instead:

1. Update `.env.local`:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   ```

2. Start server on port 3000:
   ```bash
   npm run dev
   ```

3. Make sure Google Cloud Console has:
   - `http://localhost:3000/api/auth/callback/google`

## Debugging Commands

### Check OAuth Configuration
```bash
curl -s http://localhost:3001/api/test-oauth
```

### Check Available Providers
```bash
curl -s http://localhost:3001/api/auth/providers
```

### Test OAuth Signin URL
```bash
curl -I http://localhost:3001/api/auth/signin/google
```

## Common Issues and Solutions

### 1. Callback URL Mismatch
**Error**: 400 Bad Request when clicking "Sign in with Google"
**Solution**: Ensure `NEXTAUTH_URL` matches the port your server is running on

### 2. Google Cloud Console Configuration
**Error**: OAuth consent screen errors
**Solution**: 
1. Go to OAuth consent screen
2. Add your email as a test user
3. Ensure scopes include: `email`, `profile`, `openid`

### 3. Environment Variables
**Error**: OAuth providers not showing
**Solution**: Check that `.env.local` contains:
```env
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret
```

### 4. Database Issues
**Error**: Prisma errors during OAuth
**Solution**: Reset database:
```bash
npx prisma migrate reset --force
```

## Testing Steps

1. **Check Environment**: `curl -s http://localhost:3001/api/test-oauth`
2. **Check Providers**: `curl -s http://localhost:3001/api/auth/providers`
3. **Test Signin**: Visit `http://localhost:3001/auth/signin`
4. **Test OAuth**: Click "Sign in with Google"

## If Still Not Working

1. **Clear Browser Cache**: Try in incognito mode
2. **Check Server Logs**: Look for NextAuth error messages
3. **Verify Google Console**: Ensure callback URLs are exactly correct
4. **Test with Different Port**: Try port 3000 instead of 3001

## Success Indicators

✅ OAuth signin URL returns 302 redirect (not 400)
✅ Google OAuth page loads when clicking "Sign in with Google"
✅ After authorization, you're redirected back to your app
✅ User session is created successfully

## Next Steps
Once OAuth is working:
1. Test the complete sign-in flow
2. Verify user data is saved to database
3. Test sign-out functionality
4. Test with different Google accounts