const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env.test') });

// Database connection configuration
const dbConfig = {
  host: process.env.SUPABASE_DB_HOST || 'db.dwsgwqosmihsfaxuheji.supabase.co',
  port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  user: process.env.SUPABASE_DB_USER || 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'temp_password_123',
  ssl: { rejectUnauthorized: false }
};

async function runMigration() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🚀 Starting Visual Garden Designer Database Migration...');
    
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database');
    
    // Read migration SQL file
    const migrationFile = path.join(__dirname, '../../database/visual-garden-migration.sql');
    const migrationSql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('📄 Migration SQL loaded successfully');
    
    // Execute the migration
    await client.query(migrationSql);
    
    console.log('✅ Migration completed successfully');
    
    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    
    // Check if new columns exist in plant_beds
    const plantBedColumns = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'plant_beds' 
        AND column_name IN ('position_x', 'position_y', 'visual_width', 'visual_height', 'rotation', 'z_index', 'color_code', 'visual_updated_at')
      ORDER BY column_name
    `);
    
    console.log('📊 Plant beds new columns:', plantBedColumns.rows);
    
    // Check if new columns exist in gardens
    const gardenColumns = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'gardens' 
        AND column_name IN ('canvas_width', 'canvas_height', 'grid_size', 'default_zoom', 'show_grid', 'snap_to_grid', 'background_color')
      ORDER BY column_name
    `);
    
    console.log('📊 Gardens new columns:', gardenColumns.rows);
    
    // Check if view exists
    const viewExists = await client.query(`
      SELECT viewname 
      FROM pg_views 
      WHERE viewname = 'visual_garden_data'
    `);
    
    console.log('📊 Visual garden data view exists:', viewExists.rows.length > 0);
    
    // Check if functions exist
    const functionsExist = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_name IN ('check_plant_bed_collision', 'check_canvas_boundaries', 'update_visual_updated_at')
    `);
    
    console.log('📊 Functions created:', functionsExist.rows.map(r => r.routine_name));
    
    // Test the functions
    console.log('\n🧪 Testing functions...');
    
    // Get a sample garden
    const sampleGarden = await client.query('SELECT id FROM gardens LIMIT 1');
    
    if (sampleGarden.rows.length > 0) {
      const gardenId = sampleGarden.rows[0].id;
      
      // Test collision function
      const collisionTest = await client.query(`
        SELECT check_plant_bed_collision(
          $1::UUID,
          '00000000-0000-0000-0000-000000000000'::UUID,
          5::DECIMAL(10,2),
          5::DECIMAL(10,2),
          2::DECIMAL(10,2),
          2::DECIMAL(10,2)
        ) as collision_result
      `, [gardenId]);
      
      console.log('🧪 Collision test result:', collisionTest.rows[0].collision_result);
      
      // Test boundaries function
      const boundariesTest = await client.query(`
        SELECT check_canvas_boundaries(
          $1::UUID,
          5::DECIMAL(10,2),
          5::DECIMAL(10,2),
          2::DECIMAL(10,2),
          2::DECIMAL(10,2)
        ) as boundaries_result
      `, [gardenId]);
      
      console.log('🧪 Boundaries test result:', boundariesTest.rows[0].boundaries_result);
      
      // Update sample data
      console.log('\n📝 Updating sample data...');
      
      const plantBedUpdate = await client.query(`
        UPDATE plant_beds 
        SET 
          position_x = (RANDOM() * 15)::DECIMAL(10,2),
          position_y = (RANDOM() * 15)::DECIMAL(10,2),
          visual_width = GREATEST(COALESCE(size_m2, 2)::DECIMAL(10,2), 1),
          visual_height = GREATEST(COALESCE(size_m2, 2)::DECIMAL(10,2), 1),
          color_code = CASE 
            WHEN LOWER(name) LIKE '%bloem%' THEN '#f59e0b'
            WHEN LOWER(name) LIKE '%groente%' THEN '#22c55e'
            WHEN LOWER(name) LIKE '%fruit%' THEN '#dc2626'
            WHEN LOWER(name) LIKE '%kruid%' THEN '#8b5cf6'
            ELSE '#22c55e'
          END
        WHERE position_x IS NULL OR position_y IS NULL
        RETURNING name, position_x, position_y, visual_width, visual_height, color_code
      `);
      
      console.log('📝 Updated plant beds:', plantBedUpdate.rows.length);
      
      const gardenUpdate = await client.query(`
        UPDATE gardens 
        SET 
          canvas_width = 20,
          canvas_height = 20,
          grid_size = 1,
          default_zoom = 1,
          show_grid = true,
          snap_to_grid = true,
          background_color = '#f8fafc'
        WHERE canvas_width IS NULL
        RETURNING name, canvas_width, canvas_height
      `);
      
      console.log('📝 Updated gardens:', gardenUpdate.rows.length);
      
      // Test the view
      console.log('\n📊 Testing visual garden data view...');
      
      const viewTest = await client.query(`
        SELECT 
          garden_name, 
          canvas_width, 
          canvas_height, 
          plant_bed_name, 
          position_x, 
          position_y, 
          visual_width, 
          visual_height, 
          color_code, 
          plant_count
        FROM visual_garden_data 
        WHERE garden_id = $1
        LIMIT 5
      `, [gardenId]);
      
      console.log('📊 Visual garden data sample:', viewTest.rows);
      
      console.log('\n✅ Migration verification completed successfully!');
      console.log('🎉 Visual Garden Designer database schema is ready!');
      
    } else {
      console.log('⚠️  No gardens found for testing');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };