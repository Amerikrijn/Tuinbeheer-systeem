#!/bin/bash

# ===================================================================
# AUTOMATIC DATABASE SETUP SCRIPT
# ===================================================================
# This script will run all database setup scripts in the correct order
# ===================================================================

set -e  # Exit on any error

echo "🚀 Starting automatic database setup..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Error: Not connected to Supabase project"
    echo "Please run: supabase login"
    exit 1
fi

echo "✅ Environment check passed"

# Function to run a SQL script
run_sql_script() {
    local script_name=$1
    local description=$2
    
    echo "📝 Running: $description"
    echo "   File: $script_name"
    
    if supabase db reset --linked; then
        echo "✅ Successfully ran: $script_name"
    else
        echo "❌ Failed to run: $script_name"
        exit 1
    fi
}

# Function to run SQL content directly
run_sql_content() {
    local content=$1
    local description=$2
    
    echo "📝 Running: $description"
    
    # Create temporary file
    temp_file=$(mktemp)
    echo "$content" > "$temp_file"
    
    if supabase db reset --linked < "$temp_file"; then
        echo "✅ Successfully ran: $description"
    else
        echo "❌ Failed to run: $description"
        rm "$temp_file"
        exit 1
    fi
    
    # Clean up
    rm "$temp_file"
}

echo ""
echo "🧹 Step 1: Cleaning up existing database..."

# Run cleanup script
cleanup_sql=$(cat cleanup-database.sql)
run_sql_content "$cleanup_sql" "Database cleanup"

echo ""
echo "🏗️  Step 2: Setting up fresh database..."

# Run complete setup script
setup_sql=$(cat supabase-sql-scripts/v1.1.0/complete-setup-v1.1.0.sql)
run_sql_content "$setup_sql" "Complete database setup"

echo ""
echo "✅ Database setup completed successfully!"
echo ""
echo "📊 Summary:"
echo "   - All existing tables and functions removed"
echo "   - Fresh database structure created"
echo "   - Sample data inserted"
echo "   - Visual garden features enabled"
echo ""
echo "🎉 Your database is now ready to use!"