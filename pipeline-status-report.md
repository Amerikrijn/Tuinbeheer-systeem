# 🏦 Pipeline Status Report

## 📊 Overall Status
🚨 **Pipeline**: 🔴 CRITICAL ISSUES
📈 **Test Success Rate**: 78.6%
🧪 **Total Tests**: 1464
✅ **Passed**: 1151
❌ **Failed**: 313

## 🎯 Priority Breakdown
🔥 **Critical Issues**: 20 test suites
⚠️ **High Priority**: 12 test suites  
🔧 **Medium Priority**: 15 test suites

## 🚨 Critical Issues (Direct Fixen)
- ❌ __tests__/unit/api/gardens-simple.test.ts: 3 failures
- ❌ __tests__/unit/api/plant-beds-simple.test.ts: 3 failures
- ❌ __tests__/unit/api/storage-ensure-bucket-simple.test.ts: 3 failures
- ❌ __tests__/unit/app/error.test.tsx: 11 failures
- ❌ __tests__/unit/app/global-error.test.tsx: 15 failures
- ❌ __tests__/unit/app/not-found.test.tsx: 6 failures
- ❌ __tests__/unit/lib/api-auth-wrapper.test.ts: 8 failures
- ❌ __tests__/unit/lib/database.test.ts: 14 failures
- ❌ __tests__/integration/api/admin-users.test.ts: 1 failures
- ❌ __tests__/integration/api/gardens.test.ts: 4 failures
- ❌ __tests__/integration/api/plant-beds.test.ts: 1 failures
- ❌ __tests__/unit/components/navigation.test.tsx: 2 failures
- ❌ __tests__/unit/components/plant-photo-gallery.test.tsx: 12 failures
- ❌ __tests__/unit/components/theme-toggle.test.tsx: 16 failures
- ❌ __tests__/unit/lib/services/task.service.test.ts: 8 failures
- ❌ __tests__/unit/components/ui/label.test.tsx: 4 failures
- ❌ __tests__/unit/components/ui/toggle-group.test.tsx: 16 failures
- ❌ __tests__/unit/components/ui/use-toast.test.ts: 1 failures
- ❌ __tests__/unit/app/api/gardens/route.test.ts: 1 failures
- ❌ __tests__/unit/app/api/plant-beds/route.test.ts: 1 failures

## ⚠️ High Priority Issues (Binnen 1 Week)
- ⚠️ __tests__/unit/components/ui/separator.test.tsx: 11 failures (8.3% success)
- ⚠️ __tests__/unit/components/ui/toggle.test.tsx: 7 failures (12.5% success)
- ⚠️ __tests__/unit/components/ui/radio-group.test.tsx: 18 failures (18.2% success)
- ⚠️ __tests__/unit/components/ui/resizable.test.tsx: 8 failures (20.0% success)
- ⚠️ __tests__/unit/components/ui/switch.test.tsx: 4 failures (20.0% success)
- ⚠️ __tests__/unit/lib/logger.test.ts: 20 failures (23.1% success)
- ⚠️ __tests__/unit/components/ui/avatar.test.tsx: 10 failures (28.6% success)
- ⚠️ __tests__/unit/components/ui/input-otp.test.tsx: 19 failures (29.6% success)
- ⚠️ __tests__/unit/lib/storage.test.ts: 11 failures (31.3% success)
- ⚠️ __tests__/unit/components/ui/accordion.test.tsx: 8 failures (33.3% success)
- ⚠️ __tests__/unit/components/ui/aspect-ratio.test.tsx: 2 failures (33.3% success)
- ⚠️ __tests__/unit/components/ui/tabs.test.tsx: 18 failures (33.3% success)

## 🔧 Medium Priority Issues (Binnen 2 Weken)
- 🔧 __tests__/components/theme-toggle.test.tsx: 1 failures (50.0% success)
- 🔧 __tests__/unit/api/health.test.ts: 2 failures (60.0% success)
- 🔧 __tests__/unit/lib/password-change-manager.test.ts: 2 failures (60.0% success)
- 🔧 __tests__/components/ui/pagination.test.tsx: 14 failures (61.1% success)
- 🔧 __tests__/unit/lib/version.test.ts: 4 failures (66.7% success)
- 🔧 __tests__/components/ui/breadcrumb.test.tsx: 10 failures (74.4% success)
- 🔧 __tests__/unit/lib/banking-security.test.ts: 2 failures (75.0% success)
- 🔧 __tests__/integration/api/health.test.ts: 1 failures (75.0% success)
- 🔧 __tests__/unit/components/real-components.test.tsx: 1 failures (75.0% success)
- 🔧 __tests__/components/ui/tabs.test.tsx: 3 failures (82.4% success)
- 🔧 __tests__/unit/components/ui/checkbox.test.tsx: 1 failures (87.5% success)
- 🔧 __tests__/components/ui/switch.test.tsx: 1 failures (88.9% success)
- 🔧 __tests__/unit/lib/services/database.service.test.ts: 2 failures (89.5% success)
- 🔧 __tests__/unit/lib/scaling-constants.test.ts: 2 failures (92.0% success)
- 🔧 __tests__/components/ui/navigation-menu.test.tsx: 1 failures (95.7% success)

## 🎯 Onverwachte Successes (Controleren)
- ⚠️ __tests__/components/LoginForm.test.tsx: 13 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/hooks/use-supabase-auth.test.ts: 14 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/lib/banking-security.test.ts: 13 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/components/ui/alert.test.tsx: 19 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/components/ui/button.test.tsx: 17 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/components/ui/card.test.tsx: 27 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/components/ui/table.test.tsx: 27 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/api/status.test.ts: 7 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/api/version.test.ts: 5 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/app/simple-app.test.tsx: 11 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/lib/design-tokens.test.ts: 38 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/lib/dutch-flowers.test.ts: 27 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/lib/errors.test.ts: 26 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/lib/full-translations.test.ts: 20 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/lib/simple-lib.test.ts: 16 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/lib/translations.test.ts: 15 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/lib/validation.test.ts: 17 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/integration/api/change-password.test.ts: 4 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/integration/api/status.test.ts: 4 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/integration/api/version.test.ts: 2 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/components/error-boundary.test.tsx: 11 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/components/loading-skeleton.test.tsx: 12 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/lib/security/garden-access.test.ts: 33 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/lib/services/simple-services.test.ts: 11 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/lib/types/index.test.ts: 23 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/lib/types/tasks.test.ts: 27 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/lib/validation/index.test.ts: 36 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/components/ui/card.test.tsx: 16 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/components/ui/input.test.tsx: 33 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/components/ui/select.test.tsx: 38 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/components/ui/simple-components.test.tsx: 16 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/components/ui/simple-pages.test.tsx: 36 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/components/ui/table.test.tsx: 41 tests - mogelijk te oppervlakkig
- ⚠️ __tests__/unit/components/ui/textarea.test.tsx: 40 tests - mogelijk te oppervlakkig

## 📈 Success Rate per Category
- **UI Components**: 582/738 tests (78.9% success)
- **Hooks**: 30/30 tests (100.0% success)
- **Unit Tests**: 470/619 tests (75.9% success)
- **Integration Tests**: 13/20 tests (65.0% success)
- **Core Components**: 21/22 tests (95.5% success)
- **Other**: 35/35 tests (100.0% success)

## 🚀 Actie Plan
1. **Week 1**: Fix 20 kritieke issues
2. **Week 2**: Fix 12 hoge prioriteit issues  
3. **Week 3**: Fix 15 matige prioriteit issues
4. **Week 4**: Optimalisatie en coverage verbetering

## 💡 Aanbevelingen
- Focus eerst op kritieke failures (20 test suites)
- Dan op hoge prioriteit failures (12 test suites)
- Dit verhoogt success rate van 78.6% naar >95%

---
*Generated: 22-8-2025, 12:02:18*
*Pipeline: Traditional Banking Tests - Complete Coverage*