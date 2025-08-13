#!/bin/bash

# Setup Branch Protection Rules for Banking-Grade CI/CD
# This script automatically configures branch protection rules via GitHub API

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-}"
GITHUB_API_URL="https://api.github.com"

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate required tools
validate_requirements() {
    print_status "Validating requirements..."
    
    if ! command_exists curl; then
        print_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command_exists jq; then
        print_error "jq is required but not installed"
        exit 1
    fi
    
    if [ -z "$GITHUB_TOKEN" ]; then
        print_error "GITHUB_TOKEN environment variable is required"
        exit 1
    fi
    
    if [ -z "$GITHUB_REPOSITORY" ]; then
        print_error "GITHUB_REPOSITORY environment variable is required"
        exit 1
    fi
    
    print_success "Requirements validated"
}

# Function to get current branch protection
get_branch_protection() {
    local branch="$1"
    local url="$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/branches/$branch/protection"
    
    curl -s -H "Authorization: token $GITHUB_TOKEN" \
         -H "Accept: application/vnd.github.v3+json" \
         "$url" 2>/dev/null || echo "{}"
}

# Function to set branch protection
set_branch_protection() {
    local branch="$1"
    local protection_config="$2"
    local url="$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/branches/$branch/protection"
    
    print_status "Setting protection for branch: $branch"
    
    local response
    response=$(curl -s -X PUT \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/json" \
        -d "$protection_config" \
        "$url")
    
    if echo "$response" | jq -e '.message' >/dev/null 2>&1; then
        local error_msg
        error_msg=$(echo "$response" | jq -r '.message // "Unknown error"')
        print_error "Failed to set protection for $branch: $error_msg"
        return 1
    else
        print_success "Protection set for branch: $branch"
        return 0
    fi
}

# Function to configure main branch protection
configure_main_branch() {
    local protection_config='{
        "required_status_checks": {
            "strict": true,
            "contexts": [
                "Quality Gates (Lint, Types, Tests)",
                "Security & Compliance",
                "Build & Validation",
                "Documentation Compliance",
                "Pipeline Status & Quality Gate Enforcement"
            ]
        },
        "enforce_admins": true,
        "required_pull_request_reviews": {
            "required_approving_review_count": 2,
            "dismiss_stale_reviews": true,
            "require_code_owner_reviews": true,
            "require_last_push_approval": true
        },
        "allow_force_pushes": false,
        "allow_deletions": false,
        "block_creations": false,
        "required_conversation_resolution": true,
        "lock_branch": false,
        "allow_fork_syncing": true
    }'
    
    set_branch_protection "main" "$protection_config"
}

# Function to configure develop branch protection
configure_develop_branch() {
    local protection_config='{
        "required_status_checks": {
            "strict": true,
            "contexts": [
                "Quality Gates (Lint, Types, Tests)",
                "Security & Compliance",
                "Build & Validation",
                "Documentation Compliance",
                "Pipeline Status & Quality Gate Enforcement"
            ]
        },
        "enforce_admins": false,
        "required_pull_request_reviews": {
            "required_approving_review_count": 1,
            "dismiss_stale_reviews": true,
            "require_code_owner_reviews": false,
            "require_last_push_approval": true
        },
        "allow_force_pushes": false,
        "allow_deletions": false,
        "block_creations": false,
        "required_conversation_resolution": true,
        "lock_branch": false,
        "allow_fork_syncing": true
    }'
    
    set_branch_protection "develop" "$protection_config"
}

# Function to configure feature branch protection
configure_feature_branch() {
    local protection_config='{
        "required_status_checks": {
            "strict": true,
            "contexts": [
                "Quality Gates (Lint, Types, Tests)",
                "Security & Compliance",
                "Build & Validation"
            ]
        },
        "enforce_admins": false,
        "required_pull_request_reviews": {
            "required_approving_review_count": 1,
            "dismiss_stale_reviews": true,
            "require_code_owner_reviews": false,
            "require_last_push_approval": false
        },
        "allow_force_pushes": true,
        "allow_deletions": true,
        "block_creations": false,
        "required_conversation_resolution": false,
        "lock_branch": false,
        "allow_fork_syncing": true
    }'
    
    # Note: Feature branches use pattern matching, so we'll set this for the default branch pattern
    print_status "Feature branch protection configured via pattern matching"
}

# Function to configure hotfix branch protection
configure_hotfix_branch() {
    local protection_config='{
        "required_status_checks": {
            "strict": true,
            "contexts": [
                "Quality Gates (Lint, Types, Tests)",
                "Security & Compliance",
                "Build & Validation"
            ]
        },
        "enforce_admins": false,
        "required_pull_request_reviews": {
            "required_approving_review_count": 2,
            "dismiss_stale_reviews": true,
            "require_code_owner_reviews": true,
            "require_last_push_approval": true
        },
        "allow_force_pushes": false,
        "allow_deletions": false,
        "block_creations": false,
        "required_conversation_resolution": true,
        "lock_branch": false,
        "allow_fork_syncing": true
    }'
    
    # Note: Hotfix branches use pattern matching, so we'll set this for the default branch pattern
    print_status "Hotfix branch protection configured via pattern matching"
}

# Function to set branch pattern protection (for feature/hotfix branches)
set_branch_pattern_protection() {
    local pattern="$1"
    local protection_config="$2"
    local url="$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/branches/$pattern/protection"
    
    print_status "Setting pattern protection for: $pattern"
    
    local response
    response=$(curl -s -X PUT \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/json" \
        -d "$protection_config" \
        "$url")
    
    if echo "$response" | jq -e '.message' >/dev/null 2>&1; then
        local error_msg
        error_msg=$(echo "$response" | jq -r '.message // "Unknown error"')
        print_warning "Failed to set pattern protection for $pattern: $error_msg"
        return 1
    else
        print_success "Pattern protection set for: $pattern"
        return 0
    fi
}

# Function to configure branch pattern protections
configure_branch_patterns() {
    # Feature branch pattern protection
    local feature_protection='{
        "required_status_checks": {
            "strict": true,
            "contexts": [
                "Quality Gates (Lint, Types, Tests)",
                "Security & Compliance",
                "Build & Validation"
            ]
        },
        "enforce_admins": false,
        "required_pull_request_reviews": {
            "required_approving_review_count": 1,
            "dismiss_stale_reviews": true,
            "require_code_owner_reviews": false,
            "require_last_push_approval": false
        },
        "allow_force_pushes": true,
        "allow_deletions": true,
        "block_creations": false,
        "required_conversation_resolution": false,
        "lock_branch": false,
        "allow_fork_syncing": true
    }'
    
    # Hotfix branch pattern protection
    local hotfix_protection='{
        "required_status_checks": {
            "strict": true,
            "contexts": [
                "Quality Gates (Lint, Types, Tests)",
                "Security & Compliance",
                "Build & Validation"
            ]
        },
        "enforce_admins": false,
        "required_pull_request_reviews": {
            "required_approving_review_count": 2,
            "dismiss_stale_reviews": true,
            "require_code_owner_reviews": true,
            "require_last_push_approval": true
        },
        "allow_force_pushes": false,
        "allow_deletions": false,
        "block_creations": false,
        "required_conversation_resolution": true,
        "lock_branch": false,
        "allow_fork_syncing": true
    }'
    
    # Note: GitHub doesn't support pattern-based branch protection via API
    # These would need to be set manually in the GitHub UI
    print_warning "Branch pattern protections need to be set manually in GitHub UI:"
    print_warning "  - feature/*: 1 review required, force push allowed"
    print_warning "  - hotfix/*: 2 reviews required, no force push"
}

# Main function
main() {
    print_status "Setting up Branch Protection Rules for Banking-Grade CI/CD"
    print_status "Repository: $GITHUB_REPOSITORY"
    
    validate_requirements
    
    print_status "Configuring branch protections..."
    
    # Configure main branches
    configure_main_branch
    configure_develop_branch
    
    # Configure pattern-based protections (note: these need manual setup)
    configure_branch_patterns
    
    print_success "Branch protection setup completed!"
    print_status "Note: Pattern-based protections (feature/*, hotfix/*) need manual setup in GitHub UI"
    
    echo
    print_status "Summary of configured protections:"
    echo "  ✅ main: 2 reviews, code owner review, strict status checks"
    echo "  ✅ develop: 1 review, strict status checks"
    echo "  ⚠️  feature/*: Manual setup required (1 review, force push allowed)"
    echo "  ⚠️  hotfix/*: Manual setup required (2 reviews, no force push)"
}

# Run main function
main "$@"