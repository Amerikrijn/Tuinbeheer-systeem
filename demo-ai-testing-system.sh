#!/bin/bash

echo "🚀 AI-Powered Testing & Quality Analysis System Demo"
echo "======================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 Demo Overview:${NC}"
echo "This demo will showcase our AI-powered testing system with:"
echo "1. 🤖 Test Generator Agent - Automatically generates test scenarios"
echo "2. 🔍 Quality Analyzer Agent - Analyzes test results and quality"
echo "3. 📊 Comprehensive reporting and recommendations"
echo ""

echo -e "${YELLOW}📁 Current Directory:${NC} $(pwd)"
echo ""

# Step 1: Test Generation
echo -e "${GREEN}🔍 Step 1: Running Test Generator Agent${NC}"
echo "Analyzing login flow and generating test scenarios..."
echo ""

cd agents/test-generator

if [ -f "test-results/login-exploration.json" ]; then
    echo -e "${YELLOW}⚠️  Test results already exist. Cleaning up...${NC}"
    rm -rf test-results/*
fi

echo -e "${CYAN}🚀 Executing Test Generator Agent...${NC}"
npx ts-node cli.ts --path "../../app/auth/login" --strategy "full-path-coverage" --max-interactions 100

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Test Generation completed successfully!${NC}"
else
    echo -e "${RED}❌ Test Generation failed!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📊 Test Generation Results:${NC}"
if [ -f "test-results/login-exploration-summary.md" ]; then
    echo "Generated reports:"
    echo "  - login-exploration.json (Detailed results)"
    echo "  - login-exploration-summary.md (Human-readable summary)"
    echo "  - coverage-report.json (Coverage metrics)"
fi

echo ""

# Step 2: Quality Analysis
echo -e "${GREEN}🔍 Step 2: Running Quality Analyzer Agent${NC}"
echo "Analyzing test results and generating quality insights..."
echo ""

cd ../quality-analyzer

if [ -f "quality-results/quality-analysis.json" ]; then
    echo -e "${YELLOW}⚠️  Quality results already exist. Cleaning up...${NC}"
    rm -rf quality-results/*
fi

echo -e "${CYAN}🚀 Executing Quality Analyzer Agent...${NC}"
npx ts-node cli.ts --test-results "../test-generator/test-results/login-exploration.json" --test-scenarios "../test-generator/test-results/login-exploration.json"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Quality Analysis completed successfully!${NC}"
else
    echo -e "${RED}❌ Quality Analysis failed!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📊 Quality Analysis Results:${NC}"
if [ -f "quality-results/quality-analysis-summary.md" ]; then
    echo "Generated reports:"
    echo "  - quality-analysis.json (Detailed analysis)"
    echo "  - quality-analysis-summary.md (Human-readable summary)"
    echo "  - quality-metrics.json (Quality metrics)"
fi

echo ""

# Step 3: Display Summary
echo -e "${GREEN}📋 Step 3: System Summary${NC}"
echo "=================================================="

cd ../..

echo -e "${BLUE}🎯 What We've Accomplished:${NC}"
echo "✅ Built a complete AI-powered testing ecosystem"
echo "✅ Test Generator Agent automatically created test scenarios"
echo "✅ Quality Analyzer Agent provided detailed quality insights"
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

echo ""
echo -e "${BLUE}🔮 Next Steps & Future Enhancements:${NC}"
echo "1. 🚀 Auto-Fix Agent - Automatically fix identified issues"
echo "2. 🔄 Pipeline Orchestrator - Coordinate all agents"
echo "3. 📈 Continuous Learning - Improve based on historical data"
echo "4. 🎯 Integration with CI/CD - Automated quality gates"
echo "5. 🧠 Machine Learning - Enhanced test generation"
echo ""

echo -e "${BLUE}📁 Generated Reports Location:${NC}"
echo "Test Results: $(pwd)/agents/test-generator/test-results/"
echo "Quality Analysis: $(pwd)/agents/quality-analyzer/quality-results/"
echo ""

echo -e "${GREEN}🎉 Demo completed successfully!${NC}"
echo ""
echo -e "${YELLOW}💡 To explore the results:${NC}"
echo "  - View test results: cat agents/test-generator/test-results/login-exploration-summary.md"
echo "  - View quality analysis: cat agents/quality-analyzer/quality-results/quality-analysis-summary.md"
echo "  - Run individual agents: cd agents/test-generator && npx ts-node cli.ts --help"
echo ""

echo -e "${PURPLE}🤖 This is the future of automated testing!${NC}"
echo "AI-powered agents working together to ensure code quality and reliability."