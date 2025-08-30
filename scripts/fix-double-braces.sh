#!/bin/bash

echo "Fixing double braces in className attributes..."

# Fix double braces {{ to single {
find /workspace -type f \( -name "*.tsx" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/__tests__/*" \
  -exec sed -i 's/className={{/className={/g' {} \;

# Fix specific files mentioned in error
files=(
  "/workspace/components/auth/force-password-change.tsx"
  "/workspace/components/navigation.tsx"
  "/workspace/components/performance/performance-dashboard.tsx"
  "/workspace/components/tasks/weekly-task-list.tsx"
  "/workspace/components/ui/alert.tsx"
  "/workspace/components/plant-photo-gallery.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Checking $file..."
    # Show any remaining issues
    grep -n "className={{" "$file" 2>/dev/null || echo "✓ No double braces found in $file"
  fi
done

echo "Done!"