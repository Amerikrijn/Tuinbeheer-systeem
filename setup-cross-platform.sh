#!/bin/bash

echo "🌱 Setting up Tuinbeheer Systeem Cross-Platform Monorepo..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) found"

# Install root dependencies
print_status "Installing root dependencies..."
npm install

# Build shared package first
print_status "Building shared package..."
cd packages/shared
npm install
npm run build
cd ../..

print_success "Shared package built successfully"

# Setup web app
print_status "Setting up web application..."
cd apps/web
npm install

# Create .env.local template for web
if [ ! -f .env.local ]; then
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Optional: Environment
NODE_ENV=development
EOF
    print_warning "Created .env.local template for web app. Please update with your Supabase credentials."
fi

cd ../..
print_success "Web app setup complete"

# Setup mobile app
print_status "Setting up mobile application..."
cd apps/mobile
npm install

# Create .env.local template for mobile
if [ ! -f .env.local ]; then
    cat > .env.local << EOF
# Supabase Configuration for Expo
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url-here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
EOF
    print_warning "Created .env.local template for mobile app. Please update with your Supabase credentials."
fi

cd ../..
print_success "Mobile app setup complete"

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    print_warning "Expo CLI not found. Installing globally..."
    npm install -g @expo/cli
    print_success "Expo CLI installed"
else
    print_success "Expo CLI found: $(expo --version)"
fi

# Create launch scripts
print_status "Creating launch scripts..."

# Web launch script
cat > launch-web.sh << 'EOF'
#!/bin/bash
echo "🌐 Starting Tuinbeheer Web App..."
cd apps/web
npm run dev
EOF
chmod +x launch-web.sh

# Mobile launch script
cat > launch-mobile.sh << 'EOF'
#!/bin/bash
echo "📱 Starting Tuinbeheer Mobile App..."
cd apps/mobile
npm start
EOF
chmod +x launch-mobile.sh

# Combined launch script
cat > launch-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting all Tuinbeheer apps..."

# Function to kill background processes on exit
cleanup() {
    echo "Stopping all processes..."
    kill $(jobs -p) 2>/dev/null
    exit
}
trap cleanup SIGINT

# Start web app in background
echo "🌐 Starting web app..."
cd apps/web && npm run dev &

# Start mobile app in background  
echo "📱 Starting mobile app..."
cd apps/mobile && npm start &

# Wait for user input to stop
echo "✅ All apps started!"
echo "📱 Mobile: Scan QR code with Expo Go app"
echo "🌐 Web: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all apps"
wait
EOF
chmod +x launch-all.sh

print_success "Launch scripts created"

# Final instructions
echo ""
echo "🎉 Setup Complete! Here's what you can do next:"
echo ""
echo "1. 📝 Update environment variables:"
echo "   - apps/web/.env.local"
echo "   - apps/mobile/.env.local"
echo ""
echo "2. 🗄️ Setup your database:"
echo "   npm run db:setup"
echo ""
echo "3. 🚀 Start development:"
echo "   ./launch-all.sh    # Start both web and mobile"
echo "   ./launch-web.sh    # Web only"
echo "   ./launch-mobile.sh # Mobile only"
echo ""
echo "4. 📱 For mobile development:"
echo "   - Install Expo Go app on your phone"
echo "   - Scan the QR code when mobile app starts"
echo "   - Or use simulators: 'i' for iOS, 'a' for Android"
echo ""
echo "🌱 Happy gardening with your cross-platform app!"