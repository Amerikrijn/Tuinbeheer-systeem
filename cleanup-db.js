const { createClient } = require('@supabase/supabase-js');

// Supabase configuratie
const supabaseUrl = 'https://amerikrijn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZXJpa3Jpam4iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM0NzQ5NzI5LCJleHAiOjIwNTAzMjU3Mjl9.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDatabase() {
  try {
    console.log('🧹 Database schoonmaken...');
    
    // Alle plantvakken verwijderen
    const { error } = await supabase
      .from('plant_beds')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Alle records
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Alle plantvakken zijn verwijderd!');
    
    // Controleer of de database leeg is
    const { data, error: countError } = await supabase
      .from('plant_beds')
      .select('id')
      .limit(1);
    
    if (countError) {
      throw countError;
    }
    
    console.log(`📊 Database status: ${data.length} plantvakken over`);
    
  } catch (error) {
    console.error('❌ Fout bij schoonmaken:', error.message);
  }
}

cleanupDatabase();