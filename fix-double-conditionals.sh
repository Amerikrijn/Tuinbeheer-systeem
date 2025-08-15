#!/bin/bash

echo "🔧 Fixing double conditional checks..."

# Function to fix double conditionals in a file
fix_double_conditionals() {
    local file="$1"
    echo "📝 Fixing double conditionals: $file"
    
    # Fix double conditional checks
    sed -i 's/if (process\.env\.NODE_ENV === "development") { if (process\.env\.NODE_ENV === "development") {/if (process.env.NODE_ENV === "development") {/g' "$file"
    
    # Fix any remaining double conditionals with different quotes
    sed -i 's/if (process\.env\.NODE_ENV === '"'"'development'"'"') { if (process\.env\.NODE_ENV === '"'"'development'"'"') {/if (process.env.NODE_ENV === '"'"'development'"'"') {/g' "$file"
}

# Find all files with double conditionals
echo "🔍 Finding files with double conditionals..."
FILES_WITH_DOUBLE_CONDITIONALS=$(find app components lib hooks -name "*.ts" -o -name "*.tsx" | xargs grep -l "if (process.env.NODE_ENV === \"development\") { if (process.env.NODE_ENV === \"development\") {" 2>/dev/null)

echo "📁 Found $(echo "$FILES_WITH_DOUBLE_CONDITIONALS" | wc -l) files with double conditionals"

# Process each file
for file in $FILES_WITH_DOUBLE_CONDITIONALS; do
    if [ -f "$file" ]; then
        fix_double_conditionals "$file"
    fi
done

echo "✅ Double conditionals fixed!"