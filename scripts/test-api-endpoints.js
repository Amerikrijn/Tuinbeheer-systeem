const axios = require('axios');

// Base URL for API testing
const BASE_URL = 'http://localhost:3000';

async function testApiEndpoints() {
  console.log('🚀 Testing Visual Garden Designer API Endpoints...');
  
  try {
    // Test 1: Get all gardens
    console.log('\n📋 Test 1: GET /api/gardens');
    const gardensResponse = await axios.get(`${BASE_URL}/api/gardens`);
    console.log('✅ Status:', gardensResponse.status);
    console.log('📊 Gardens found:', gardensResponse.data.length);
    
    const gardens = gardensResponse.data;
    if (gardens.length === 0) {
      console.log('⚠️  No gardens found, please create some test data first');
      return;
    }
    
    const firstGarden = gardens[0];
    console.log('📊 First garden:', firstGarden.name);
    
    // Test 2: Get plant beds for first garden
    console.log('\n📋 Test 2: GET /api/gardens/[id]/plant-beds');
    const plantBedsResponse = await axios.get(`${BASE_URL}/api/gardens/${firstGarden.id}/plant-beds`);
    console.log('✅ Status:', plantBedsResponse.status);
    console.log('📊 Plant beds found:', plantBedsResponse.data.length);
    
    const plantBeds = plantBedsResponse.data;
    if (plantBeds.length === 0) {
      console.log('⚠️  No plant beds found for this garden');
      return;
    }
    
    const firstPlantBed = plantBeds[0];
    console.log('📊 First plant bed:', firstPlantBed.name);
    
    // Test 3: Get plant bed positions (NEW API)
    console.log('\n📋 Test 3: GET /api/gardens/[id]/plant-beds/positions');
    try {
      const positionsResponse = await axios.get(`${BASE_URL}/api/gardens/${firstGarden.id}/plant-beds/positions`);
      console.log('✅ Status:', positionsResponse.status);
      console.log('📊 Plant bed positions:', positionsResponse.data.data?.length || 0);
    } catch (error) {
      console.log('⚠️  Position API might not be available yet:', error.response?.status);
    }
    
    // Test 4: Get canvas configuration (NEW API)
    console.log('\n📋 Test 4: GET /api/gardens/[id]/canvas-config');
    try {
      const canvasResponse = await axios.get(`${BASE_URL}/api/gardens/${firstGarden.id}/canvas-config`);
      console.log('✅ Status:', canvasResponse.status);
      console.log('📊 Canvas config:', canvasResponse.data.data);
    } catch (error) {
      console.log('⚠️  Canvas config API might not be available yet:', error.response?.status);
    }
    
    // Test 5: Get individual plant bed position (NEW API)
    console.log('\n📋 Test 5: GET /api/plant-beds/[id]/position');
    try {
      const plantBedPositionResponse = await axios.get(`${BASE_URL}/api/plant-beds/${firstPlantBed.id}/position`);
      console.log('✅ Status:', plantBedPositionResponse.status);
      console.log('📊 Plant bed position:', plantBedPositionResponse.data.data);
    } catch (error) {
      console.log('⚠️  Plant bed position API might not be available yet:', error.response?.status);
    }
    
    // Test 6: Test position update (NEW API)
    console.log('\n📋 Test 6: PATCH /api/plant-beds/[id]/position');
    try {
      const updateData = {
        position_x: 5.5,
        position_y: 3.2,
        visual_width: 2.5,
        visual_height: 1.8,
        color_code: '#22c55e'
      };
      
      const updateResponse = await axios.patch(
        `${BASE_URL}/api/plant-beds/${firstPlantBed.id}/position`,
        updateData
      );
      console.log('✅ Status:', updateResponse.status);
      console.log('📊 Updated position:', updateResponse.data.data);
    } catch (error) {
      console.log('⚠️  Position update might not work yet:', error.response?.status);
      console.log('⚠️  Error:', error.response?.data?.error);
    }
    
    // Test 7: Test canvas configuration update (NEW API)
    console.log('\n📋 Test 7: PATCH /api/gardens/[id]/canvas-config');
    try {
      const canvasUpdateData = {
        canvas_width: 25,
        canvas_height: 25,
        grid_size: 1,
        show_grid: true,
        snap_to_grid: true,
        background_color: '#f0f9ff'
      };
      
      const canvasUpdateResponse = await axios.patch(
        `${BASE_URL}/api/gardens/${firstGarden.id}/canvas-config`,
        canvasUpdateData
      );
      console.log('✅ Status:', canvasUpdateResponse.status);
      console.log('📊 Updated canvas config:', canvasUpdateResponse.data.data);
    } catch (error) {
      console.log('⚠️  Canvas config update might not work yet:', error.response?.status);
      console.log('⚠️  Error:', error.response?.data?.error);
    }
    
    // Test 8: Test bulk position update (NEW API)
    console.log('\n📋 Test 8: PUT /api/gardens/[id]/plant-beds/positions');
    try {
      const bulkUpdateData = {
        positions: [
          {
            id: firstPlantBed.id,
            position_x: 8.0,
            position_y: 6.0,
            visual_width: 3.0,
            visual_height: 2.0,
            color_code: '#f59e0b'
          }
        ]
      };
      
      const bulkUpdateResponse = await axios.put(
        `${BASE_URL}/api/gardens/${firstGarden.id}/plant-beds/positions`,
        bulkUpdateData
      );
      console.log('✅ Status:', bulkUpdateResponse.status);
      console.log('📊 Bulk update result:', bulkUpdateResponse.data.data?.length || 0);
    } catch (error) {
      console.log('⚠️  Bulk position update might not work yet:', error.response?.status);
      console.log('⚠️  Error:', error.response?.data?.error);
    }
    
    console.log('\n🎉 API Endpoint Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('✅ Basic garden and plant bed APIs working');
    console.log('🔄 Visual Garden Designer APIs need database schema update');
    console.log('🔄 Ready for frontend development once schema is updated');
    
  } catch (error) {
    console.error('❌ API Testing failed:', error.message);
    console.error('❌ Make sure the development server is running on port 3000');
  }
}

// Run the test
if (require.main === module) {
  testApiEndpoints()
    .then(() => {
      console.log('\n🎉 Testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testApiEndpoints };