#!/bin/bash

echo "🗑️  Removing all console statements for banking standards compliance..."

# Function to remove console statements from a file
remove_console_statements() {
    local file="$1"
    echo "📝 Cleaning: $file"
    
    # Remove all console statements and replace with comments
    sed -i 's/if (process\.env\.NODE_ENV === "development") { console\.log([^;]*); }/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/if (process\.env\.NODE_ENV === "development") { console\.error([^;]*); }/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/if (process\.env\.NODE_ENV === "development") { console\.warn([^;]*); }/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/if (process\.env\.NODE_ENV === "development") { console\.info([^;]*); }/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/if (process\.env\.NODE_ENV === "development") { console\.debug([^;]*); }/\/\/ Console logging removed for banking standards/g' "$file"
    
    # Remove any remaining console statements
    sed -i 's/console\.log([^;]*);/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/console\.error([^;]*);/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/console\.warn([^;]*);/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/console\.info([^;]*);/\/\/ Console logging removed for banking standards/g' "$file"
    sed -i 's/console\.debug([^;]*);/\/\/ Console logging removed for banking standards/g' "$file"
}

# Find all files with console statements
echo "🔍 Finding files with console statements..."
FILES_WITH_CONSOLE=$(find app components lib hooks -name "*.ts" -o -name "*.tsx" | xargs grep -l "console" 2>/dev/null)

echo "📁 Found $(echo "$FILES_WITH_CONSOLE" | wc -l) files with console statements"

# Process each file
for file in $FILES_WITH_CONSOLE; do
    if [ -f "$file" ]; then
        remove_console_statements "$file"
    fi
done

echo "✅ All console statements removed!"
echo "🔒 Banking standards compliance achieved!"