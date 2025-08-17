#!/bin/bash

# 🚨 KRITIEKE SECURITY CHECK - NOOIT SUPABASE KEYS COMMITTEN
# Dit script wordt uitgevoerd in CI/CD om te voorkomen dat hardcoded keys worden gedeployed

echo "🔒 Running critical security check for hardcoded Supabase keys..."

# Check for hardcoded Supabase JWT tokens
if grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=coverage --exclude-dir=docs/archive; then
    echo "❌ KRITIEKE FOUT: Hardcoded Supabase JWT tokens gevonden!"
    echo "🚨 Deze mogen NOOIT in de repository staan!"
    echo "🔒 Gebruik ALTIJD Vercel Secrets voor productie keys"
    exit 1
fi

# Check for hardcoded Supabase project URLs
if grep -r "dwsgwqosmihsfaxuheji.supabase.co" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=coverage --exclude-dir=docs/archive; then
    echo "❌ KRITIEKE FOUT: Hardcoded Supabase project URL gevonden!"
    echo "🚨 Deze mogen NOOIT in de repository staan!"
    echo "🔒 Gebruik ALTIJD environment variables voor URLs"
    exit 1
fi

# Check for hardcoded anon keys (even test keys)
if grep -r "test-anon-key" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=coverage --exclude-dir=docs/archive; then
    echo "❌ KRITIEKE FOUT: Hardcoded test Supabase keys gevonden!"
    echo "🚨 Zelfs test keys mogen niet hardgecodeerd zijn!"
    echo "🔒 Gebruik ALTIJD environment variables"
    exit 1
fi

# Check for hardcoded service role keys
if grep -r "test-service-role-key" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=coverage --exclude-dir=docs/archive; then
    echo "❌ KRITIEKE FOUT: Hardcoded test service role keys gevonden!"
    echo "🚨 Zelfs test keys mogen niet hardgecodeerd zijn!"
    echo "🔒 Gebruik ALTIJD environment variables"
    exit 1
fi

# Check for hardcoded keys in vercel.json
if grep -r "NEXT_PUBLIC_SUPABASE_ANON_KEY\|SUPABASE_SERVICE_ROLE_KEY" vercel.json; then
    echo "❌ KRITIEKE FOUT: Supabase keys gevonden in vercel.json!"
    echo "🚨 Gebruik ALTIJD Vercel Secrets: @supabase-anon-key en @supabase-service-role-key"
    exit 1
fi

echo "✅ Geen hardcoded Supabase keys gevonden - Security check geslaagd!"
echo "🔒 Repository is veilig voor deployment"