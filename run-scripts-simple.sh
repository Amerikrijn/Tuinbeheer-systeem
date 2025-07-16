#!/bin/bash

# ===================================================================
# SIMPLE SCRIPT COMBINER
# ===================================================================
# This script combines all SQL files into one file for easy copying
# ===================================================================

echo "🔧 Creating combined SQL script..."

# Create the combined script
cat > combined-setup.sql << 'EOF'
-- ===================================================================
-- COMBINED DATABASE SETUP SCRIPT
-- ===================================================================
-- Copy this entire file and paste it into your Supabase SQL Editor
-- ===================================================================

EOF

# Add cleanup script
echo "-- ===================================================================" >> combined-setup.sql
echo "-- STEP 1: CLEANUP" >> combined-setup.sql
echo "-- ===================================================================" >> combined-setup.sql
cat cleanup-database.sql >> combined-setup.sql

# Add setup script
echo "" >> combined-setup.sql
echo "-- ===================================================================" >> combined-setup.sql
echo "-- STEP 2: SETUP" >> combined-setup.sql
echo "-- ===================================================================" >> combined-setup.sql
cat supabase-sql-scripts/v1.1.0/complete-setup-v1.1.0.sql >> combined-setup.sql

echo "✅ Combined script created: combined-setup.sql"
echo ""
echo "📋 Instructions:"
echo "1. Open your Supabase project dashboard"
echo "2. Go to SQL Editor"
echo "3. Copy the contents of 'combined-setup.sql'"
echo "4. Paste and run the script"
echo ""
echo "🎯 The script will:"
echo "   - Clean up existing database"
echo "   - Create fresh tables matching your diagram"
echo "   - Add sample data"
echo "   - Enable visual garden features"