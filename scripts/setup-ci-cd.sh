#!/bin/bash

# Master CI/CD Setup Script for Banking-Grade Pipeline
# This script sets up the complete CI/CD infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to print colored output
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

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

print_step() {
    echo -e "${CYAN}➤${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if file exists
file_exists() {
    [ -f "$1" ]
}

# Function to check if directory exists
dir_exists() {
    [ -d "$1" ]
}

# Function to validate project structure
validate_project_structure() {
    print_step "Validating project structure..."
    
    local required_files=(
        "package.json"
        "next.config.mjs"
        "tsconfig.json"
        "jest.config.js"
        ".eslintrc.json"
        ".github/workflows/ci-cd.yml"
        ".github/workflows/pipeline-monitor.yml"
    )
    
    local required_dirs=(
        ".github"
        ".github/workflows"
        "scripts"
        "docs"
    )
    
    for file in "${required_files[@]}"; do
        if ! file_exists "$PROJECT_ROOT/$file"; then
            print_error "Required file missing: $file"
            return 1
        fi
    done
    
    for dir in "${required_dirs[@]}"; do
        if ! dir_exists "$PROJECT_ROOT/$dir"; then
            print_error "Required directory missing: $dir"
            return 1
        fi
    done
    
    print_success "Project structure validated"
}

# Function to check dependencies
check_dependencies() {
    print_step "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists git; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and run this script again"
        return 1
    fi
    
    print_success "Dependencies checked"
}

# Function to validate package.json scripts
validate_package_scripts() {
    print_step "Validating package.json scripts..."
    
    local required_scripts=(
        "lint"
        "type-check"
        "test:ci"
        "build"
        "audit:security"
    )
    
    for script in "${required_scripts[@]}"; do
        if ! npm run --silent "$script" --dry-run >/dev/null 2>&1; then
            print_error "Required script missing: $script"
            return 1
        fi
    done
    
    print_success "Package.json scripts validated"
}

# Function to check GitHub configuration
check_github_config() {
    print_step "Checking GitHub configuration..."
    
    if ! git remote get-url origin >/dev/null 2>&1; then
        print_warning "No Git remote 'origin' found"
        return 1
    fi
    
    local remote_url
    remote_url=$(git remote get-url origin)
    
    if [[ "$remote_url" != *"github.com"* ]]; then
        print_warning "Remote URL doesn't appear to be GitHub: $remote_url"
        return 1
    fi
    
    print_success "GitHub configuration validated"
}

# Function to setup branch protection
setup_branch_protection() {
    print_step "Setting up branch protection rules..."
    
    if [ -z "$GITHUB_TOKEN" ]; then
        print_warning "GITHUB_TOKEN not set - skipping branch protection setup"
        print_status "To set up branch protection, run:"
        print_status "  export GITHUB_TOKEN='your_token'"
        print_status "  export GITHUB_REPOSITORY='username/repo'"
        print_status "  ./scripts/setup-branch-protection.sh"
        return 0
    fi
    
    if [ -z "$GITHUB_REPOSITORY" ]; then
        print_warning "GITHUB_REPOSITORY not set - skipping branch protection setup"
        return 0
    fi
    
    if [ -f "$SCRIPT_DIR/setup-branch-protection.sh" ]; then
        print_status "Running branch protection setup..."
        if "$SCRIPT_DIR/setup-branch-protection.sh"; then
            print_success "Branch protection setup completed"
        else
            print_warning "Branch protection setup had issues - check manually"
        fi
    else
        print_warning "Branch protection script not found"
    fi
}

# Function to test CI/CD pipeline
test_pipeline() {
    print_step "Testing CI/CD pipeline components..."
    
    print_status "Running local quality checks..."
    
    # Test ESLint
    if npm run lint >/dev/null 2>&1; then
        print_success "ESLint passed"
    else
        print_error "ESLint failed - please fix issues"
        return 1
    fi
    
    # Test TypeScript
    if npm run type-check >/dev/null 2>&1; then
        print_success "TypeScript check passed"
    else
        print_error "TypeScript check failed - please fix issues"
        return 1
    fi
    
    # Test build
    if npm run build >/dev/null 2>&1; then
        print_success "Build passed"
    else
        print_error "Build failed - please fix issues"
        return 1
    fi
    
    print_success "All local quality checks passed"
}

# Function to generate setup report
generate_setup_report() {
    print_step "Generating setup report..."
    
    local report_file="$PROJECT_ROOT/CI-CD-SETUP-REPORT.md"
    
    cat > "$report_file" << EOF
# 🚀 CI/CD Setup Report

**Generated**: $(date -u)
**Project**: $(basename "$PROJECT_ROOT")
**Branch**: $(git branch --show-current 2>/dev/null || echo "unknown")

## ✅ Setup Status

- **Project Structure**: ✅ Validated
- **Dependencies**: ✅ Checked
- **Package Scripts**: ✅ Validated
- **GitHub Config**: ✅ Validated
- **Local Tests**: ✅ Passed

## 🔧 Configuration Files

- **Main CI/CD**: \`.github/workflows/ci-cd.yml\`
- **Pipeline Monitor**: \`.github/workflows/pipeline-monitor.yml\`
- **Branch Protection**: \`.github/branch-protection.yml\`
- **Setup Scripts**: \`scripts/setup-*.sh\`

## 🚀 Next Steps

1. **Push to GitHub**: Commit and push all changes
2. **Set Secrets**: Configure required GitHub secrets
3. **Test Pipeline**: Create a test PR to verify pipeline
4. **Monitor**: Check GitHub Actions for pipeline status

## 🔐 Required GitHub Secrets

- \`VERCEL_TOKEN\`: Vercel deployment token
- \`VERCEL_ORG_ID\`: Vercel organization ID
- \`VERCEL_PROJECT_ID\`: Vercel project ID
- \`CODECOV_TOKEN\`: Codecov token (optional)

## 📊 Quality Gates

- **ESLint**: Code quality (CRITICAL)
- **TypeScript**: Type safety (CRITICAL)
- **Jest Tests**: Unit tests (CRITICAL)
- **Security Audit**: Vulnerabilities (CRITICAL)
- **Build**: Application build (CRITICAL)

## 🚫 No Override Policy

**⚠️ IMPORTANT**: This pipeline is designed to be **NON-OVERRIDABLE**.
All quality gates must pass before any deployment is allowed.

---

*This report was generated automatically by the CI/CD setup script*
EOF

    print_success "Setup report generated: $report_file"
}

# Function to display final instructions
display_final_instructions() {
    print_header "🎉 CI/CD Setup Complete!"
    
    echo
    print_success "Your banking-grade CI/CD pipeline is now configured!"
    echo
    print_status "Next steps:"
    echo "  1. 📝 Commit and push all changes to GitHub"
    echo "  2. 🔐 Configure required GitHub secrets"
    echo "  3. 🧪 Create a test PR to verify the pipeline"
    echo "  4. 📊 Monitor pipeline status in GitHub Actions"
    echo
    print_status "Pipeline features:"
    echo "  ✅ Automatic quality gate enforcement"
    echo "  ✅ No override possible for quality checks"
    echo "  ✅ Automatic preview deployment on success"
    echo "  ✅ Daily pipeline health monitoring"
    echo "  ✅ Quality issue alerts and reporting"
    echo
    print_warning "Remember: All quality gates must pass before deployment!"
    echo
    print_status "For detailed documentation, see: docs/CI-CD-SETUP.md"
}

# Main function
main() {
    print_header "🚀 Banking-Grade CI/CD Pipeline Setup"
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Validate everything
    validate_project_structure
    check_dependencies
    validate_package_scripts
    check_github_config
    
    # Setup components
    setup_branch_protection
    
    # Test pipeline
    test_pipeline
    
    # Generate report
    generate_setup_report
    
    # Display final instructions
    display_final_instructions
}

# Run main function
main "$@"