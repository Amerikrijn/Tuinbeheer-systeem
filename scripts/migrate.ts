#!/usr/bin/env tsx

import { runMigration } from "../lib/run-migration"

async function main() {
  console.log("🌱 Gardening Volunteer App - Database Migration")
  console.log("=".repeat(50))

  const success = await runMigration()

  if (success) {
    console.log("\n✅ Migration completed successfully!")
    console.log("🎯 Next steps:")
    console.log("   1. Check your Supabase dashboard")
    console.log("   2. Test the garden creation form")
    console.log("   3. Add more plant beds and plants")
    process.exit(0)
  } else {
    console.log("\n❌ Migration failed!")
    console.log("🔧 Please check the error messages above")
    process.exit(1)
  }
}

main().catch(console.error)
