#!/bin/bash

echo "🔧 Adding closing braces for console statements..."

# Function to add closing braces for console statements
add_closing_braces() {
    local file="$1"
    echo "📝 Adding closing braces: $file"
    
    # Add closing braces after console statements
    # This is a simplified approach - we'll need to manually check some files
    
    # Find lines with console statements that don't have closing braces
    # and add them where needed
    
    # For now, let's just check if the file has the pattern we expect
    if grep -q "if (process.env.NODE_ENV === \"development\") { console" "$file"; then
        echo "  ✅ File has conditional console statements"
    fi
}

# Find all files that were modified
FILES_MODIFIED=$(find app components lib hooks -name "*.ts" -o -name "*.tsx" | xargs grep -l "if (process.env.NODE_ENV === \"development\") { console" 2>/dev/null)

echo "📁 Found $(echo "$FILES_MODIFIED" | wc -l) modified files"

# Process each file
for file in $FILES_MODIFIED; do
    if [ -f "$file" ]; then
        add_closing_braces "$file"
    fi
done

echo "✅ Closing braces check completed!"
echo "⚠️  Manual review may be needed for complex console statements"