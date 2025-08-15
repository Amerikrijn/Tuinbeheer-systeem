#!/bin/bash

echo "🔧 Fixing all remaining syntax errors..."

# Function to fix all syntax errors in a file
fix_syntax_errors() {
    local file="$1"
    echo "📝 Fixing syntax: $file"
    
    # Fix all double conditional checks
    sed -i 's/if (process\.env\.NODE_ENV === '"'"'development'"'"') { if (process\.env\.NODE_ENV === '"'"'development'"'"') {/if (process.env.NODE_ENV === '"'"'development'"'"') {/g' "$file"
    sed -i 's/if (process\.env\.NODE_ENV === "development") { if (process\.env\.NODE_ENV === "development") {/if (process.env.NODE_ENV === "development") {/g' "$file"
    
    # Fix any remaining console statements
    sed -i 's/console\.log([^;]*);/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/console\.error([^;]*);/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/console\.warn([^;]*);/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/console\.info([^;]*);/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/console\.debug([^;]*);/\/\/ Console logging removed for banking standards/g' "$file"
    
    # Fix any remaining conditional checks without proper structure
    sed -i 's/if (process\.env\.NODE_ENV === '"'"'development'"'"') { console/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/if (process\.env\.NODE_ENV === "development") { console/\/\/ Console logging removed for banking standards/g' "$file"
}

# Find all files that may have syntax errors
echo "🔍 Finding files with potential syntax errors..."
FILES_WITH_ISSUES=$(find app components lib hooks -name "*.ts" -o -name "*.tsx" | xargs grep -l "if (process.env.NODE_ENV === \"development\")" 2>/dev/null)

echo "📁 Found $(echo "$FILES_WITH_ISSUES" | wc -l) files with potential issues"

# Process each file
for file in $FILES_WITH_ISSUES; do
    if [ -f "$file" ]; then
        fix_syntax_errors "$file"
    fi
done

echo "✅ All syntax fixes applied!"