"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIPipeline = void 0;
const issue_collector_1 = require("./agents/issue-collector");
const code_fixer_1 = require("./agents/code-fixer");
const test_generator_1 = require("./agents/test-generator");
const quality_validator_1 = require("./agents/quality-validator");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class AIPipeline {
    constructor(config, openaiApiKey) {
        this.config = config;
        this.issueCollector = new issue_collector_1.IssueCollectorAgent(openaiApiKey);
        this.codeFixer = new code_fixer_1.CodeFixerAgent(openaiApiKey);
        this.testGenerator = new test_generator_1.TestGeneratorAgent(openaiApiKey);
        this.qualityValidator = new quality_validator_1.QualityValidatorAgent(openaiApiKey);
        this.results = this.initializeResults();
        // Check if running in demo mode
        if (openaiApiKey === 'demo-mode') {
            console.log('🎭 Demo mode enabled - using mock data');
        }
    }
    async run(targetPath = './src') {
        const startTime = Date.now();
        console.log('🚀 AI Pipeline starting...');
        console.log(`Target: ${targetPath}`);
        console.log(`Max iterations: ${this.config.maxIterations}`);
        console.log(`Quality threshold: ${this.config.qualityThreshold}%`);
        console.log('');
        try {
            let iteration = 1;
            let currentQualityScore = 0;
            let totalIssuesFound = 0;
            let totalIssuesFixed = 0;
            let totalTestsGenerated = 0;
            // Continue loop until quality is perfect or max iterations reached
            while (currentQualityScore < this.config.qualityThreshold && iteration <= this.config.maxIterations) {
                console.log(`🔄 Iteration ${iteration}`);
                console.log('─'.repeat(50));
                // Step 1: Collect Issues
                console.log('🔍 Step 1: Collecting Issues...');
                const issueResult = await this.issueCollector.run(targetPath);
                if (!issueResult.success) {
                    throw new Error(`Issue collection failed: ${issueResult.error}`);
                }
                const issues = issueResult.data;
                totalIssuesFound += issues.length;
                console.log(`✅ Found ${issues.length} issues`);
                // Step 2: Calculate Quality Score
                currentQualityScore = this.calculateQualityScore(issues);
                console.log(`📊 Current quality score: ${currentQualityScore.toFixed(1)}%`);
                // Step 3: Generate Tests
                console.log('🧪 Step 2: Generating Tests...');
                const testResult = await this.testGenerator.run(issues);
                if (testResult.success) {
                    totalTestsGenerated += testResult.data.length;
                    console.log(`✅ Generated ${testResult.data.length} test suites`);
                }
                else {
                    console.warn(`⚠️ Test generation failed: ${testResult.error}`);
                }
                // Step 4: Fix Code
                console.log('🔧 Step 3: Fixing Code...');
                const fixResult = await this.codeFixer.run(issues);
                if (fixResult.success) {
                    totalIssuesFixed += fixResult.data.length;
                    console.log(`✅ Applied ${fixResult.data.length} fixes`);
                }
                else {
                    console.warn(`⚠️ Code fixing failed: ${fixResult.error}`);
                }
                // Step 5: Validate Fixes
                console.log('✅ Step 4: Validating Fixes...');
                const validationResult = await this.qualityValidator.run(issues, fixResult.success ? fixResult.data : []);
                if (validationResult.success) {
                    currentQualityScore = validationResult.data.score;
                    console.log(`✅ Validation complete - Quality Score: ${currentQualityScore.toFixed(1)}%`);
                }
                else {
                    console.warn(`⚠️ Validation failed: ${validationResult.error}`);
                }
                // Step 6: Check if we should continue
                if (currentQualityScore >= this.config.qualityThreshold) {
                    console.log('🎉 Quality threshold reached!');
                    break;
                }
                if (iteration >= this.config.maxIterations) {
                    console.log('⏰ Max iterations reached');
                    break;
                }
                // Step 7: Prepare for next iteration
                console.log('🔄 Preparing for next iteration...');
                await this.prepareNextIteration(targetPath);
                iteration++;
                console.log('');
            }
            // Final results
            const executionTime = Date.now() - startTime;
            this.results = {
                success: true,
                iterations: iteration - 1,
                finalQualityScore: currentQualityScore,
                issuesFound: totalIssuesFound,
                issuesFixed: totalIssuesFixed,
                testsGenerated: totalTestsGenerated,
                executionTime,
                errors: [],
                warnings: [],
                timestamp: new Date()
            };
            // Save results
            await this.saveResults();
            console.log('');
            console.log('🎯 Pipeline Complete!');
            console.log(`Iterations: ${this.results.iterations}`);
            console.log(`Final Quality: ${this.results.finalQualityScore.toFixed(1)}%`);
            console.log(`Issues Found: ${this.results.issuesFound}`);
            console.log(`Issues Fixed: ${this.results.issuesFixed}`);
            console.log(`Tests Generated: ${this.results.testsGenerated}`);
            console.log(`Execution Time: ${this.results.executionTime}ms`);
            return this.results;
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Pipeline failed: ${errorMessage}`);
            this.results = {
                success: false,
                iterations: 0,
                finalQualityScore: 0,
                issuesFound: 0,
                issuesFixed: 0,
                testsGenerated: 0,
                executionTime,
                errors: [errorMessage],
                warnings: [],
                timestamp: new Date()
            };
            await this.saveResults();
            return this.results;
        }
    }
    initializeResults() {
        return {
            success: false,
            iterations: 0,
            finalQualityScore: 0,
            issuesFound: 0,
            issuesFixed: 0,
            testsGenerated: 0,
            executionTime: 0,
            errors: [],
            warnings: [],
            timestamp: new Date()
        };
    }
    calculateQualityScore(issues) {
        if (issues.length === 0)
            return 100;
        // Calculate score based on issue severity and count
        let totalScore = 0;
        let maxScore = issues.length * 100;
        for (const issue of issues) {
            let issueScore = 100;
            // Reduce score based on severity
            switch (issue.severity) {
                case 'critical':
                    issueScore -= 80;
                    break;
                case 'high':
                    issueScore -= 60;
                    break;
                case 'medium':
                    issueScore -= 30;
                    break;
                case 'low':
                    issueScore -= 10;
                    break;
            }
            // Reduce score based on confidence
            issueScore -= (100 - issue.confidence) * 0.5;
            totalScore += Math.max(0, issueScore);
        }
        return Math.round((totalScore / maxScore) * 100);
    }
    // These placeholder functions have been replaced with real agent implementations
    async prepareNextIteration(targetPath) {
        // Placeholder: prepare for next iteration
        // This could include:
        // - Running tests
        // - Checking git status
        // - Preparing next batch of files
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
    }
    async saveResults() {
        const outputDir = this.config.outputPath;
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const resultsPath = path.join(outputDir, 'pipeline-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
        console.log(`📄 Results saved to: ${resultsPath}`);
    }
}
exports.AIPipeline = AIPipeline;
//# sourceMappingURL=pipeline.js.map