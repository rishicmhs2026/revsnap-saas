# 🔧 Update OAuth Redirect URLs for Port 3001

## Issue
Your NextJS dev server is running on **port 3001**, but your Google OAuth application is configured for **port 3000**. This is causing the OAuth flow to fail.

## 🎯 Quick Fix - Update Google OAuth Configuration

### Step 1: Go to Google Cloud Console
1. Visit: [Google Cloud Console](https://console.cloud.google.com/)
2. Select your **"RevSnap SaaS"** project
3. Go to **"APIs & Services"** → **"Credentials"**

### Step 2: Edit Your OAuth Client
1. Click on your **"RevSnap Web Client"** OAuth 2.0 Client ID
2. Find the **"Authorized redirect URIs"** section

### Step 3: Update Redirect URIs
**Replace these URLs:**
```
❌ http://localhost:3000/api/auth/callback/google
❌ http://127.0.0.1:3000/api/auth/callback/google
```

**With these URLs:**
```
✅ http://localhost:3001/api/auth/callback/google
✅ http://127.0.0.1:3001/api/auth/callback/google
```

### Step 4: Update JavaScript Origins (if present)
**Replace these URLs:**
```
❌ http://localhost:3000
❌ http://127.0.0.1:3000
```

**With these URLs:**
```
✅ http://localhost:3001
✅ http://127.0.0.1:3001
```

### Step 5: Save Changes
1. Click **"SAVE"** at the bottom
2. Wait for the changes to propagate (usually immediate)

---

## 🚀 Alternative: Force NextJS to Use Port 3000

If you prefer to keep OAuth configured for port 3000, you can force NextJS to use that port:

```bash
# Stop current dev server
pkill -f "next dev"

# Start dev server on port 3000
npm run dev -- -p 3000
```

---

## ✅ Test Your OAuth Flow

After updating the redirect URLs:

1. **Go to**: `http://localhost:3001/auth/signin` (or 3000 if you changed the port)
2. **Click**: "Continue with Google"
3. **Expected Result**: Successful OAuth flow without errors

---

## 🔍 Verification

Check that your Google OAuth console shows:
- ✅ **Authorized JavaScript origins**: `http://localhost:3001`
- ✅ **Authorized redirect URIs**: `http://localhost:3001/api/auth/callback/google`