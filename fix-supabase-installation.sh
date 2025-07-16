#!/bin/bash

# ===================================================================
# SUPABASE INSTALLATION FIX SCRIPT
# ===================================================================
# This script provides multiple solutions for Supabase installation issues
# ===================================================================

echo "🔧 Supabase Installation Fix Script"
echo "=================================="

# Check current status
echo ""
echo "📊 Current Status:"
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI is installed"
    supabase --version
else
    echo "❌ Supabase CLI is not installed"
fi

echo ""
echo "🎯 Available Solutions:"
echo "1. Install Supabase CLI and run automatic setup"
echo "2. Use manual SQL import (no CLI required)"
echo "3. Use migration files import (no CLI required)"
echo "4. Exit"

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Option 1: Installing Supabase CLI..."
        
        # Make the installation script executable
        chmod +x install-supabase-cli.sh
        
        # Run the installation script
        if ./install-supabase-cli.sh; then
            echo ""
            echo "🎉 CLI installation successful!"
            echo "Now you can run the automatic setup:"
            echo "   ./run-all-scripts.sh"
        else
            echo ""
            echo "❌ CLI installation failed. Try option 2 or 3 instead."
        fi
        ;;
        
    2)
        echo ""
        echo "📝 Option 2: Manual SQL Import"
        echo "=============================="
        
        # Create the combined SQL file
        if [ -f "run-scripts-simple.sh" ]; then
            chmod +x run-scripts-simple.sh
            ./run-scripts-simple.sh
            
            echo ""
            echo "✅ Combined SQL file created: combined-setup.sql"
            echo ""
            echo "📋 Instructions:"
            echo "1. Open your Supabase project dashboard"
            echo "2. Go to SQL Editor"
            echo "3. Copy the contents of 'combined-setup.sql'"
            echo "4. Paste and run the script"
            echo ""
            echo "📄 The file contains:"
            echo "   - Database cleanup"
            echo "   - Complete table setup"
            echo "   - Sample data"
            echo "   - Visual garden features"
        else
            echo "❌ run-scripts-simple.sh not found"
        fi
        ;;
        
    3)
        echo ""
        echo "📁 Option 3: Migration Files Import"
        echo "=================================="
        
        if [ -d "supabase/migrations" ]; then
            echo "✅ Migration files found"
            echo ""
            echo "📋 Import these files in order:"
            echo "1. 003_extensions_and_base_tables.sql"
            echo "2. 004_indexes_and_triggers.sql"
            echo "3. 005_security_configuration.sql"
            echo "4. 006_sample_data.sql"
            echo "5. 007_visual_garden_columns.sql"
            echo "6. 008_visual_garden_constraints.sql"
            echo "7. 009_visual_garden_triggers.sql"
            echo "8. 010_visual_garden_data_update.sql"
            echo "9. 011_visual_garden_views.sql"
            echo "10. 012_visual_garden_functions.sql"
            echo "11. 013_migration_verification.sql"
            echo ""
            echo "📄 Instructions:"
            echo "1. Open your Supabase project dashboard"
            echo "2. Go to SQL Editor"
            echo "3. Import each file in the order shown above"
            echo "4. Run the verification script last"
        else
            echo "❌ Migration files not found"
        fi
        ;;
        
    4)
        echo "👋 Exiting..."
        exit 0
        ;;
        
    *)
        echo "❌ Invalid option. Please choose 1-4."
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete! Your database should now be ready."