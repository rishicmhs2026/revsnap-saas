# 🔧 RevSnap Manual Troubleshooting Guide

## 🚀 Quick Health Check

### 1. **Application Status**
```bash
# Check if the app is running
npm run dev

# Check build status
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### 2. **Database Status**
```bash
# Check Prisma connection
npx prisma db push

# View database
npx prisma studio

# Reset database (if needed)
npx prisma db push --force-reset
```

### 3. **Environment Variables**
```bash
# Check if .env.local exists
ls -la .env.local

# Verify Firebase config
cat .env.local | grep FIREBASE
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: Build Failures**

#### **TypeScript Errors**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Common fixes:
# 1. Fix 'any' type warnings
# 2. Add missing dependencies to useEffect
# 3. Fix unused variables
```

#### **Import/Export Errors**
```bash
# Check for missing imports
grep -r "import.*from" src/ | grep "undefined"

# Fix common import issues:
# - Check file paths
# - Verify export statements
# - Update import syntax
```

### **Issue 2: Authentication Problems**

#### **Firebase Auth Issues**
```bash
# Check Firebase config
cat .env.local | grep FIREBASE

# Test Firebase connection
node -e "
const { initializeApp } = require('firebase/app');
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
};
console.log('Firebase config:', config);
"
```

#### **NextAuth Issues**
```bash
# Check NextAuth configuration
cat src/app/api/auth/[...nextauth]/route.ts

# Test OAuth providers
# 1. Verify Google OAuth credentials
# 2. Check callback URLs
# 3. Test in incognito mode
```

### **Issue 3: Database Connection Issues**

#### **Prisma Connection**
```bash
# Check database URL
echo $DATABASE_URL

# Test connection
npx prisma db push

# Reset if corrupted
npx prisma db push --force-reset
```

#### **SQLite Issues**
```bash
# Check if database file exists
ls -la prisma/dev.db

# Recreate database
rm prisma/dev.db
npx prisma db push
```

### **Issue 4: API Endpoint Issues**

#### **Test API Endpoints**
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test authentication
curl http://localhost:3000/api/auth/sessions

# Test pricing analysis
curl -X POST http://localhost:3000/api/analyze-pricing \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

#### **Check API Logs**
```bash
# Monitor API requests
tail -f .next/server.log

# Check for 500 errors
grep "500" .next/server.log
```

### **Issue 5: File Upload Issues**

#### **CSV Upload Problems**
```bash
# Check file size limits
grep -r "maxFileSize" src/

# Test with sample CSV
echo "Product,Price,Category
Widget A,10.99,Electronics
Widget B,15.99,Electronics" > test.csv

# Upload test file
curl -X POST http://localhost:3000/api/analyze-pricing \
  -F "file=@test.csv"
```

#### **Multer Configuration**
```bash
# Check Multer settings
grep -r "multer" src/app/api/

# Verify file types
grep -r "fileFilter" src/
```

---

## 🔍 Advanced Debugging

### **1. Component-Level Debugging**

#### **React Component Issues**
```bash
# Check for console errors
# Open browser dev tools
# Look for:
# - Red error messages
# - Yellow warnings
# - Network failures
```

#### **State Management Issues**
```bash
# Add debug logging
console.log('Component state:', state);
console.log('Props:', props);

# Use React DevTools
# Install: https://chrome.google.com/webstore/detail/react-developer-tools
```

### **2. Performance Issues**

#### **Bundle Size Analysis**
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Check for large dependencies
npm ls --depth=0
```

#### **Memory Leaks**
```bash
# Monitor memory usage
node --inspect npm run dev

# Check for memory leaks in:
# - useEffect cleanup
# - Event listeners
# - WebSocket connections
```

### **3. Network Issues**

#### **CORS Problems**
```bash
# Check CORS configuration
grep -r "cors" src/

# Test cross-origin requests
curl -H "Origin: http://localhost:3000" \
  http://localhost:3000/api/health
```

#### **WebSocket Issues**
```bash
# Test WebSocket connection
wscat -c ws://localhost:3000/api/websocket

# Check WebSocket logs
grep -r "websocket" .next/server.log
```

---

## 🛠️ Manual Testing Checklist

### **Authentication Flow**
- [ ] Sign up with email/password
- [ ] Sign in with existing account
- [ ] Google OAuth (if configured)
- [ ] Password reset functionality
- [ ] Session persistence
- [ ] Logout functionality

### **File Upload & Analysis**
- [ ] Drag & drop CSV upload
- [ ] File validation (size, type)
- [ ] Progress bar display
- [ ] Analysis completion
- [ ] Results display
- [ ] PDF generation
- [ ] Error handling for bad files

### **Dashboard Features**
- [ ] Sidebar navigation
- [ ] User profile display
- [ ] Plan information
- [ ] Real-time data updates
- [ ] Responsive design
- [ ] Mobile compatibility

### **API Endpoints**
- [ ] Health check: `/api/health`
- [ ] Authentication: `/api/auth/*`
- [ ] Pricing analysis: `/api/analyze-pricing`
- [ ] User stats: `/api/user/stats`
- [ ] Export: `/api/export`

---

## 🚨 Emergency Recovery

### **Complete Reset**
```bash
# 1. Stop the application
pkill -f "next dev"

# 2. Clear cache
rm -rf .next
rm -rf node_modules
npm cache clean --force

# 3. Reinstall dependencies
npm install

# 4. Reset database
rm prisma/dev.db
npx prisma db push

# 5. Restart
npm run dev
```

### **Database Recovery**
```bash
# Backup current database
cp prisma/dev.db prisma/dev.db.backup

# Reset to clean state
npx prisma db push --force-reset

# Restore from backup if needed
cp prisma/dev.db.backup prisma/dev.db
```

### **Environment Reset**
```bash
# Backup environment
cp .env.local .env.local.backup

# Reset to defaults
echo "NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_here" > .env.local
```

---

## 📊 Monitoring & Logs

### **Application Logs**
```bash
# Development logs
npm run dev 2>&1 | tee dev.log

# Build logs
npm run build 2>&1 | tee build.log

# Production logs (if deployed)
# Check your hosting platform's logs
```

### **Error Tracking**
```bash
# Check for unhandled errors
grep -r "Error:" .next/
grep -r "Exception:" .next/
grep -r "Failed:" .next/
```

### **Performance Monitoring**
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/

# Monitor memory usage
ps aux | grep node
```

---

## 🎯 Specific Feature Testing

### **Pricing Analysis**
1. Upload sample CSV with product data
2. Verify analysis completes within 5 seconds
3. Check revenue uplift calculations
4. Test PDF generation
5. Verify confidence scoring

### **Enterprise Dashboard**
1. Test sidebar navigation
2. Verify user profile display
3. Check plan-based feature access
4. Test responsive design
5. Verify error boundaries

### **Firebase Integration**
1. Test email/password auth
2. Verify session persistence
3. Check user data storage
4. Test sign out functionality
5. Verify error handling

---

## 📞 Getting Help

### **Documentation**
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### **Community Support**
- [Next.js GitHub](https://github.com/vercel/next.js)
- [Prisma GitHub](https://github.com/prisma/prisma)
- [Firebase GitHub](https://github.com/firebase)

### **Professional Support**
- Enterprise support: enterprise@revsnap.com
- Technical documentation: Available in code comments
- Custom development: Contact development team

---

**Remember**: Always backup your data before making significant changes, and test in a development environment first!
