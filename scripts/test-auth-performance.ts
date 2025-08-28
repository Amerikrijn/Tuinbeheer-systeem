#!/usr/bin/env node

/**
 * Authentication Performance Testing Script
 * Tests the improved authentication system with various scenarios
 */

import { createClient } from '@supabase/supabase-js'

// Test configuration
const TEST_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  testEmail: process.env.TEST_EMAIL || 'test@example.com',
  testPassword: process.env.TEST_PASSWORD || 'testpassword123',
  iterations: 10,
  concurrentUsers: 5,
}

// Performance metrics collector
class MetricsCollector {
  private metrics: any[] = []

  addMetric(name: string, duration: number, success: boolean, error?: string) {
    this.metrics.push({
      name,
      duration,
      success,
      error,
      timestamp: new Date().toISOString(),
    })
  }

  getStats() {
    const successful = this.metrics.filter(m => m.success)
    const failed = this.metrics.filter(m => !m.success)
    const durations = successful.map(m => m.duration).sort((a, b) => a - b)

    if (durations.length === 0) {
      return {
        totalTests: this.metrics.length,
        successful: 0,
        failed: failed.length,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        failureRate: 100,
      }
    }

    const p50Index = Math.floor(durations.length * 0.5)
    const p95Index = Math.floor(durations.length * 0.95)
    const p99Index = Math.floor(durations.length * 0.99)

    return {
      totalTests: this.metrics.length,
      successful: successful.length,
      failed: failed.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p50: durations[p50Index] || 0,
      p95: durations[p95Index] || durations[durations.length - 1],
      p99: durations[p99Index] || durations[durations.length - 1],
      failureRate: (failed.length / this.metrics.length) * 100,
      failures: failed.map(f => ({ error: f.error, timestamp: f.timestamp })),
    }
  }
}

// Test scenarios
async function testAuthFlow(supabase: any, email: string, password: string): Promise<{ duration: number; success: boolean; error?: string }> {
  const start = Date.now()
  
  try {
    // Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Get user profile (simulating the loadUserProfile function)
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (profileError) throw profileError

    // Sign out
    await supabase.auth.signOut()

    return {
      duration: Date.now() - start,
      success: true,
    }
  } catch (error: any) {
    return {
      duration: Date.now() - start,
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

async function testConcurrentAuth(supabase: any, users: number): Promise<MetricsCollector> {
  const collector = new MetricsCollector()
  const promises = []

  console.log(`\\n🚀 Testing ${users} concurrent authentication attempts...`)

  for (let i = 0; i < users; i++) {
    const promise = testAuthFlow(
      supabase,
      TEST_CONFIG.testEmail,
      TEST_CONFIG.testPassword
    ).then(result => {
      collector.addMetric(`concurrent_auth_${i}`, result.duration, result.success, result.error)
      console.log(`  User ${i + 1}: ${result.success ? '✅' : '❌'} ${result.duration}ms`)
    })

    promises.push(promise)
  }

  await Promise.all(promises)
  return collector
}

async function testSequentialAuth(supabase: any, iterations: number): Promise<MetricsCollector> {
  const collector = new MetricsCollector()

  console.log(`\\n📊 Testing ${iterations} sequential authentication attempts...`)

  for (let i = 0; i < iterations; i++) {
    const result = await testAuthFlow(
      supabase,
      TEST_CONFIG.testEmail,
      TEST_CONFIG.testPassword
    )

    collector.addMetric(`sequential_auth_${i}`, result.duration, result.success, result.error)
    console.log(`  Attempt ${i + 1}/${iterations}: ${result.success ? '✅' : '❌'} ${result.duration}ms`)

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return collector
}

async function testTimeoutScenario(supabase: any): Promise<void> {
  console.log(`\\n⏱️ Testing timeout scenarios...`)

  // Test with artificially slow query (if possible)
  const start = Date.now()
  
  try {
    // Attempt a complex query that might timeout
    const { data, error } = await Promise.race([
      supabase
        .from('users')
        .select('*')
        .ilike('email', '%test%')
        .order('created_at', { ascending: false })
        .limit(1000),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Simulated timeout')), 5000)
      ),
    ])

    const duration = Date.now() - start
    console.log(`  Complex query: ✅ Completed in ${duration}ms`)
  } catch (error: any) {
    const duration = Date.now() - start
    console.log(`  Complex query: ⏱️ Timeout after ${duration}ms - ${error.message}`)
  }
}

async function runTests() {
  console.log('🧪 Authentication Performance Test Suite')
  console.log('========================================')
  console.log('Configuration:')
  console.log(`  Supabase URL: ${TEST_CONFIG.supabaseUrl}`)
  console.log(`  Test Email: ${TEST_CONFIG.testEmail}`)
  console.log(`  Iterations: ${TEST_CONFIG.iterations}`)
  console.log(`  Concurrent Users: ${TEST_CONFIG.concurrentUsers}`)

  if (!TEST_CONFIG.supabaseUrl || !TEST_CONFIG.supabaseAnonKey) {
    console.error('\\n❌ Missing Supabase configuration. Please set environment variables.')
    process.exit(1)
  }

  // Create Supabase client
  const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseAnonKey)

  // Run test suites
  const sequentialCollector = await testSequentialAuth(supabase, TEST_CONFIG.iterations)
  const concurrentCollector = await testConcurrentAuth(supabase, TEST_CONFIG.concurrentUsers)
  await testTimeoutScenario(supabase)

  // Display results
  console.log('\\n📈 Test Results')
  console.log('================')

  console.log('\\nSequential Authentication:')
  const seqStats = sequentialCollector.getStats()
  console.log(`  Total Tests: ${seqStats.totalTests}`)
  console.log(`  Successful: ${seqStats.successful} (${(100 - seqStats.failureRate).toFixed(1)}%)`)
  console.log(`  Failed: ${seqStats.failed} (${seqStats.failureRate.toFixed(1)}%)`)
  console.log(`  Avg Duration: ${seqStats.avgDuration.toFixed(2)}ms`)
  console.log(`  Min Duration: ${seqStats.minDuration}ms`)
  console.log(`  Max Duration: ${seqStats.maxDuration}ms`)
  console.log(`  P50: ${seqStats.p50.toFixed(2)}ms`)
  console.log(`  P95: ${seqStats.p95.toFixed(2)}ms`)
  console.log(`  P99: ${seqStats.p99.toFixed(2)}ms`)

  console.log('\\nConcurrent Authentication:')
  const concStats = concurrentCollector.getStats()
  console.log(`  Total Tests: ${concStats.totalTests}`)
  console.log(`  Successful: ${concStats.successful} (${(100 - concStats.failureRate).toFixed(1)}%)`)
  console.log(`  Failed: ${concStats.failed} (${concStats.failureRate.toFixed(1)}%)`)
  console.log(`  Avg Duration: ${concStats.avgDuration.toFixed(2)}ms`)
  console.log(`  Min Duration: ${concStats.minDuration}ms`)
  console.log(`  Max Duration: ${concStats.maxDuration}ms`)
  console.log(`  P50: ${concStats.p50.toFixed(2)}ms`)
  console.log(`  P95: ${concStats.p95.toFixed(2)}ms`)
  console.log(`  P99: ${concStats.p99.toFixed(2)}ms`)

  // Performance recommendations
  console.log('\\n💡 Performance Analysis:')
  
  if (seqStats.avgDuration > 3000) {
    console.log('  ⚠️ Average authentication time exceeds 3 seconds')
    console.log('     Recommendation: Check database indexes and network latency')
  } else if (seqStats.avgDuration > 1000) {
    console.log('  ⚠️ Average authentication time exceeds 1 second')
    console.log('     Recommendation: Consider implementing caching')
  } else {
    console.log('  ✅ Authentication performance is good')
  }

  if (seqStats.p95 > 5000) {
    console.log('  ⚠️ P95 latency exceeds 5 seconds')
    console.log('     Recommendation: Investigate slow queries and add monitoring')
  }

  if (seqStats.failureRate > 5) {
    console.log('  🚨 High failure rate detected (>5%)')
    console.log('     Recommendation: Check error logs and implement retry logic')
    if (seqStats.failures.length > 0) {
      console.log('     Recent failures:')
      seqStats.failures.slice(0, 3).forEach(f => {
        console.log(`       - ${f.error}`)
      })
    }
  }

  if (concStats.avgDuration > seqStats.avgDuration * 2) {
    console.log('  ⚠️ Concurrent requests are significantly slower')
    console.log('     Recommendation: Check connection pooling and rate limits')
  }

  console.log('\\n✅ Test suite completed')
}

// Run tests
runTests().catch(error => {
  console.error('\\n❌ Test suite failed:', error)
  process.exit(1)
})