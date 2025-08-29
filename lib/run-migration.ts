import { supabase } from "./supabase"

export async function runMigration() {
  console.log("🚀 Starting database migration...")

  try {
    // Read and execute the migration SQL
    const migrationSQL = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create gardens table if not exists
      CREATE TABLE IF NOT EXISTS gardens (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          location VARCHAR(500) NOT NULL,
          total_area VARCHAR(100),
          length VARCHAR(50),
          width VARCHAR(50),
          garden_type VARCHAR(100),
          maintenance_level VARCHAR(100),
          soil_condition TEXT,
          watering_system VARCHAR(200),
          established_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          notes TEXT,
          is_active BOOLEAN DEFAULT TRUE
      );

      -- Create plant_beds table if not exists
      CREATE TABLE IF NOT EXISTS plant_beds (
          id VARCHAR(10) PRIMARY KEY,
          garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(500),
          size VARCHAR(100),
          soil_type VARCHAR(200),
          sun_exposure VARCHAR(20) CHECK (sun_exposure IN ('full-sun', 'partial-sun', 'shade')) DEFAULT 'full-sun',
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT TRUE
      );

      -- Create plants table if not exists
      CREATE TABLE IF NOT EXISTS plants (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          plant_bed_id VARCHAR(10) NOT NULL REFERENCES plant_beds(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          scientific_name VARCHAR(255),
          variety VARCHAR(255),
          color VARCHAR(100),
          height DECIMAL(8,2),
          planting_date DATE,
          expected_harvest_date DATE,
          status VARCHAR(20) CHECK (status IN ('healthy', 'needs_attention', 'diseased', 'dead', 'harvested')) DEFAULT 'healthy',
          notes TEXT,
          care_instructions TEXT,
          watering_frequency INTEGER,
          fertilizer_schedule TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Execute the migration
    const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL })

    if (error) {
      console.error("❌ Migration failed:", error)
      throw error
    }

    console.log("✅ Database tables created successfully!")

    // Check if sample data exists
    const { data: existingGardens, error: checkError } = await supabase.from("gardens").select("id").limit(1)

    if (checkError) {
      console.error("❌ Error checking existing data:", checkError)
      return false
    }

    // Insert sample data if no gardens exist
    if (!existingGardens || existingGardens.length === 0) {
      console.log("📝 Inserting sample data...")

      const { data: garden, error: gardenError } = await supabase
        .from("gardens")
        .insert({
          name: "Voorbeeldtuin Amsterdam",
          description: "Een mooie gemeenschapstuin waar vrijwilligers samenkomen om planten en groenten te kweken.",
          location: "Hoofdstraat 123, 1012 AB Amsterdam",
          total_area: "450m²",
          length: "30m",
          width: "15m",
          garden_type: "Gemeenschapstuin",
          maintenance_level: "Gemiddeld onderhoud",
          soil_condition: "Goed gedraineerde, vruchtbare grond met goede organische inhoud.",
          watering_system: "Druppelirrigatie systeem gecombineerd met handmatige bewatering",
          established_date: "2020-03-15",
          notes: "De tuin is verdeeld in meerdere plantvakken met verschillende themas.",
        })
        .select()
        .single()

      if (gardenError) {
        console.error("❌ Error inserting garden:", gardenError)
        throw gardenError
      }

      console.log("🌱 Sample garden created:", garden.name)

      // Insert sample plant beds
      const plantBeds = [
        {
          id: "A1",
          garden_id: garden.id,
          name: "Groentevak Noord",
          location: "Noordkant van de tuin",
          size: "3x4m",
          soil_type: "Kleigrond met compost",
          sun_exposure: "full-sun",
          description: "Hoofdzakelijk voor seizoensgroenten",
        },
        {
          id: "A2",
          garden_id: garden.id,
          name: "Kruidenvak",
          location: "Nabij de ingang",
          size: "2x3m",
          soil_type: "Zandgrond met goede drainage",
          sun_exposure: "partial-sun",
          description: "Verschillende keukenkruiden",
        },
      ]

      const { error: bedError } = await supabase.from("plant_beds").insert(plantBeds)

      if (bedError) {
        console.error("❌ Error inserting plant beds:", bedError)
        throw bedError
      }

      console.log("🌿 Sample plant beds created")

      // Insert sample plants
      const plants = [
        {
          plant_bed_id: "A1",
          name: "Tomaat",
          scientific_name: "Solanum lycopersicum",
          variety: "San Marzano",
          color: "Rood",
          height: 1.5,
          planting_date: "2024-05-15",
          expected_harvest_date: "2024-08-15",
          status: "healthy",
          notes: "Groeit goed, eerste bloemen verschenen",
          care_instructions: "Wekelijks water geven, steunen met stokken",
          watering_frequency: 3,
        },
        {
          plant_bed_id: "A2",
          name: "Basilicum",
          scientific_name: "Ocimum basilicum",
          variety: "Genovese",
          color: "Groen",
          height: 0.25,
          planting_date: "2024-04-10",
          expected_harvest_date: "2024-10-01",
          status: "healthy",
          notes: "Weelderige groei, regelmatig geoogst",
          care_instructions: "Dagelijks water in droge periodes",
          watering_frequency: 1,
        },
      ]

      const { error: plantError } = await supabase.from("plants").insert(plants)

      if (plantError) {
        console.error("❌ Error inserting plants:", plantError)
        throw plantError
      }

      console.log("🌱 Sample plants created")
    } else {
      console.log("📊 Sample data already exists, skipping insertion")
    }

    console.log("🎉 Migration completed successfully!")
    return true
  } catch (error) {
    console.error("💥 Migration failed:", error)
    return false
  }
}
