# 🚀 Production Deployment Agreements - Where to Implement

## Overview

This document identifies all the places where agreements about going to production can be established in the garden management system. These agreements ensure proper review, approval, and safety checks before deploying to production.

---

## 🔐 1. **Package.json Scripts - Deployment Gates**

### Current Scripts (package.json)
```json
{
  "scripts": {
    "build:prod": "APP_ENV=prod next build",
    "start:prod": "APP_ENV=prod next start",
    "import:prod": "node scripts/import/import-prod-schema.js"
  }
}
```

### **Where to Add Agreements:**
```json
{
  "scripts": {
    "pre-prod-check": "node scripts/deployment/pre-production-checklist.js",
    "prod-approval": "node scripts/deployment/production-approval.js",
    "deploy:prod": "npm run pre-prod-check && npm run prod-approval && npm run build:prod"
  }
}
```

---

## 📋 2. **Pre-Production Checklist Script**

### **File:** `scripts/deployment/pre-production-checklist.js`
**Purpose:** Automated checks before production deployment

```javascript
// Example implementation
const productionChecklist = {
  databaseMigrations: false,
  environmentVariables: false,
  securityChecks: false,
  performanceTests: false,
  backupCompleted: false,
  approvalReceived: false
};

function runPreProductionChecklist() {
  // Check database migrations
  // Verify environment variables
  // Run security tests
  // Performance benchmarks
  // Backup verification
  // Approval status check
}
```

---

## 🎯 3. **GitHub Actions / CI/CD Pipeline**

### **File:** `.github/workflows/production-deployment.yml`
**Purpose:** Automated deployment with approval gates

```yaml
name: Production Deployment

on:
  push:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      approval_required:
        description: 'Require manual approval'
        required: true
        default: 'true'

jobs:
  pre-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Run Pre-Production Checklist
        run: npm run pre-prod-check

  approval:
    needs: pre-checks
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Request Production Approval
        uses: trstringer/manual-approval@v1
        with:
          secret: ${{ github.TOKEN }}
          approvers: team-lead,senior-dev
          minimum-approvals: 2

  deploy:
    needs: approval
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: npm run deploy:prod
```

---

## 📂 4. **Environment Configuration Files**

### **File:** `.env.production`
**Purpose:** Production-specific environment variables with approval tracking

```env
# Production Database
NEXT_PUBLIC_SUPABASE_URL=https://[prod-url].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[prod-key]

# Deployment Approval
DEPLOYMENT_APPROVED_BY=team-lead@company.com
DEPLOYMENT_APPROVED_DATE=2024-01-XX
DEPLOYMENT_TICKET=TICKET-123

# Safety Checks
PRODUCTION_SAFETY_CHECKS_PASSED=true
DATABASE_BACKUP_COMPLETED=true
```

---

## 🗄️ 5. **Database Migration Approvals**

### **File:** `database/migrations/migration-approval.json`
**Purpose:** Track database migration approvals

```json
{
  "migrations": [
    {
      "file": "database_update_bloemen_registratie.sql",
      "approvedBy": "database-admin@company.com",
      "approvedDate": "2024-01-XX",
      "riskLevel": "medium",
      "rollbackPlan": "restore-from-backup.sql",
      "productionApproval": true
    }
  ]
}
```

### **File:** `scripts/database/migration-approval.js`
**Purpose:** Verify migration approvals before production

```javascript
function verifyMigrationApproval(migrationFile) {
  const approvals = require('../../database/migrations/migration-approval.json');
  const migration = approvals.migrations.find(m => m.file === migrationFile);
  
  if (!migration?.productionApproval) {
    throw new Error(`Migration ${migrationFile} not approved for production`);
  }
  
  return migration;
}
```

---

## 📄 6. **Deployment Documentation**

### **File:** `docs/deployment/production-deployment-checklist.md`
**Purpose:** Human-readable deployment checklist

```markdown
# Production Deployment Checklist

## Pre-Deployment (Required Approvals)

- [ ] **Technical Lead Approval** - Architecture review completed
- [ ] **Database Admin Approval** - Migration safety verified
- [ ] **Security Team Approval** - Security scan passed
- [ ] **Product Owner Approval** - Feature acceptance confirmed

## Deployment Steps

1. **Database Migration** (if required)
   - [ ] Backup completed
   - [ ] Migration tested in staging
   - [ ] Rollback plan prepared

2. **Application Deployment**
   - [ ] Environment variables configured
   - [ ] Build successful
   - [ ] Deployment approved

3. **Post-Deployment**
   - [ ] Health checks passed
   - [ ] Monitoring active
   - [ ] Team notified
```

---

## 🔧 7. **Vercel Deployment Configuration**

### **File:** `vercel.json`
**Purpose:** Vercel-specific deployment controls

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DEPLOYMENT_REQUIRES_APPROVAL": "true",
    "PRODUCTION_DEPLOYMENT_HOOK": "https://your-approval-system.com/webhook"
  },
  "functions": {
    "app/api/deploy/approve.js": {
      "maxDuration": 30
    }
  }
}
```

---

## 🚦 8. **API Endpoints for Approval System**

### **File:** `app/api/deploy/approve.js`
**Purpose:** API endpoint for deployment approvals

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { approver, deploymentId, approved } = req.body;

  // Verify approver permissions
  const isAuthorized = await verifyApproverPermissions(approver);
  if (!isAuthorized) {
    return res.status(403).json({ message: 'Unauthorized approver' });
  }

  // Record approval
  await recordDeploymentApproval({
    deploymentId,
    approver,
    approved,
    timestamp: new Date()
  });

  res.status(200).json({ message: 'Approval recorded' });
}
```

---

## 🛡️ 9. **Supabase Row Level Security**

### **File:** `database/security/production-policies.sql`
**Purpose:** Database-level production safety policies

```sql
-- Enable RLS for production
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;

-- Create deployment approval policy
CREATE TABLE deployment_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id VARCHAR(100) NOT NULL,
  approver_email VARCHAR(255) NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approval_type VARCHAR(50) NOT NULL, -- 'database', 'application', 'security'
  approved BOOLEAN DEFAULT FALSE
);

-- Policy: Only approved deployments can modify production data
CREATE POLICY "production_modification_policy" ON plants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deployment_approvals 
      WHERE deployment_id = current_setting('app.deployment_id')
      AND approved = TRUE
    )
  );
```

---

## 📊 10. **Monitoring and Alerting**

### **File:** `lib/monitoring/production-alerts.js`
**Purpose:** Alert system for production deployments

```javascript
export async function sendProductionDeploymentAlert(deployment) {
  const alert = {
    type: 'production_deployment',
    status: deployment.approved ? 'approved' : 'pending',
    approvers: deployment.approvers,
    timestamp: new Date(),
    deploymentId: deployment.id
  };

  // Send to monitoring system
  await sendToMonitoring(alert);
  
  // Send team notifications
  await notifyTeam(alert);
}
```

---

## 🔄 11. **Rollback Agreements**

### **File:** `scripts/deployment/rollback-agreements.js`
**Purpose:** Define rollback procedures and approvals

```javascript
const rollbackAgreements = {
  automaticRollback: {
    enabled: true,
    triggers: ['high_error_rate', 'database_failure'],
    approvalRequired: false
  },
  manualRollback: {
    enabled: true,
    approvers: ['technical-lead', 'database-admin'],
    minimumApprovals: 1
  }
};

export function canRollback(reason, approver) {
  if (rollbackAgreements.automaticRollback.triggers.includes(reason)) {
    return true;
  }
  
  return rollbackAgreements.manualRollback.approvers.includes(approver);
}
```

---

## 🎯 **Implementation Priority**

### **Phase 1: Immediate (High Priority)**
1. **Pre-production checklist script** (`scripts/deployment/pre-production-checklist.js`)
2. **Production deployment documentation** (`docs/deployment/production-deployment-checklist.md`)
3. **Environment-specific configurations** (`.env.production`)

### **Phase 2: Medium Priority**
1. **GitHub Actions workflow** (`.github/workflows/production-deployment.yml`)
2. **Database migration approvals** (`database/migrations/migration-approval.json`)
3. **API approval endpoints** (`app/api/deploy/approve.js`)

### **Phase 3: Advanced (Long-term)**
1. **Supabase RLS policies** (`database/security/production-policies.sql`)
2. **Monitoring and alerting** (`lib/monitoring/production-alerts.js`)
3. **Rollback procedures** (`scripts/deployment/rollback-agreements.js`)

---

## 📝 **Summary**

You can implement production deployment agreements in **11 different locations** in your codebase:

1. **Package.json scripts** - Deployment gates and approval checks
2. **Pre-production checklist** - Automated verification
3. **GitHub Actions** - CI/CD pipeline approvals
4. **Environment files** - Configuration approvals
5. **Database migrations** - Schema change approvals
6. **Documentation** - Human-readable checklists
7. **Vercel configuration** - Platform-specific controls
8. **API endpoints** - Approval system integration
9. **Database policies** - Row-level security
10. **Monitoring systems** - Alert and notification
11. **Rollback procedures** - Emergency response

**Recommended starting point:** Begin with the pre-production checklist script and documentation, then gradually implement the more advanced approval systems.