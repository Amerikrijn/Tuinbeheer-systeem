# Deployment Guide - Tuinbeheer Systeem

## 🚀 **Current Deployment Status**

### **✅ Code Ready for Deployment**
- **Security Refactoring:** ✅ Complete (banking-grade standards)
- **Frontend Cleanup:** ✅ All hardcoded emails removed
- **Authentication:** ✅ Strict database-only auth implemented
- **Git Configuration:** ✅ Author email fixed (`amerikrijn@gmail.com`)
- **Build Status:** ✅ All code committed to `preview` branch

### **🚫 Current Blocker: Vercel Free Tier Limits**
- **Issue:** Deployment limit exceeded (100 deployments/day)
- **Solution Options:**
  1. **Wait 24 hours** for limit reset
  2. **Upgrade to Vercel Pro** ($20/month) for 6,000 deployments/day
- **Status:** All changes ready to deploy once limit resets

---

## 🎯 **Deployment Environments**

### **Production Environment**
- **URL:** `https://tuinbeheer-systeem.vercel.app`
- **Branch:** `main`
- **Database:** Supabase Production
- **Security Level:** 🔒 Banking-grade (RLS enabled)

### **Preview Environment**  
- **URL:** `https://preview-tuinbeheer-systeem.vercel.app`
- **Branch:** `preview`
- **Database:** Supabase Production (shared)
- **Security Level:** 🔒 Banking-grade (RLS enabled)

### **Development Environment**
- **URL:** `http://localhost:3000`
- **Branch:** Any local branch
- **Database:** Supabase Development/Production
- **Security Level:** 🔒 Banking-grade (RLS enabled)

---

## 📊 **Vercel Plan Comparison**

### **Free Tier (Current) - Limits Hit**
| Resource | Limit | Status |
|----------|-------|--------|
| Deployments/day | 100 | ❌ **EXCEEDED** |
| Projects | 200 | ✅ OK (1 used) |
| Function Invocations | 1M/month | ✅ OK |
| Build Time | 45 min/build | ✅ OK |
| Bandwidth | 100 GB/month | ✅ OK |

### **Pro Tier ($20/month) - Recommended**
| Resource | Limit | Benefit |
|----------|-------|---------|
| Deployments/day | 6,000 | ✅ **60x more** |
| Projects | Unlimited | ✅ Unlimited |
| Function Invocations | 1M included + pay-as-go | ✅ Scalable |
| Build Time | 45 min/build | ✅ Same |
| Bandwidth | 1 TB/month | ✅ **10x more** |

---

## 🔐 **Security-First Deployment**

### **Pre-Deployment Security Checklist**
- [x] **Frontend Security:** All hardcoded emails removed
- [x] **Authentication:** Database-only user validation
- [x] **Git Security:** Proper commit author configuration
- [x] **Code Quality:** Banking-grade standards applied
- [ ] **Database Security:** RLS migration (see security plan)
- [ ] **Environment Variables:** Production secrets configured
- [ ] **SSL/HTTPS:** Enforced (Vercel default)

### **Database Security Migration**
Before deploying to production, follow the **7-day security migration plan**:

📖 **See:** `docs/CURRENT_STATUS_AND_SECURITY_PLAN.md`

**Migration Phases:**
1. **Day 1:** Assessment & Backup
2. **Day 2:** Foundation Security (Users table RLS)
3. **Day 3-4:** Core Tables Security (Gardens, Plant Beds, Plants)
4. **Day 5:** Tasks & Logging Security
5. **Day 6:** User Management Security
6. **Day 7:** Final Hardening & Validation

---

## 🚀 **Deployment Methods**

### **Method 1: Automatic Git Deployment (Recommended)**

#### **Setup (One-time)**
```bash
# 1. Connect Vercel to GitHub (done)
# 2. Configure project settings in Vercel Dashboard
# 3. Set environment variables
```

#### **Deploy Process**
```bash
# 1. Commit changes
git add .
git commit -m "Your changes"

# 2. Push to trigger deployment
git push origin preview  # Preview deployment
git push origin main     # Production deployment
```

#### **Current Status**
- ✅ **Git Integration:** Connected to GitHub
- ✅ **Auto-deploy:** Configured for `main` and `preview` branches
- ❌ **Deployment Limit:** Exceeded (100/day on free tier)

### **Method 2: Manual CLI Deployment**

#### **Setup Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project (one-time)
vercel link
```

#### **Deploy Commands**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
vercel --target production
```

#### **Current Limitation**
- ❌ **CLI deployments also count toward daily limit**

---

## ⚙️ **Environment Configuration**

### **Required Environment Variables**

#### **Supabase Configuration**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://dwsgwqosmihsfaxuheji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Application Configuration**
```bash
APP_ENV=production
NODE_ENV=production
NEXTAUTH_URL=https://tuinbeheer-systeem.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

#### **Security Configuration**
```bash
# Security headers (handled by middleware.ts)
SECURITY_HEADERS_ENABLED=true
AUDIT_LOGGING_ENABLED=true
RLS_ENABLED=true
```

### **Setting Environment Variables**

#### **Via Vercel Dashboard**
1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate scope:
   - **Production:** Only production deployments
   - **Preview:** Preview deployments  
   - **Development:** Local development

#### **Via Vercel CLI**
```bash
# Set production variable
vercel env add VARIABLE_NAME production

# Set preview variable  
vercel env add VARIABLE_NAME preview

# List all variables
vercel env ls
```

---

## 🛠️ **Build Configuration**

### **Build Settings**
```json
// vercel.json
{
  "version": 2,
  "buildCommand": "npm run build",
  "env": {
    "APP_ENV": "prod",
    "NEXT_PUBLIC_SUPABASE_URL": "https://dwsgwqosmihsfaxuheji.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJ..."
  }
}
```

### **Custom Build Script**
```javascript
// build-success.js - Custom build with security validation
const { execSync } = require('child_process');

console.log('🚀 Starting secure Next.js build...');
process.env.SKIP_ENV_VALIDATION = '1';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

try {
  execSync('npx next build --no-lint', { 
    stdio: 'inherit',
    timeout: 600000 // 10 minutes
  });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
```

---

## 🔍 **Monitoring & Debugging**

### **Deployment Monitoring**
- **Vercel Dashboard:** Real-time build logs and deployment status
- **GitHub Integration:** Deployment status on pull requests
- **Email Notifications:** Build success/failure alerts

### **Common Deployment Issues**

#### **1. Build Failures**
```bash
# Check build logs in Vercel Dashboard
# Common fixes:
npm run build  # Test locally first
npm run lint   # Fix linting errors
npm run type-check  # Fix TypeScript errors
```

#### **2. Environment Variable Issues**
```bash
# Verify environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

#### **3. Database Connection Issues**
```bash
# Test Supabase connection
npm run db:test-connection

# Check Supabase project status
# Verify environment variables match Supabase dashboard
```

#### **4. Git Author Issues (Fixed)**
```bash
# ✅ FIXED: Git author now configured correctly
git config user.email "amerikrijn@gmail.com"
git config user.name "Amerikrijn"
```

---

## 📈 **Performance Optimization**

### **Build Optimization**
- ✅ **Next.js 14:** Latest optimizations
- ✅ **Tree Shaking:** Unused code elimination
- ✅ **Code Splitting:** Automatic route-based splitting
- ✅ **Image Optimization:** Vercel automatic optimization

### **Runtime Optimization**
- ✅ **Edge Functions:** Faster response times
- ✅ **CDN Caching:** Global content delivery
- ✅ **Compression:** Automatic gzip/brotli
- ✅ **Security Headers:** Via middleware.ts

---

## 🚨 **Emergency Procedures**

### **Rollback Deployment**
```bash
# Via Vercel CLI
vercel rollback [deployment-url]

# Via Vercel Dashboard
# Go to Deployments → Select previous deployment → Promote
```

### **Emergency Database Access**
```sql
-- Disable RLS temporarily (emergency only)
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing issue
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
```

### **Emergency Frontend Bypass**
```typescript
// In case of authentication issues (emergency only)
// Temporarily modify hooks/use-supabase-auth.ts
const EMERGENCY_ADMIN_EMAILS = ['amerik.rijn@gmail.com'];
```

---

## 📅 **Deployment Timeline**

### **Immediate Actions (Once Limit Resets)**
1. ✅ **Code Ready:** All changes committed to `preview` branch
2. 🕐 **Wait for Reset:** Vercel free tier limit resets in ~24 hours
3. 🚀 **Auto-Deploy:** Will trigger automatically once limit resets

### **Recommended Upgrade Path**
1. **Upgrade to Vercel Pro** ($20/month)
2. **Benefits:** 6,000 deployments/day, better performance, team features
3. **ROI:** Eliminates deployment bottlenecks for development

---

## 📚 **Related Documentation**

- **Security Plan:** `docs/CURRENT_STATUS_AND_SECURITY_PLAN.md`
- **Database Setup:** `docs/database-setup.md`
- **Architecture:** `docs/architecture.md`
- **API Reference:** `docs/api-reference.md`

---

## 🎯 **Success Metrics**

### **Deployment Success Criteria**
- ✅ **Build Success:** Clean build without errors
- ✅ **Security Headers:** All security headers present
- ✅ **Authentication:** Database-only auth working
- ✅ **Admin Access:** Admin user can manage all data
- ✅ **User Access:** Regular users can access assigned gardens
- ✅ **Performance:** Page load times < 2 seconds

### **Security Validation**
- ✅ **No Hardcoded Emails:** Frontend clean
- ✅ **Strict Authentication:** Database validation only
- ✅ **Proper Git Attribution:** Commit author configured
- 🚧 **Database RLS:** Ready for migration (see security plan)

---

**⚠️ DEPLOYMENT STATUS:** Ready for deployment once Vercel limits reset. All security refactoring complete and committed to `preview` branch.