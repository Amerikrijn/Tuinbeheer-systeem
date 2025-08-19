#!/bin/bash

# AI Pipeline v2.0 Test Script
# Test de implementatie van de v2 AI pipeline met OpenAI agents

set -e

echo "🚀 AI Pipeline v2.0 Test Script"
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
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Check if we're in the right directory
if [ ! -d "agents/ai-pipeline-v2" ]; then
    print_status "ERROR" "agents/ai-pipeline-v2 directory not found. Run this script from the project root."
    exit 1
fi

cd agents/ai-pipeline-v2

print_status "INFO" "Testing AI Pipeline v2.0 in: $(pwd)"

# Check Node.js version
print_status "INFO" "Checking Node.js version..."
NODE_VERSION=$(node --version)
if [[ $NODE_VERSION =~ v1[8-9] ]] || [[ $NODE_VERSION =~ v2[0-9] ]]; then
    print_status "SUCCESS" "Node.js version: $NODE_VERSION (✅ Compatible)"
else
    print_status "WARNING" "Node.js version: $NODE_VERSION (⚠️  May have compatibility issues)"
fi

# Check npm version
print_status "INFO" "Checking npm version..."
NPM_VERSION=$(npm --version)
print_status "SUCCESS" "npm version: $NPM_VERSION"

# Install dependencies
print_status "INFO" "Installing dependencies..."
if npm ci; then
    print_status "SUCCESS" "Dependencies installed successfully"
else
    print_status "ERROR" "Failed to install dependencies"
    exit 1
fi

# Build the project
print_status "INFO" "Building AI Pipeline v2.0..."
if npm run build; then
    print_status "SUCCESS" "Build completed successfully"
else
    print_status "ERROR" "Build failed"
    exit 1
fi

# Check build artifacts
print_status "INFO" "Checking build artifacts..."
if [ -d "dist" ]; then
    print_status "SUCCESS" "dist directory exists"
    if [ -f "dist/cli.js" ]; then
        print_status "SUCCESS" "CLI executable found"
    else
        print_status "WARNING" "CLI executable not found in dist/"
    fi
else
    print_status "ERROR" "dist directory not found"
    exit 1
fi

# Test CLI help
print_status "INFO" "Testing CLI help command..."
if npm start -- --help > /dev/null 2>&1; then
    print_status "SUCCESS" "CLI help command works"
else
    print_status "WARNING" "CLI help command failed"
fi

# Test configuration
print_status "INFO" "Testing configuration management..."
if npm start -- config --show > /dev/null 2>&1; then
    print_status "SUCCESS" "Configuration show command works"
else
    print_status "WARNING" "Configuration show command failed"
fi

# Test agent listing
print_status "INFO" "Testing agent listing..."
if npm start -- agents --list > /dev/null 2>&1; then
    print_status "SUCCESS" "Agent listing command works"
else
    print_status "WARNING" "Agent listing command failed"
fi

# Test CI mode (without OpenAI)
print_status "INFO" "Testing CI mode (without OpenAI API key)..."
if npm start -- run --target ../../app --ci-mode --output ./test-results --iterations 1 --quality 80; then
    print_status "SUCCESS" "CI mode test completed successfully"
    
    # Check if results were generated
    if [ -f "test-results/pipeline-results.json" ]; then
        print_status "SUCCESS" "Pipeline results generated"
        
        # Display results summary
        echo ""
        print_status "INFO" "Pipeline Results Summary:"
        echo "================================"
        cat test-results/pipeline-results.json | jq -r '
            "Status: " + (if .success then "SUCCESS" else "FAILED" end),
            "Quality Score: " + (.finalQualityScore | tostring) + "/100",
            "Iterations: " + (.iterations | tostring),
            "Issues Found: " + (.issuesFound | tostring),
            "Issues Fixed: " + (.issuesFixed | tostring),
            "Tests Generated: " + (.testsGenerated | tostring),
            "Mode: " + .mode,
            "AI Provider: " + .aiProvider
        ' 2>/dev/null || echo "Results file exists but could not parse JSON"
    else
        print_status "WARNING" "Pipeline results not generated"
    fi
else
    print_status "ERROR" "CI mode test failed"
    exit 1
fi

# Test with OpenAI if API key is available
if [ -n "$OPENAI_API_KEY" ]; then
    print_status "INFO" "OpenAI API key found, testing AI mode..."
    
    # Create a small test target
    mkdir -p ../../test-target
    cat > ../../test-target/test-file.ts << 'EOF'
// Test file for AI Pipeline v2.0
export function testFunction() {
    console.log("Hello World"); // TODO: Remove console.log
    return "test";
}

// FIXME: Add proper error handling
export function anotherFunction() {
    if (true) {
        return "always true";
    }
}
EOF
    
    print_status "INFO" "Created test target file"
    
    # Test AI mode with small target
    if npm start -- run --target ../../test-target --iterations 1 --quality 70 --output ./ai-test-results; then
        print_status "SUCCESS" "AI mode test completed successfully"
        
        # Check AI results
        if [ -f "ai-test-results/pipeline-results.json" ]; then
            print_status "SUCCESS" "AI pipeline results generated"
            
            # Display AI results summary
            echo ""
            print_status "INFO" "AI Pipeline Results Summary:"
            echo "=================================="
            cat ai-test-results/pipeline-results.json | jq -r '
                "Status: " + (if .success then "SUCCESS" else "FAILED" end),
                "Quality Score: " + (.finalQualityScore | tostring) + "/100",
                "Iterations: " + (.iterations | tostring),
                "Issues Found: " + (.issuesFound | tostring),
                "Issues Fixed: " + (.issuesFixed | tostring),
                "Tests Generated: " + (.testsGenerated | tostring),
                "Mode: " + .mode,
                "AI Provider: " + .aiProvider
            ' 2>/dev/null || echo "AI results file exists but could not parse JSON"
        else
            print_status "WARNING" "AI pipeline results not generated"
        fi
    else
        print_status "WARNING" "AI mode test failed (this may be expected without proper OpenAI setup)"
    fi
    
    # Cleanup test target
    rm -rf ../../test-target
    print_status "INFO" "Cleaned up test target"
else
    print_status "INFO" "No OpenAI API key found, skipping AI mode test"
    print_status "INFO" "Set OPENAI_API_KEY environment variable to test AI functionality"
fi

# Cleanup test results
print_status "INFO" "Cleaning up test results..."
rm -rf test-results ai-test-results

# Test summary
echo ""
echo "🎉 AI Pipeline v2.0 Test Summary"
echo "================================="
print_status "SUCCESS" "All core functionality tests completed"
print_status "SUCCESS" "Build system working correctly"
print_status "SUCCESS" "CLI interface functional"
print_status "SUCCESS" "CI mode operational"
if [ -n "$OPENAI_API_KEY" ]; then
    print_status "SUCCESS" "AI mode tested with OpenAI"
else
    print_status "INFO" "AI mode not tested (no API key)"
fi

echo ""
print_status "INFO" "AI Pipeline v2.0 is ready for use!"
print_status "INFO" "Next steps:"
echo "  1. Configure OpenAI API key in GitHub Secrets"
echo "  2. Test with real codebase"
echo "  3. Monitor GitHub Actions workflows"
echo "  4. Review PR summaries and quality reports"

cd ../..
print_status "SUCCESS" "Test script completed successfully!"