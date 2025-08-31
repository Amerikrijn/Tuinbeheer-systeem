#!/bin/bash

# Files that need router but don't have it
files=(
  "app/admin/users/page.tsx"
  "app/error.tsx"
  "app/global-error.tsx"
  "app/offline/page.tsx"
  "components/error-boundary.tsx"
  "components/user/simple-tasks-view.tsx"
)

for file in "${files[@]}"; do
  echo "Checking $file"
  
  # Check if it's a client component
  if grep -q "'use client'" "$file"; then
    # Check if router is already defined
    if ! grep -q "const router = useRouter()" "$file"; then
      echo "  Adding router to $file"
      # Add const router = useRouter() after the imports
      sed -i '/^import/,$!b; /^[^i]/i\  const router = useRouter()' "$file"
    fi
  fi
done