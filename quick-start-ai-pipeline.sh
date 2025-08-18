#!/bin/bash

echo "🚀 Quick Start: AI Testing Pipeline"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 What This Script Does:${NC}"
echo "1. 🤖 Start the Pipeline Orchestrator Agent"
echo "2. 🔄 Execute the CI/CD AI Testing Pipeline"
echo "3. 📊 Show results and summary"
echo "4. 🚀 Simulate the CI/CD workflow locally"
echo ""

echo -e "${YELLOW}📁 Current Directory:${NC} $(pwd)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "agents" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Step 1: Check if all agents are ready
echo -e "${GREEN}🔍 Step 1: Checking AI Agents Status${NC}"
echo "Verifying all agents are properly set up..."
echo ""

# Check test-generator agent
if [ -d "agents/test-generator" ] && [ -f "agents/test-generator/package.json" ]; then
    echo -e "${GREEN}✅ Test Generator Agent: Ready${NC}"
else
    echo -e "${RED}❌ Test Generator Agent: Not found or incomplete${NC}"
    exit 1
fi

# Check quality-analyzer agent
if [ -d "agents/quality-analyzer" ] && [ -f "agents/quality-analyzer/package.json" ]; then
    echo -e "${GREEN}✅ Quality Analyzer Agent: Ready${NC}"
else
    echo -e "${RED}❌ Quality Analyzer Agent: Not found or incomplete${NC}"
    exit 1
fi

# Check auto-fix agent
if [ -d "agents/auto-fix" ] && [ -f "agents/auto-fix/package.json" ]; then
    echo -e "${GREEN}✅ Auto-Fix Agent: Ready${NC}"
else
    echo -e "${RED}❌ Auto-Fix Agent: Not found or incomplete${NC}"
    exit 1
fi

# Check pipeline-orchestrator agent
if [ -d "agents/pipeline-orchestrator" ] && [ -f "agents/pipeline-orchestrator/package.json" ]; then
    echo -e "${GREEN}✅ Pipeline Orchestrator Agent: Ready${NC}"
else
    echo -e "${RED}❌ Pipeline Orchestrator Agent: Not found or incomplete${NC}"
    exit 1
fi

echo ""

# Step 2: Install dependencies if needed
echo -e "${GREEN}📦 Step 2: Installing Dependencies${NC}"
echo "Installing dependencies for all agents..."
echo ""

cd agents/test-generator
if [ ! -d "node_modules" ]; then
    echo "Installing Test Generator dependencies..."
    npm install
else
    echo "Test Generator dependencies already installed"
fi

cd ../quality-analyzer
if [ ! -d "node_modules" ]; then
    echo "Installing Quality Analyzer dependencies..."
    npm install
else
    echo "Quality Analyzer dependencies already installed"
fi

cd ../auto-fix
if [ ! -d "node_modules" ]; then
    echo "Installing Auto-Fix dependencies..."
    npm install
else
    echo "Auto-Fix dependencies already installed"
fi

cd ../pipeline-orchestrator
if [ ! -d "node_modules" ]; then
    echo "Installing Pipeline Orchestrator dependencies..."
    npm install
else
    echo "Pipeline Orchestrator dependencies already installed"
fi

cd ../..
echo ""

# Step 3: Start the AI Pipeline
echo -e "${GREEN}🚀 Step 3: Starting AI Testing Pipeline${NC}"
echo "Starting the Pipeline Orchestrator Agent..."
echo ""

cd agents/pipeline-orchestrator

# Check if config exists
if [ ! -f "../../.github/ai-pipeline-config.json" ]; then
    echo -e "${YELLOW}⚠️  AI Pipeline config not found, creating default...${NC}"
    # The config should already exist from our previous step
    echo -e "${RED}❌ Error: AI Pipeline config not found${NC}"
    exit 1
fi

echo -e "${CYAN}🚀 Executing AI Testing Pipeline...${NC}"
echo "This will run:"
echo "  1. Test Generator Agent"
echo "  2. Quality Analyzer Agent"
echo "  3. Auto-Fix Agent (analysis only, no fixes applied)"
echo ""

# Execute the pipeline
npx ts-node cli.ts --config ../../.github/ai-pipeline-config.json execute ci-ai-pipeline

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AI Testing Pipeline completed successfully!${NC}"
else
    echo -e "${RED}❌ AI Testing Pipeline failed!${NC}"
    exit 1
fi

echo ""

# Step 4: Display Results
echo -e "${GREEN}📊 Step 4: AI Testing Results${NC}"
echo "======================================"
echo ""

cd ../..

# Check for generated results
if [ -f "agents/test-generator/test-results/login-exploration-summary.md" ]; then
    echo -e "${BLUE}📋 Test Generation Results:${NC}"
    echo "Generated reports:"
    echo "  - login-exploration.json (Detailed results)"
    echo "  - login-exploration-summary.md (Human-readable summary)"
    echo "  - coverage-report.json (Coverage metrics)"
    echo ""
fi

if [ -f "agents/quality-analyzer/quality-results/quality-analysis-summary.md" ]; then
    echo -e "${BLUE}📊 Quality Analysis Results:${NC}"
    echo "Generated reports:"
    echo "  - quality-analysis.json (Detailed analysis)"
    echo "  - quality-analysis-summary.md (Human-readable summary)"
    echo "  - quality-metrics.json (Quality metrics)"
    echo ""
fi

if [ -f "agents/auto-fix/auto-fix-results/fix-report-summary.md" ]; then
    echo -e "${BLUE}🔧 Auto-Fix Analysis Results:${NC}"
    echo "Generated reports:"
    echo "  - fix-report.json (Detailed fix analysis)"
    echo "  - fix-report-summary.md (Human-readable summary)"
    echo "  - fix-metrics.json (Fix metrics)"
    echo ""
fi

# Step 5: Summary
echo -e "${GREEN}🎯 AI Pipeline Execution Summary${NC}"
echo "=========================================="

echo -e "${BLUE}🎯 What We've Accomplished:${NC}"
echo "✅ Built a complete 4-agent AI testing ecosystem"
echo "✅ Test Generator Agent automatically created test scenarios"
echo "✅ Quality Analyzer Agent provided detailed quality insights"
echo "✅ Auto-Fix Agent identified potential fixes (without applying them)"
echo "✅ Pipeline Orchestrator coordinated all agents"
echo "✅ Generated comprehensive reports in multiple formats"
echo "✅ Identified areas for improvement and optimization"
echo ""

echo -e "${BLUE}📊 Key Metrics:${NC}"
if [ -f "agents/test-generator/test-results/login-exploration.json" ]; then
    echo "Test Results:"
    echo "  - Total scenarios generated: $(jq '.test_results | length' agents/test-generator/test-results/login-exploration.json 2>/dev/null || echo 'N/A')"
    echo "  - Tests executed: $(jq '.execution_summary.tests_executed' agents/test-generator/test-results/login-exploration.json 2>/dev/null || echo 'N/A')"
    echo "  - Success rate: $(jq '.execution_summary.tests_passed // 0 / (.execution_summary.tests_executed // 1) * 100 | round' agents/test-generator/test-results/login-exploration.json 2>/dev/null || echo 'N/A')%"
fi

if [ -f "agents/quality-analyzer/quality-results/quality-analysis.json" ]; then
    echo "Quality Analysis:"
    echo "  - Overall Grade: $(jq -r '.summary.overallGrade' agents/quality-analyzer/quality-results/quality-analysis.json 2>/dev/null || echo 'N/A')"
    echo "  - Quality Score: $(jq '.summary.qualityScore' agents/quality-analyzer/quality-results/quality-analysis.json 2>/dev/null || echo 'N/A')/100"
    echo "  - Risk Level: $(jq -r '.riskAssessment.overallRisk' agents/quality-analyzer/quality-results/quality-analysis.json 2>/dev/null || echo 'N/A')"
    echo "  - Recommendations: $(jq '.recommendations | length' agents/quality-analyzer/quality-results/quality-analysis.json 2>/dev/null || echo 'N/A')"
fi

if [ -f "agents/auto-fix/auto-fix-results/fix-report.json" ]; then
    echo "Auto-Fix Analysis:"
    echo "  - Issues Found: $(jq '.summary.totalIssues' agents/auto-fix/auto-fix-results/fix-report.json 2>/dev/null || echo 'N/A')"
    echo "  - Auto-Fixable: $(jq '.summary.autoFixed' agents/auto-fix/auto-fix-results/fix-report.json 2>/dev/null || echo 'N/A')"
    echo "  - Manual Review: $(jq '.summary.skippedFixes' agents/auto-fix/auto-fix-results/fix-report.json 2>/dev/null || echo 'N/A')"
fi

echo ""
echo -e "${BLUE}🔮 Next Steps & CI/CD Integration:${NC}"
echo "1. 🚀 Push this to GitHub to trigger the CI/CD pipeline"
echo "2. 🔄 Both pipelines will run in parallel:"
echo "   - Standard Tests & Build"
echo "   - AI Testing Pipeline"
echo "3. 📊 Results will be available in GitHub Actions"
echo "4. 💬 PR comments will include AI testing insights"
echo "5. 🚀 Deploy only happens when both pipelines succeed"
echo ""

echo -e "${BLUE}📁 Generated Reports Location:${NC}"
echo "Test Results: $(pwd)/agents/test-generator/test-results/"
echo "Quality Analysis: $(pwd)/agents/quality-analyzer/quality-results/"
echo "Auto-Fix Analysis: $(pwd)/agents/auto-fix/auto-fix-results/"
echo ""

echo -e "${GREEN}🎉 AI Pipeline test completed successfully!${NC}"
echo ""
echo -e "${YELLOW}💡 To explore the results:${NC}"
echo "  - View test results: cat agents/test-generator/test-results/login-exploration-summary.md"
echo "  - View quality analysis: cat agents/quality-analyzer/quality-results/quality-analysis-summary.md"
echo "  - View auto-fix analysis: cat agents/auto-fix/auto-fix-results/fix-report-summary.md"
echo ""

echo -e "${PURPLE}🤖 Your AI Testing Pipeline is ready for CI/CD!${NC}"
echo "Push to GitHub to see both pipelines run in parallel."