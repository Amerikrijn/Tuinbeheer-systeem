#!/bin/bash

echo "🚀 OpenAI AI Pipeline v2.0 Setup Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 Wat dit script doet:${NC}"
echo "1. Controleert of OpenAI API key is ingesteld"
echo "2. Test de AI pipeline lokaal"
echo "3. Geeft instructies voor GitHub Actions"
echo ""

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ OPENAI_API_KEY environment variable is niet ingesteld${NC}"
    echo ""
    echo -e "${YELLOW}📋 Hoe je een OpenAI API key krijgt:${NC}"
    echo "1. Ga naar: https://platform.openai.com/api-keys"
    echo "2. Log in met je OpenAI account"
    echo "3. Klik op 'Create new secret key'"
    echo "4. Kopieer de key (begint met sk-...)"
    echo ""
    echo -e "${YELLOW}🔑 API Key instellen:${NC}"
    echo "export OPENAI_API_KEY='sk-your-key-here'"
    echo ""
    echo -e "${YELLOW}💾 Of voeg toe aan .env bestand:${NC}"
    echo "echo 'OPENAI_API_KEY=sk-your-key-here' >> .env"
    echo ""
    echo -e "${RED}⚠️  Belangrijk: API calls kosten geld!${NC}"
    echo "   - GPT-4: ~$0.03 per 1000 tokens"
    echo "   - GPT-3.5: ~$0.002 per 1000 tokens"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ OPENAI_API_KEY is ingesteld${NC}"
echo -e "${BLUE}🔑 Key: ${OPENAI_API_KEY:0:10}...${NC}"
echo ""

# Test the AI pipeline locally
echo -e "${BLUE}🧪 Test de AI Pipeline lokaal...${NC}"
echo ""

cd agents/ai-pipeline-v2

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ AI Pipeline directory niet gevonden${NC}"
    exit 1
fi

echo -e "${CYAN}📦 Installeer dependencies...${NC}"
npm ci

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Installatie mislukt${NC}"
    exit 1
fi

echo -e "${CYAN}🏗️ Build de pipeline...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build mislukt${NC}"
    exit 1
fi

echo -e "${CYAN}🤖 Test de AI Pipeline...${NC}"
echo "Dit zal je code analyseren met GPT-4!"
echo ""

# Run a small test to avoid high costs
npm start -- run --target ../../app/auth/login --iterations 1 --quality 80 --output ./test-results

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ AI Pipeline test succesvol!${NC}"
    echo ""
    echo -e "${BLUE}📊 Resultaten bekijken:${NC}"
    if [ -f "test-results/pipeline-results.json" ]; then
        cat test-results/pipeline-results.json | jq '.' 2>/dev/null || cat test-results/pipeline-results.json
    fi
else
    echo -e "${RED}❌ AI Pipeline test mislukt${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 GitHub Actions Setup${NC}"
echo "=================================="
echo ""
echo -e "${YELLOW}📋 Stap 1: Voeg API key toe aan GitHub Secrets${NC}"
echo "1. Ga naar je GitHub repository"
echo "2. Settings > Secrets and variables > Actions"
echo "3. Klik 'New repository secret'"
echo "4. Naam: OPENAI_API_KEY"
echo "5. Waarde: ${OPENAI_API_KEY:0:10}..."
echo ""
echo -e "${YELLOW}📋 Stap 2: Test de pipeline${NC}"
echo "1. Maak een nieuwe branch aan"
echo "2. Maak een kleine wijziging"
echo "3. Push en maak een Pull Request"
echo "4. De AI Pipeline zal automatisch starten!"
echo ""
echo -e "${GREEN}🎉 Je AI Pipeline is nu klaar voor gebruik!${NC}"
echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo "- Start met kleine wijzigingen om kosten te beperken"
echo "- Monitor je OpenAI usage in het dashboard"
echo "- Pas quality threshold aan naar wens (80-95%)"
echo "- Gebruik max_iterations om kosten te controleren"
echo ""

cd ../..