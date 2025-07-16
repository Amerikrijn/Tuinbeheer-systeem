# 🌿 Supabase Setup Guide

This guide explains how to set up Supabase for the Garden Management System using the simplified single-command approach.

## 🚀 Quick Setup

The setup process has been simplified to a single command:

```bash
npm run setup:supabase
```

This command will:
1. ✅ Check environment configuration
2. ✅ Import database schema from SQL scripts
3. ✅ Set up database tables and data
4. ✅ Run database migrations
5. ✅ Test database connection
6. ✅ Finalize setup

## 📋 Prerequisites

Before running the setup, ensure you have:

1. **Environment file**: `.env.local` with Supabase credentials
2. **Node.js**: Version 18 or later
3. **Dependencies**: Run `npm install` first

## 🔧 Environment Configuration

Create your `.env.local` file:

```bash
cp .env.example .env.local
```

Then update the Supabase credentials in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Test Environment (optional)
NEXT_PUBLIC_SUPABASE_URL_TEST=https://your-test-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST=your-test-anon-key-here

# Application Environment
APP_ENV=development
NODE_ENV=development
```

## 🎯 What the Setup Does

### 1. Environment Validation
- Checks for required environment variables
- Validates Supabase URL and key formats
- Ensures `.env.local` file exists

### 2. Database Schema Import
- Automatically detects the latest SQL scripts version
- Imports all SQL files in the correct order
- Sets up tables, indexes, triggers, and functions

### 3. Data Setup
- Creates initial database structure
- Seeds sample data (if available)
- Configures security policies

### 4. Migration Execution
- Runs any pending database migrations
- Updates schema to latest version
- Handles version upgrades

### 5. Connection Testing
- Tests database connectivity
- Validates API endpoints
- Confirms setup completion

## 🔍 Troubleshooting

### Common Issues

**Environment file not found:**
```bash
cp .env.example .env.local
# Then update the Supabase credentials
```

**Invalid Supabase credentials:**
- Check your Supabase project settings
- Ensure the URL format is correct: `https://project-id.supabase.co`
- Verify the anon key starts with `eyJ`

**Database connection failed:**
- This is normal if the database doesn't exist yet
- The setup will create the database structure

### Manual Setup (if needed)

If the automated setup fails, you can manually:

1. **Create Supabase project** at [supabase.com](https://supabase.com)
2. **Get credentials** from Project Settings → API
3. **Update `.env.local`** with your credentials
4. **Run setup again**: `npm run setup:supabase`

## 📚 Next Steps

After successful setup:

1. **Start development server**: `npm run dev`
2. **Visit the application**: `http://localhost:3000`
3. **Check admin panel**: `http://localhost:3000/admin`
4. **Try visual designer**: `http://localhost:3000/visual-garden-demo`

## 🔄 Updating Setup

To update your database schema:

```bash
npm run setup:supabase
```

The setup script will automatically detect and apply any new SQL scripts or migrations.

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting Guide](../troubleshooting.md)
2. Review the [Environment Setup Guide](environment-setup.md)
3. Check the [Database Setup Guide](database-setup.md)

---

**Note**: The setup process is designed to be idempotent - you can run it multiple times safely.