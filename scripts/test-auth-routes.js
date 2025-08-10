#!/usr/bin/env node

/**
 * AUTHENTICATION ROUTES TEST
 * Banking-grade testing voor auth route consistentie
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 TESTING AUTHENTICATION ROUTES & REDIRECTS')
console.log('=' .repeat(50))

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL'
  console.log(`${status} ${testName}`)
  if (details) {
    console.log(`   📝 ${details}`)
  }
  
  if (passed) {
    testResults.passed++
  } else {
    testResults.failed++
    testResults.errors.push(`${testName}: ${details}`)
  }
}

function testRouteFiles() {
  console.log('🔍 Testing Auth Route Files...')
  
  const routes = [
    'app/auth/login/page.tsx',
    'app/auth/forgot-password/page.tsx', 
    'app/auth/reset-password/page.tsx',
    'app/auth/accept-invitation/page.tsx',
    'app/auth/change-password/page.tsx',
    'app/auth/pending/page.tsx'
  ]
  
  for (const route of routes) {
    try {
      const filePath = path.join(process.cwd(), route)
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        const hasUseClient = content.includes("'use client'")
        const hasDynamic = content.includes('export const dynamic')
        
        logTest(`Route ${route}`, true, `Exists${hasUseClient ? ', use client' : ''}${hasDynamic ? ', dynamic' : ''}`)
      } else {
        logTest(`Route ${route}`, false, 'File missing')
      }
    } catch (error) {
      logTest(`Route ${route}`, false, error.message)
    }
  }
}

function testRedirectConsistency() {
  console.log('🔄 Testing Redirect Consistency...')
  
  try {
    // Check hooks/use-supabase-auth.ts
    if (fs.existsSync('hooks/use-supabase-auth.ts')) {
      const authHookContent = fs.readFileSync('hooks/use-supabase-auth.ts', 'utf8')
      const hasCorrectResetRedirect = authHookContent.includes('/auth/reset-password')
      logTest('Auth Hook Reset Redirect', hasCorrectResetRedirect, '/auth/reset-password')
    }
    
    // Check admin users page
    if (fs.existsSync('app/admin/users/page.tsx')) {
      const adminUsersContent = fs.readFileSync('app/admin/users/page.tsx', 'utf8')
      const hasCorrectInviteRedirect = adminUsersContent.includes('/auth/accept-invitation')
      const hasOldInviteRedirect = adminUsersContent.includes('/auth/accept-invite')
      
      logTest('Admin Users Invite Redirect', hasCorrectInviteRedirect && !hasOldInviteRedirect, 
        hasCorrectInviteRedirect ? '/auth/accept-invitation (correct)' : 'incorrect redirect')
    }
    
    // Check invitation service
    if (fs.existsSync('lib/invitation-service.ts')) {
      const invitationServiceContent = fs.readFileSync('lib/invitation-service.ts', 'utf8')
      const hasConsistentInviteRedirect = invitationServiceContent.includes('/auth/accept-invitation')
      logTest('Invitation Service Redirect', hasConsistentInviteRedirect, '/auth/accept-invitation')
    }
    
    // Check middleware for auth routes
    if (fs.existsSync('middleware.ts')) {
      const middlewareContent = fs.readFileSync('middleware.ts', 'utf8')
      const hasResetPasswordRoute = middlewareContent.includes('/auth/reset-password')
      const hasAcceptInvitationRoute = middlewareContent.includes('/auth/accept-invitation')
      
      logTest('Middleware Reset Route', hasResetPasswordRoute, '/auth/reset-password in public routes')
      logTest('Middleware Accept Route', hasAcceptInvitationRoute, '/auth/accept-invitation in public routes')
    }
    
  } catch (error) {
    logTest('Redirect Consistency Check', false, error.message)
  }
}

function testDuplicateRoutes() {
  console.log('🚫 Testing for Duplicate Routes...')
  
  // Check that old accept-invite route is removed
  const oldAcceptInvitePath = path.join(process.cwd(), 'app/auth/accept-invite')
  const oldRouteExists = fs.existsSync(oldAcceptInvitePath)
  
  logTest('Duplicate accept-invite route removed', !oldRouteExists, 
    oldRouteExists ? 'Old route still exists' : 'Old route properly removed')
}

function testBankingCompliance() {
  console.log('🏦 Testing Banking Standards Compliance...')
  
  const authFiles = [
    'app/auth/reset-password/page.tsx',
    'app/auth/login/page.tsx',
    'hooks/use-supabase-auth.ts'
  ]
  
  for (const file of authFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8')
      
      // Check for hardcoded URLs/credentials
      const hasHardcodedUrls = /https?:\/\/[^"'\s]+\.supabase\.co/.test(content)
      const hasHardcodedKeys = /eyJ[A-Za-z0-9+/=]+/.test(content)
      const usesWindowLocation = content.includes('window.location.origin')
      const usesProcessEnv = content.includes('process.env')
      
      logTest(`${file} - No Hardcoded URLs`, !hasHardcodedUrls, 
        hasHardcodedUrls ? 'Contains hardcoded URLs' : 'Uses dynamic URLs')
      
      logTest(`${file} - No Hardcoded Keys`, !hasHardcodedKeys, 
        hasHardcodedKeys ? 'Contains hardcoded keys' : 'No hardcoded credentials')
    }
  }
}

async function runAllTests() {
  console.log('🚀 RUNNING ALL TESTS')
  console.log('')
  
  testRouteFiles()
  console.log('')
  
  testRedirectConsistency()
  console.log('')
  
  testDuplicateRoutes()
  console.log('')
  
  testBankingCompliance()
  console.log('')
  
  // Final results
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('=' .repeat(50))
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  
  if (testResults.failed === 0) {
    console.log(`📈 Success Rate: 100%`)
  } else {
    console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`)
  }
  
  if (testResults.failed > 0) {
    console.log('')
    console.log('❌ FAILURES:')
    testResults.errors.forEach(error => {
      console.log(`   • ${error}`)
    })
    console.log('')
    console.log('🚨 PREVIEW DEPLOYMENT NOT RECOMMENDED')
    return false
  } else {
    console.log('')
    console.log('🎉 ALL TESTS PASSED!')
    console.log('✅ READY FOR PREVIEW DEPLOYMENT')
    return true
  }
}

// Run tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('💥 Test runner error:', error)
  process.exit(1)
})