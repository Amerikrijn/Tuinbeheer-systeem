#!/bin/bash

echo "🚀 Quick Start: AI Testing Pipeline (2 Iterations)"
echo "=================================================="
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
echo "2. 🔄 Execute the CI/CD AI Testing Pipeline with 2 iterations"
echo "3. 🔗 Consolidate all test results (AI + Conventional)"
echo "4. 📊 Generate comprehensive final report at pipeline end"
echo "5. 🚀 Simulate the CI/CD workflow locally"
echo "6. 📈 Demonstrate iterative improvement capabilities"
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

# Step 3: Start the AI Pipeline with 2 Iterations
echo -e "${GREEN}🚀 Step 3: Starting AI Testing Pipeline (2 Iterations)${NC}"
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

echo -e "${CYAN}🚀 Executing AI Testing Pipeline with 2 Iterations...${NC}"
echo "This will run:"
echo "  1. 🔄 Iteratie 1: Basis test generatie en kwaliteitsanalyse"
echo "  2. 🔄 Iteratie 2: Verbeterde tests, edge cases, security, performance"
echo "  3. 🔗 Consolidatie van alle test resultaten (AI + Conventional)"
echo "  4. 📊 Eindrapport generatie met alle resultaten geconsolideerd"
echo ""

# Execute the pipeline
npx ts-node cli.ts --config ../../.github/ai-pipeline-config.json --workflow ci-ai-pipeline --execute

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AI Testing Pipeline with 2 iterations completed successfully!${NC}"
else
    echo -e "${RED}❌ AI Testing Pipeline failed!${NC}"
    exit 1
fi

echo ""

# Step 4: Display Results with Iteration Comparison
echo -e "${GREEN}📊 Step 4: AI Testing Results (2 Iterations)${NC}"
echo "======================================================"
echo ""

cd ../..

# Check for consolidated final report (Pipeline End)
if [ -f "agents/pipeline-orchestrator/orchestration-results/consolidated-final-report.json" ]; then
    echo -e "${BLUE}🔗 Consolidated Final Report (Pipeline End):${NC}"
    echo "Generated reports:"
    echo "  - consolidated-final-report.json (Complete pipeline results with all tests)"
    echo "  - consolidated-final-summary.md (Human-readable summary of all results)"
    echo "  - executive-summary.md (Executive summary for stakeholders)"
    echo ""
fi

# Check for generated results
if [ -f "agents/test-generator/test-results/test-execution-summary.md" ]; then
    echo -e "${BLUE}📋 Test Generation Results (2 Iterations):${NC}"
    echo "Generated reports:"
    echo "  - test-execution-report.json (Detailed results with iteration data)"
    echo "  - test-execution-summary.md (Human-readable summary with improvements)"
    echo "  - test-coverage-report.json (Coverage metrics per iteration)"
    echo ""
fi

if [ -f "agents/quality-analyzer/quality-results/quality-analysis-summary.md" ]; then
    echo -e "${BLUE}📊 Quality Analysis Results (2 Iterations):${NC}"
    echo "Generated reports:"
    echo "  - quality-analysis.json (Detailed analysis with iteration data)"
    echo "  - quality-analysis-summary.md (Human-readable summary with improvements)"
    echo "  - quality-metrics.json (Quality metrics per iteration)"
    echo ""
fi

if [ -f "agents/auto-fix/auto-fix-results/fix-report-summary.md" ]; then
    echo -e "${BLUE}🔧 Auto-Fix Analysis Results (2 Iterations):${NC}"
    echo "Generated reports:"
    echo "  - fix-report.json (Detailed fix analysis with iteration data)"
    echo "  - fix-report-summary.md (Human-readable summary with improvements)"
    echo "  - fix-metrics.json (Fix metrics per iteration)"
    echo ""
fi

# Step 5: Summary with Iteration Benefits
echo -e "${GREEN}🎯 AI Pipeline Execution Summary (2 Iterations)${NC}"
echo "========================================================"

echo -e "${BLUE}🎯 What We've Accomplished:${NC}"
echo "✅ Built a complete 4-agent AI testing ecosystem with iterative improvement"
echo "✅ Test Generator Agent: 2 iterations with enhanced test scenarios"
echo "✅ Quality Analyzer Agent: 2 iterations with deeper analysis"
echo "✅ Auto-Fix Agent: 2 iterations with comprehensive fix identification"
echo "✅ Pipeline Orchestrator: Coordinated all agents with iteration tracking"
echo "✅ 🔗 Consolidated Final Report generated at pipeline end (AI + Conventional tests)"
echo "✅ Generated comprehensive reports showing improvements between iterations"
echo "✅ Demonstrated iterative learning and improvement capabilities"
echo ""

echo -e "${BLUE}🔄 Iteration Benefits:${NC}"
echo "• Iteratie 1: Basis functionaliteit en test scenarios"
echo "• Iteratie 2: Edge cases, security tests, performance tests, advanced analysis"
echo "• Verbetering tracking: Kwaliteit, performance, en coverage metrics"
echo "• Trend analysis: Vergelijking tussen iteraties"
echo "• Advanced recommendations: Op basis van beide iteraties"
echo ""

echo -e "${BLUE}📊 Key Metrics (2 Iterations):${NC}"
if [ -f "agents/test-generator/test-results/test-execution-report.json" ]; then
    echo "Test Results:"
    echo "  - Total scenarios generated: $(jq '.scenarios | length' agents/test-generator/test-results/test-execution-report.json 2>/dev/null || echo 'N/A')"
    echo "  - Quality improvement: $(jq '.improvementSummary.qualityIncrease // 0' agents/test-generator/test-results/test-execution-report.json 2>/dev/null || echo 'N/A') points"
    echo "  - Scenario increase: $(jq '.improvementSummary.scenarioIncrease // 0' agents/test-generator/test-results/test-execution-report.json 2>/dev/null || echo 'N/A')"
fi

if [ -f "agents/quality-analyzer/quality-results/quality-analysis.json" ]; then
    echo "Quality Analysis:"
    echo "  - Overall Grade: $(jq -r '.overallGrade' agents/quality-analyzer/quality-results/quality-analysis.json 2>/dev/null || echo 'N/A')"
    echo "  - Quality Score: $(jq '.qualityScore' agents/quality-analyzer/quality-results/quality-analysis.json 2>/dev/null || echo 'N/A')/100"
    echo "  - Quality improvement: $(jq '.improvementSummary.qualityIncrease // 0' agents/quality-analyzer/quality-results/quality-analysis.json 2>/dev/null || echo 'N/A') points"
fi

if [ -f "agents/auto-fix/auto-fix-results/fix-report.json" ]; then
    echo "Auto-Fix Analysis:"
    echo "  - Total fixes identified: $(jq '.metrics.totalFixes' agents/auto-fix/auto-fix-results/fix-report.json 2>/dev/null || echo 'N/A')"
    echo "  - Improvement score: $(jq '.metrics.improvementScore' agents/auto-fix/auto-fix-results/fix-report.json 2>/dev/null || echo 'N/A')/100"
    echo "  - Score improvement: $(jq '.improvementSummary.scoreIncrease // 0' agents/auto-fix/auto-fix-results/fix-report.json 2>/dev/null || echo 'N/A') points"
fi

echo ""
echo -e "${BLUE}🔮 Next Steps & CI/CD Integration:${NC}"
echo "1. 🚀 Push this to GitHub to trigger the CI/CD pipeline"
echo "2. 🔄 Both pipelines will run in parallel with 2 iterations each:"
echo "   - Standard Tests & Build"
echo "   - AI Testing Pipeline (2 iterations per agent)"
echo "3. 📊 Results will show iterative improvements in GitHub Actions"
echo "4. 💬 PR comments will include iteration comparison and improvements"
echo "5. 🚀 Deploy only happens when both pipelines succeed"
echo ""

echo -e "${BLUE}📁 Generated Reports Location:${NC}"
echo "🔗 Consolidated Final Report: $(pwd)/agents/pipeline-orchestrator/orchestration-results/"
echo "Test Results: $(pwd)/agents/test-generator/test-results/"
echo "Quality Analysis: $(pwd)/agents/quality-analyzer/quality-results/"
echo "Auto-Fix Analysis: $(pwd)/agents/auto-fix/auto-fix-results/"
echo ""

echo -e "${GREEN}🎉 AI Pipeline with 2 iterations test completed successfully!${NC}"
echo ""
echo -e "${YELLOW}💡 To explore the iteration results:${NC}"
echo "  - View consolidated final report: cat agents/pipeline-orchestrator/orchestration-results/consolidated-final-summary.md"
echo "  - View executive summary: cat agents/pipeline-orchestrator/orchestration-results/executive-summary.md"
echo "  - View test results: cat agents/test-generator/test-results/test-execution-summary.md"
echo "  - View quality analysis: cat agents/quality-analyzer/quality-results/quality-analysis-summary.md"
echo "  - View auto-fix analysis: cat agents/auto-fix/auto-fix-results/fix-report-summary.md"
echo ""
echo -e "${YELLOW}🔄 To see iteration improvements:${NC}"
echo "  - Check improvement summaries in each report"
echo "  - Compare metrics between iterations"
echo "  - Review trend analysis and recommendations"
echo ""

echo -e "${PURPLE}🤖 Your AI Testing Pipeline with 2 iterations is ready for CI/CD!${NC}"
echo "Push to GitHub to see both pipelines run in parallel with iterative improvements."