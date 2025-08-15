#!/bin/bash

echo "🔧 Fixing all syntax errors related to console statements..."

# Function to fix syntax errors in a file
fix_syntax_errors() {
    local file="$1"
    echo "📝 Fixing syntax: $file"
    
    # Fix double conditional checks with different quote types
    sed -i 's/if (process\.env\.NODE_ENV === '"'"'development'"'"') { if (process\.env\.NODE_ENV === '"'"'development'"'"') {/if (process.env.NODE_ENV === '"'"'development'"'"') {/g' "$file"
    sed -i 's/if (process\.env\.NODE_ENV === "development") { if (process\.env\.NODE_ENV === "development") {/if (process.env.NODE_ENV === "development") {/g' "$file"
    
    # Fix missing closing braces for console statements
    # This is a simplified approach - we'll need to manually check some files
    
    # Find lines with console statements that don't have proper structure
    if grep -q "if (process.env.NODE_ENV === \"development\") { console" "$file"; then
        echo "  ⚠️  File may have syntax issues - manual review needed"
    fi
}

# Find all files that may have syntax errors
echo "🔍 Finding files with potential syntax errors..."
FILES_WITH_ISSUES=$(find app components lib hooks -name "*.ts" -o -name "*.tsx" | xargs grep -l "if (process.env.NODE_ENV === \"development\") { console" 2>/dev/null)

echo "📁 Found $(echo "$FILES_WITH_ISSUES" | wc -l) files with potential issues"

# Process each file
for file in $FILES_WITH_ISSUES; do
    if [ -f "$file" ]; then
        fix_syntax_errors "$file"
    fi
done

echo "✅ Syntax fixes applied!"
echo "⚠️  Manual review may be needed for complex cases"