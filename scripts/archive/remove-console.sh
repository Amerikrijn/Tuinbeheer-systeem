#!/bin/bash

echo "🔒 Removing all console statements for banking standards compliance..."

# Remove all console statements from database.ts
sed -i '/console\.error/d' lib/database.ts

echo "✅ Console statements removed from database.ts!"