const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// All routes to test
const routes = [
  // Main routes
  '/',
  '/gardens',
  '/gardens/new',
  '/plant-beds',
  '/plant-beds/new',
  '/plant-beds/add-plant',
  '/plant-beds/layout',
  '/plant-beds/popular-flowers',
  '/visual-garden-demo',
  
  // Admin routes
  '/admin',
  '/admin/garden',
  '/admin/plant-beds',
  '/admin/plant-beds/new',
  '/admin/plant-beds/configure',
  '/admin/plant-beds/layout',
  
  // API routes
  '/api/gardens',
  '/api/plant-beds',
];

// Dynamic routes to test with sample data
const dynamicRoutes = [
  // Will be populated after getting sample data
];

async function testRoutes() {
  console.log('🧪 Testing all routes for 404 errors...\n');
  
  const results = {
    working: [],
    notFound: [],
    error: [],
    shouldBeRemoved: []
  };
  
  // Routes that should be removed (none currently)
  const toRemove = [];
  
  for (const route of routes) {
    try {
      console.log(`Testing: ${route}`);
      
      const response = await axios.get(`${BASE_URL}${route}`, {
        timeout: 10000,
        validateStatus: (status) => status < 500 // Don't throw on 404
      });
      
      if (response.status === 200) {
        if (toRemove.includes(route)) {
          results.shouldBeRemoved.push(route);
          console.log(`  ⚠️  Status: ${response.status} - SHOULD BE REMOVED`);
        } else {
          results.working.push(route);
          console.log(`  ✅ Status: ${response.status} - OK`);
        }
      } else if (response.status === 404) {
        results.notFound.push(route);
        console.log(`  ❌ Status: ${response.status} - NOT FOUND`);
      } else {
        results.error.push({ route, status: response.status });
        console.log(`  ⚠️  Status: ${response.status} - ERROR`);
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`  💀 ECONNREFUSED - Server not running`);
        console.log('\n❌ Development server not running! Start with: npm run dev\n');
        return;
      }
      
      results.error.push({ route, error: error.message });
      console.log(`  💥 ERROR: ${error.message}`);
    }
    
    // Small delay to prevent overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Test dynamic routes with sample data
  console.log('\n🔍 Testing dynamic routes with sample data...');
  
  try {
    // Get sample garden ID
    const gardensResponse = await axios.get(`${BASE_URL}/api/gardens`);
    if (gardensResponse.status === 200 && gardensResponse.data.length > 0) {
      const sampleGardenId = gardensResponse.data[0].id;
      
      // Get sample plant-bed data
      const plantBedsResponse = await axios.get(`${BASE_URL}/api/plant-beds`);
      const samplePlantBedId = plantBedsResponse.status === 200 && plantBedsResponse.data.length > 0 
        ? plantBedsResponse.data[0].id : 'sample-bed-id';
      
      const dynamicRoutesToTest = [
        // Garden routes
        `/gardens/${sampleGardenId}`,
        `/gardens/${sampleGardenId}/plant-beds`,
        `/gardens/${sampleGardenId}/plant-beds/new`,
        `/gardens/${sampleGardenId}/plantvak-view`,
        
        // Plant-bed routes
        `/plant-beds/${samplePlantBedId}`,
        `/plant-beds/${samplePlantBedId}/layout`,
        `/plant-beds/${samplePlantBedId}/plants`,
        `/plant-beds/${samplePlantBedId}/plants/new`,
        
        // Admin routes
        `/admin/plant-beds/configure`,
        `/admin/plant-beds/${samplePlantBedId}`,
        `/admin/plant-beds/${samplePlantBedId}/add-plant`,
        `/admin/plant-beds/${samplePlantBedId}/edit`,
        
        // API routes
        `/api/gardens/${sampleGardenId}/canvas-config`,
        `/api/gardens/${sampleGardenId}/plant-beds`,
        `/api/gardens/${sampleGardenId}/plant-beds/positions`,
        `/api/plant-beds/${samplePlantBedId}/position`,
      ];
      
      for (const route of dynamicRoutesToTest) {
        try {
          console.log(`Testing dynamic: ${route}`);
          const response = await axios.get(`${BASE_URL}${route}`, {
            timeout: 10000,
            validateStatus: (status) => status < 500
          });
          
          if (response.status === 200) {
            results.working.push(route);
            console.log(`  ✅ Status: ${response.status} - OK`);
          } else if (response.status === 404) {
            results.notFound.push(route);
            console.log(`  ❌ Status: ${response.status} - NOT FOUND`);
          } else {
            results.error.push({ route, status: response.status });
            console.log(`  ⚠️  Status: ${response.status} - ERROR`);
          }
        } catch (error) {
          results.error.push({ route, error: error.message });
          console.log(`  💥 ERROR: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  } catch (error) {
    console.log('⚠️  Could not test dynamic routes:', error.message);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ROUTE TESTING SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Working routes (${results.working.length}):`);
  results.working.forEach(route => console.log(`  - ${route}`));
  
  console.log(`\n❌ 404 Not Found (${results.notFound.length}):`);
  results.notFound.forEach(route => console.log(`  - ${route}`));
  
  console.log(`\n⚠️  Should be removed (${results.shouldBeRemoved.length}):`);
  results.shouldBeRemoved.forEach(route => console.log(`  - ${route}`));
  
  console.log(`\n💥 Error routes (${results.error.length}):`);
  results.error.forEach(item => {
    if (typeof item === 'string') {
      console.log(`  - ${item}`);
    } else {
      console.log(`  - ${item.route}: ${item.status || item.error}`);
    }
  });
  
  console.log('\n🎯 STATUS:');
  if (results.notFound.length === 0 && results.error.length === 0) {
    console.log('✅ All routes are working correctly! No 404 errors found.');
  } else {
    console.log('⚠️  Issues found that need attention:');
    if (results.notFound.length > 0) {
      console.log('- Fix 404 routes for core functionality');
    }
    if (results.error.length > 0) {
      console.log('- Fix error routes');
    }
  }
  
  return results;
}

// Run the test
if (require.main === module) {
  testRoutes()
    .then((results) => {
      console.log('\n🎉 Route testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Route testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testRoutes };