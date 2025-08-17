#!/bin/bash

echo "🔧 Repareren van alle Supabase imports in de codebase..."

# Vervang alle imports van { supabase } naar { getSupabaseClient }
echo "📝 Vervangen van imports..."
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | xargs sed -i 's/import { supabase } from '\''@\/lib\/supabase'\''/import { getSupabaseClient } from '\''@\/lib\/supabase'\''/g'
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | xargs sed -i 's/import { supabase } from '\''\.\/supabase'\''/import { getSupabaseClient } from '\''\.\/supabase'\''/g'
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | xargs sed -i 's/import { supabase } from '\''\.\.\/supabase'\''/import { getSupabaseClient } from '\''\.\.\/supabase'\''/g'

# Vervang alle imports van supabase naar getSupabaseClient (zonder accolades)
echo "📝 Vervangen van default imports..."
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | xargs sed -i 's/import supabase from '\''@\/lib\/supabase'\''/import { getSupabaseClient } from '\''@\/lib\/supabase'\''/g'

echo "✅ Imports gerepareerd!"

echo ""
echo "🔍 Nu moeten we alle supabase. aanroepen vervangen door getSupabaseClient()..."
echo "Dit is een handmatig proces omdat we context nodig hebben."
echo ""
echo "📋 STAPPEN OM TE VOLTOOIEN:"
echo "1. Zoek naar alle bestanden met 'supabase.' aanroepen:"
echo "   grep -r 'supabase\.' --include='*.ts' --include='*.tsx' . | grep -v node_modules"
echo ""
echo "2. Voeg in elk bestand toe waar supabase wordt gebruikt:"
echo "   const supabase = getSupabaseClient()"
echo ""
echo "3. Test je app om te zien of alle fouten zijn opgelost"
echo ""
echo "💡 TIP: Je kunt dit ook in VS Code doen met Find & Replace:"
echo "   Zoek: supabase\."
echo "   Vervang door: supabase\."
echo "   En voeg dan handmatig 'const supabase = getSupabaseClient()' toe waar nodig"