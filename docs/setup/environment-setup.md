# 🌿 Environment Setup Guide

This guide walks you through setting up the development environment for the Tuinbeheer (Garden Management) System.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (version 18 or later)
- **pnpm** (recommended) or npm
- **Git** (version 2.0 or later)
- **Supabase account** (free tier available)

## 🚀 Quick Setup

### 1. Clone the Repository

```bash
git clone [repository-url]
cd garden-management-system
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local
```

### 4. Configure Supabase

#### Option A: Interactive Setup (Recommended)

```bash
# Run the interactive setup script
# Use Supabase CLI for database setup
```

Follow the prompts to enter your Supabase credentials.

#### Option B: Manual Setup

1. **Create a Supabase Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Choose your organization and enter project details
   - Wait for the project to be created

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy the "Project URL" and "anon/public key"

3. **Update Environment File**
   
   Edit `.env.local` and replace the placeholder values:
   
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

#### Option C: Command Line Setup

```bash
# Direct setup with credentials
# Use Supabase CLI for database setup
```

### 5. Start Development Server

```bash
pnpm run dev
```

Your application should now be running at `http://localhost:3000`

## 🔧 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | Not set |
| `APP_ENV` | Application environment | `development` |
| `NODE_ENV` | Node.js environment | `development` |
| `NEXTAUTH_URL` | Authentication URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Authentication secret | Auto-generated |

### Test Environment Variables

For testing, you can set up separate test environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL_TEST=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST=eyJhbGciOiJIUzI1NiIs...
```

### Production Environment Variables

For production deployment, use environment-specific variables:

```bash
NEXT_PUBLIC_SUPABASE_URL_PROD=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD=eyJhbGciOiJIUzI1NiIs...
```

## 🗄️ Database Setup

### Automatic Setup

The setup script will automatically:
- Create database tables and indexes
- Set up Row Level Security (RLS) policies
- Create database functions and triggers
- Seed sample data

### Manual Database Setup

If you need to run database setup manually:

```bash
# Connect to your Supabase project
psql -h db.your-project-id.supabase.co -U postgres -d postgres

# Run the setup script
\i supabase-sql-scripts/v1.1.0/complete-setup-v1.1.0.sql
```

### Database Schema

The system creates the following main tables:

- **gardens**: Main garden configurations
- **plant_beds**: Individual garden sections with visual positioning
- **plants**: Plant instances within beds
- **Additional tables**: For user management, authentication, etc.

## 🧪 Testing the Setup

### 1. Test Database Connection

```bash
pnpm run test:connection
```

### 2. Test All Routes

```bash
pnpm run test:routes
```

### 3. Verify Visual Garden Designer

1. Open `http://localhost:3000/visual-garden-demo`
2. Try dragging plant beds around
3. Verify changes are saved to the database

## 🔍 Troubleshooting

### Common Issues

#### Connection Errors

**Problem**: "Failed to connect to Supabase"

**Solutions**:
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
pnpm run test:connection

# Verify credentials in Supabase dashboard
```

#### Build Errors

**Problem**: TypeScript or build errors

**Solutions**:
```bash
# Clear cache and rebuild
rm -rf .next
pnpm run build

# Check for type errors
pnpm run type-check
```

#### Permission Errors

**Problem**: Database permission denied

**Solutions**:
1. Verify your Supabase project has RLS policies enabled
2. Check that your anon key has the correct permissions
3. Ensure tables were created with proper access controls

### Environment Issues

#### Missing Environment Variables

**Problem**: "Missing required environment variables"

**Solutions**:
1. Ensure `.env.local` exists and contains required variables
2. Check variable names match exactly (case-sensitive)
3. Restart the development server after changes

#### Invalid URL Format

**Problem**: "Invalid Supabase URL format"

**Solutions**:
1. Ensure URL starts with `https://`
2. Verify URL ends with `.supabase.co`
3. Check for typos in project ID

#### JWT Token Issues

**Problem**: "Invalid Supabase key format"

**Solutions**:
1. Ensure key starts with `eyJ`
2. Copy the entire key without truncation
3. Use the "anon/public" key, not the service role key

## 📱 Development Environment

### Recommended VS Code Extensions

```bash
# Install recommended extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
```

### Git Configuration

```bash
# Set up git hooks
pnpm run prepare

# Configure git user (if not already done)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Development Scripts

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run tests
pnpm run test

# Lint code
pnpm run lint

# Format code
pnpm run format
```

## 🌍 Environment-Specific Setup

### Development Environment

```bash
# .env.local (development)
APP_ENV=development
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
```

### Test Environment

```bash
# .env.test (testing)
APP_ENV=test
NODE_ENV=test
NEXT_PUBLIC_SUPABASE_URL_TEST=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST=your-test-anon-key
```

### Production Environment

```bash
# .env.production (production)
APP_ENV=production
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL_PROD=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD=your-prod-anon-key
```

## 🔒 Security Best Practices

### Environment Variables

1. **Never commit** `.env.local` to version control
2. **Use different** credentials for each environment
3. **Rotate keys** regularly
4. **Keep service role keys** server-side only
5. **Use environment-specific** variables in production

### Supabase Security

1. **Enable RLS** on all tables
2. **Use proper policies** for data access
3. **Regularly audit** permissions
4. **Monitor usage** in Supabase dashboard

## 📞 Getting Help

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Review the logs** in your terminal
3. **Check Supabase dashboard** for database errors
4. **Consult the documentation**:
   - [Developer Guide](../guides/developers/README.md)
   - [Database Setup](database-setup.md)
   - [Troubleshooting](troubleshooting.md)

## 🔄 Next Steps

After completing the environment setup:

1. **Explore the application** at `http://localhost:3000`
2. **Try the Visual Garden Designer** at `/visual-garden-demo`
3. **Read the user guide** for feature overview
4. **Check the developer guide** for technical details
5. **Start developing** your own features

---

✅ **Setup Complete!** Your development environment is now ready for the Tuinbeheer Systeem.