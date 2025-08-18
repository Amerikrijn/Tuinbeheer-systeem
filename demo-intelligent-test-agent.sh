#!/bin/bash

echo "🚀 Demo: Intelligente Test Agent"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting Intelligent Test Agent Demo..."

# Create demo directory
DEMO_DIR="./demo-intelligent-agent"
mkdir -p "$DEMO_DIR"

# Create a simple test file for demonstration
print_status "Creating demo test file..."
cat > "$DEMO_DIR/demo-feature.ts" << 'EOF'
// Demo feature for intelligent testing
export class UserAuthentication {
  private users: Map<string, string> = new Map()
  private maxLoginAttempts: number = 3
  private lockoutDuration: number = 300000 // 5 minutes

  constructor() {
    // Initialize with demo users
    this.users.set('admin@example.com', 'admin123')
    this.users.set('user@example.com', 'password123')
  }

  async login(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // Input validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' }
      }

      // Check if user exists
      if (!this.users.has(email)) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Verify password
      if (this.users.get(email) !== password) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Generate token (simplified)
      const token = this.generateToken(email)
      
      return { success: true, token }
    } catch (error) {
      return { success: false, error: 'Internal server error' }
    }
  }

  async logout(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!token) {
        return { success: false, error: 'Token is required' }
      }

      // In a real app, this would invalidate the token
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Internal server error' }
    }
  }

  private generateToken(email: string): string {
    // Simple token generation (not secure for production)
    return `token_${email}_${Date.now()}`
  }

  // Method with high complexity for testing
  async complexOperation(data: any[]): Promise<any> {
    let result = 0
    
    for (let i = 0; i < data.length; i++) {
      if (data[i] > 0) {
        if (data[i] % 2 === 0) {
          result += data[i] * 2
        } else {
          result += data[i]
        }
      } else if (data[i] < 0) {
        result -= Math.abs(data[i])
      }
    }
    
    return result
  }
}
EOF

print_success "Demo feature file created: $DEMO_DIR/demo-feature.ts"

# Navigate to test generator agent
cd agents/test-generator

print_status "Installing dependencies for test generator agent..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed successfully"

# Run the intelligent test agent
print_status "Running Intelligent Test Agent..."
print_status "Target: Demo authentication feature"
print_status "Strategy: Intelligent pattern recognition"
print_status "Learning: Enabled"
echo ""

npx ts-node cli.ts \
  --path "../../$DEMO_DIR/demo-feature.ts" \
  --strategy "intelligent" \
  --max-interactions 100 \
  --output "./intelligent-demo-results" \
  --include-security-tests \
  --include-performance-tests \
  --include-edge-cases

if [ $? -eq 0 ]; then
    print_success "Intelligent Test Agent completed successfully!"
    
    # Show results
    echo ""
    print_status "Demo Results:"
    echo "=============="
    
    if [ -d "./intelligent-demo-results" ]; then
        echo "📁 Results directory: ./intelligent-demo-results"
        
        # List generated files
        if [ -f "./intelligent-demo-results/intelligent-report-*.json" ]; then
            echo "📊 JSON Report: Available"
        fi
        
        if [ -f "./intelligent-demo-results/intelligent-report-*.md" ]; then
            echo "📝 Markdown Report: Available"
        fi
    fi
    
    if [ -d "./learning-data" ]; then
        echo "🧠 Learning Data: Available"
        echo "   - Test execution history"
        echo "   - Failure patterns"
        echo "   - Performance metrics"
        echo "   - Adaptation logs"
    fi
    
    echo ""
    print_success "Demo completed! The agent has:"
    echo "✅ Analyzed the demo code intelligently"
    echo "✅ Generated relevant test scenarios"
    echo "✅ Learned from test execution"
    echo "✅ Adapted its behavior"
    echo "✅ Generated comprehensive reports"
    
else
    print_error "Intelligent Test Agent failed"
    exit 1
fi

# Return to root directory
cd ../..

echo ""
print_status "Demo Summary:"
echo "==============="
echo "🎯 The Intelligent Test Agent demonstrated:"
echo "   • Advanced code pattern recognition"
echo "   • Security vulnerability detection"
echo "   • Performance hotspot identification"
echo "   • Machine learning from test results"
echo "   • Adaptive test generation"
echo "   • Comprehensive reporting"
echo ""
echo "📁 Check the following directories for results:"
echo "   • agents/test-generator/intelligent-demo-results/"
echo "   • agents/test-generator/learning-data/"
echo ""
echo "🚀 The agent is now ready for production use!"
echo "   It will continue to learn and improve with each execution."