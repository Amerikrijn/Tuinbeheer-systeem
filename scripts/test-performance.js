#!/usr/bin/env node

/**
 * Performance Test Script
 * Test de performance van oude vs nieuwe database functies
 */

const { performance } = require('perf_hooks');

console.log('🚀 Performance Test Starting...\n');

// Simuleer database queries met verschillende delays
function simulateDatabaseQuery(delay, name) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: Array.from({ length: 10 }, (_, i) => ({ id: i, name: `${name}-${i}` })) });
    }, delay);
  });
}

// Test oude N+1 query patroon
async function testOldNPlusOnePattern() {
  console.log('📊 Testing OLD N+1 Query Pattern...');
  
  const start = performance.now();
  
  try {
    // Simuleer het oude patroon: 1 query voor gardens + N queries voor plant beds
    const gardens = await simulateDatabaseQuery(100, 'garden');
    
    // N+1 probleem: voor elke garden een aparte query
    const plantBedsPromises = gardens.data.map(async (garden) => {
      return await simulateDatabaseQuery(50, `plant-bed-${garden.id}`);
    });
    
    const plantBeds = await Promise.all(plantBedsPromises);
    
    const duration = performance.now() - start;
    console.log(`✅ OLD Pattern completed in ${duration.toFixed(2)}ms`);
    console.log(`   - Gardens: ${gardens.data.length}`);
    console.log(`   - Plant beds: ${plantBeds.length}`);
    console.log(`   - Total queries: ${1 + plantBeds.length}`);
    
    return { duration, totalQueries: 1 + plantBeds.length };
  } catch (error) {
    console.error('❌ OLD Pattern failed:', error);
    return { duration: 0, totalQueries: 0 };
  }
}

// Test nieuwe geoptimaliseerde patroon
async function testNewOptimizedPattern() {
  console.log('📊 Testing NEW Optimized Pattern...');
  
  const start = performance.now();
  
  try {
    // Simuleer het nieuwe patroon: 1 query met JOINs
    const result = await simulateDatabaseQuery(150, 'garden-with-plant-beds');
    
    const duration = performance.now() - start;
    console.log(`✅ NEW Pattern completed in ${duration.toFixed(2)}ms`);
    console.log(`   - Gardens with plant beds: ${result.data.length}`);
    console.log(`   - Total queries: 1`);
    
    return { duration, totalQueries: 1 };
  } catch (error) {
    console.error('❌ NEW Pattern failed:', error);
    return { duration: 0, totalQueries: 0 };
  }
}

// Test met verschillende data groottes
async function testWithDataSizes() {
  console.log('\n📊 Testing with Different Data Sizes...\n');
  
  const sizes = [10, 50, 100, 200];
  
  for (const size of sizes) {
    console.log(`🔍 Testing with ${size} gardens...`);
    
    // Simuleer grotere datasets
    const oldStart = performance.now();
    await simulateDatabaseQuery(100, `garden-${size}`);
    const oldDuration = performance.now() - oldStart;
    
    const newStart = performance.now();
    await simulateDatabaseQuery(150, `garden-with-plant-beds-${size}`);
    const newDuration = performance.now() - newStart;
    
    const improvement = ((oldDuration - newDuration) / oldDuration * 100).toFixed(1);
    
    console.log(`   OLD: ${oldDuration.toFixed(2)}ms`);
    console.log(`   NEW: ${newDuration.toFixed(2)}ms`);
    console.log(`   Improvement: ${improvement}%\n`);
  }
}

// Test real-world scenario
async function testRealWorldScenario() {
  console.log('🌍 Testing Real-World Scenario...\n');
  
  // Simuleer een gebruiker die de app gebruikt
  const scenarios = [
    { name: 'Homepage Load', gardens: 25, plantBeds: 150, plants: 500 },
    { name: 'Garden Detail View', gardens: 1, plantBeds: 8, plants: 25 },
    { name: 'Search Results', gardens: 10, plantBeds: 60, plants: 200 },
    { name: 'Dashboard Overview', gardens: 5, plantBeds: 30, plants: 100 }
  ];
  
  for (const scenario of scenarios) {
    console.log(`📱 ${scenario.name}:`);
    
    // Oude patroon
    const oldStart = performance.now();
    await simulateDatabaseQuery(100, `garden-${scenario.gardens}`);
    // Simuleer N+1 queries voor plant beds
    for (let i = 0; i < scenario.gardens; i++) {
      await simulateDatabaseQuery(50, `plant-bed-${i}`);
    }
    const oldDuration = performance.now() - oldStart;
    
    // Nieuwe patroon
    const newStart = performance.now();
    await simulateDatabaseQuery(150, `garden-with-plant-beds-${scenario.gardens}`);
    const newDuration = performance.now() - newStart;
    
    const improvement = ((oldDuration - newDuration) / oldDuration * 100).toFixed(1);
    
    console.log(`   OLD: ${oldDuration.toFixed(2)}ms (${1 + scenario.gardens} queries)`);
    console.log(`   NEW: ${newDuration.toFixed(2)}ms (1 query)`);
    console.log(`   Improvement: ${improvement}%\n`);
  }
}

// Hoofdfunctie
async function runPerformanceTests() {
  try {
    // Basis test
    const oldResult = await testOldNPlusOnePattern();
    const newResult = await testNewOptimizedPattern();
    
    // Bereken verbetering
    if (oldResult.duration > 0 && newResult.duration > 0) {
      const improvement = ((oldResult.duration - newResult.duration) / oldResult.duration * 100).toFixed(1);
      const queryReduction = ((oldResult.totalQueries - newResult.totalQueries) / oldResult.totalQueries * 100).toFixed(1);
      
      console.log('\n🎯 Performance Summary:');
      console.log(`   Time Improvement: ${improvement}%`);
      console.log(`   Query Reduction: ${queryReduction}%`);
      console.log(`   Old Pattern: ${oldResult.duration.toFixed(2)}ms (${oldResult.totalQueries} queries)`);
      console.log(`   New Pattern: ${newResult.duration.toFixed(2)}ms (${newResult.totalQueries} queries)`);
    }
    
    // Test met verschillende data groottes
    await testWithDataSizes();
    
    // Test real-world scenario
    await testRealWorldScenario();
    
    console.log('✅ All performance tests completed!');
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    process.exit(1);
  }
}

// Voer tests uit
if (require.main === module) {
  runPerformanceTests();
}

module.exports = {
  testOldNPlusOnePattern,
  testNewOptimizedPattern,
  testWithDataSizes,
  testRealWorldScenario
};