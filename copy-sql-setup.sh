#!/bin/bash

# ===================================================================
# SQL SETUP COPY SCRIPT
# ===================================================================
# This script helps you copy the SQL setup content for manual import
# ===================================================================

echo "🔧 Supabase SQL Setup Helper"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "supabase-sql-scripts/v1.1.0/simple-setup.sql" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Choose your setup option:"
echo ""
echo "1. Simple Setup (Recommended) - Core features only"
echo "2. Complete Setup - Includes visual garden features"
echo "3. Show both options"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📝 Simple Setup SQL (Copy this to Supabase SQL Editor):"
        echo "=================================================="
        cat supabase-sql-scripts/v1.1.0/simple-setup.sql
        echo ""
        echo "✅ Copy the above SQL and paste it into your Supabase SQL Editor"
        ;;
    2)
        echo ""
        echo "📝 Complete Setup SQL (Copy this to Supabase SQL Editor):"
        echo "=================================================="
        cat complete-setup-v1.1.0.sql
        echo ""
        echo "✅ Copy the above SQL and paste it into your Supabase SQL Editor"
        ;;
    3)
        echo ""
        echo "📝 Simple Setup SQL (Recommended for most users):"
        echo "=================================================="
        cat supabase-sql-scripts/v1.1.0/simple-setup.sql
        echo ""
        echo "📝 Complete Setup SQL (Includes visual garden features):"
        echo "=================================================="
        cat complete-setup-v1.1.0.sql
        echo ""
        echo "✅ Choose one of the above SQL scripts and paste it into your Supabase SQL Editor"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and choose 1, 2, or 3."
        exit 1
        ;;
esac

echo ""
echo "🎯 Next Steps:"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Paste the SQL content above"
echo "4. Click 'Run' to execute"
echo "5. Verify the setup using the verification commands in INSTALLATION_GUIDE.md"
echo ""
echo "📚 For more help, see INSTALLATION_GUIDE.md"