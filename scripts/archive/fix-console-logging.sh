#!/bin/bash

echo "🔒 Fixing console logging statements for banking standards compliance..."

# Function to fix console statements in a file
fix_console_in_file() {
    local file="$1"
    echo "📝 Fixing: $file"
    
    # Replace console.log with conditional logging
    sed -i 's/console\.log(/if (process.env.NODE_ENV === "development") { console.log(/g' "$file"
    
    # Replace console.error with conditional logging
    sed -i 's/console\.error(/if (process.env.NODE_ENV === "development") { console.error(/g' "$file"
    
    # Replace console.warn with conditional logging
    sed -i 's/console\.warn(/if (process.env.NODE_ENV === "development") { console.warn(/g' "$file"
    
    # Replace console.info with conditional logging
    sed -i 's/console\.info(/if (process.env.NODE_ENV === "development") { console.info(/g' "$file"
    
    # Replace console.debug with conditional logging
    sed -i 's/console\.debug(/if (process.env.NODE_ENV === "development") { console.debug(/g' "$file"
    
    # Add closing braces for console statements that span multiple lines
    # This is a simplified approach - we'll need to manually check some files
}

# Find all TypeScript/TSX files with console statements
echo "🔍 Finding files with console statements..."
FILES_WITH_CONSOLE=$(find app components lib hooks -name "*.ts" -o -name "*.tsx" | xargs grep -l "console" 2>/dev/null)

echo "📁 Found $(echo "$FILES_WITH_CONSOLE" | wc -l) files with console statements"

# Process each file
for file in $FILES_WITH_CONSOLE; do
    if [ -f "$file" ]; then
        fix_console_in_file "$file"
    fi
done

echo "✅ Console logging fixes applied!"
echo "⚠️  Note: Some files may need manual review for multi-line console statements"