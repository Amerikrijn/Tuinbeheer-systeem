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
exports.AutoFixAgent = void 0;
const CodeFixer_1 = require("./CodeFixer");
const Validator_1 = require("./Validator");
const ReportGenerator_1 = require("./ReportGenerator");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class AutoFixAgent {
    constructor(options) {
        this.options = options;
        this.codeFixer = new CodeFixer_1.CodeFixer();
        this.validator = new Validator_1.Validator();
        this.reportGenerator = new ReportGenerator_1.ReportGenerator();
        this.startTime = Date.now();
    }
    async run() {
        console.log('🔧 Starting Auto-Fix Agent...');
        console.log(`Target: ${this.options.filePath}`);
        console.log(`Max fixes: ${this.options.maxFixes}`);
        console.log('');
        try {
            // Validate target exists
            if (!fs.existsSync(this.options.filePath)) {
                throw new Error(`Target not found: ${this.options.filePath}`);
            }
            // Create output directory
            if (!fs.existsSync(this.options.outputPath)) {
                fs.mkdirSync(this.options.outputPath, { recursive: true });
            }
            let currentAnalysis;
            let currentFixes = [];
            let iteration = 1;
            // First iteration: Initial analysis and fix generation
            console.log(`🔄 Iteration ${iteration}: Initial Analysis`);
            currentAnalysis = await this.performAnalysis(this.options.filePath);
            currentFixes = await this.generateFixes(currentAnalysis);
            console.log(`📊 Found ${currentAnalysis.issues.length} issues`);
            console.log(`🔧 Generated ${currentFixes.length} fixes`);
            console.log('');
            // Second iteration: Apply fixes and re-analyze
            if (this.options.autoApply && currentFixes.length > 0) {
                iteration++;
                console.log(`🔄 Iteration ${iteration}: Apply Fixes`);
                const fixResults = await this.applyFixes(currentFixes, this.options.filePath);
                const appliedFixes = fixResults.filter(r => r.success);
                if (appliedFixes.length > 0) {
                    console.log(`✅ Applied ${appliedFixes.length} fixes`);
                    // Re-analyze after fixes
                    currentAnalysis = await this.performAnalysis(this.options.filePath);
                    currentFixes = await this.generateFixes(currentAnalysis);
                    console.log(`📊 After fixes: ${currentAnalysis.issues.length} issues remaining`);
                    console.log(`🔧 Additional fixes: ${currentFixes.length}`);
                }
            }
            // Generate final report
            const report = await this.generateReport(currentAnalysis, currentFixes, iteration);
            // Calculate metrics
            const metrics = this.calculateMetrics(currentAnalysis, currentFixes, iteration);
            console.log('');
            console.log('📊 Final Results:');
            console.log(`Total issues: ${metrics.totalIssues}`);
            console.log(`Fixes generated: ${metrics.fixesGenerated}`);
            console.log(`Quality improvement: ${metrics.qualityImprovement.toFixed(1)}%`);
            console.log(`Execution time: ${metrics.executionTime}ms`);
            return {
                success: true,
                analysis: currentAnalysis,
                fixes: currentFixes,
                metrics,
                message: 'Auto-fix analysis completed successfully'
            };
        }
        catch (error) {
            console.error('❌ Auto-fix failed:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                analysis: {},
                fixes: [],
                metrics: {},
                message: `Auto-fix failed: ${errorMessage}`
            };
        }
    }
    async performAnalysis(filePath) {
        console.log('🔍 Performing code analysis...');
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const issues = await this.codeFixer.analyzeCode(content, filePath, this.options);
        const fixes = await this.codeFixer.generateFixes(issues, this.options);
        return {
            filePath,
            issues,
            fixes,
            metrics: {
                totalLines: lines.length,
                totalIssues: issues.length,
                fixableIssues: issues.filter(i => i.fixable).length,
                securityIssues: issues.filter(i => i.category === 'security').length,
                performanceIssues: issues.filter(i => i.category === 'performance').length,
                qualityIssues: issues.filter(i => i.category === 'quality').length
            },
            timestamp: new Date()
        };
    }
    async generateFixes(analysis) {
        console.log('🔧 Generating fixes...');
        const fixes = await this.codeFixer.generateFixes(analysis.issues, this.options);
        // Limit to max fixes
        return fixes.slice(0, this.options.maxFixes);
    }
    async applyFixes(fixes, filePath) {
        console.log('⚡ Applying fixes...');
        const results = [];
        const content = fs.readFileSync(filePath, 'utf-8');
        for (const fix of fixes) {
            if (fix.autoApply && fix.risk === 'low') {
                try {
                    const result = await this.codeFixer.applyFix(fix, content, filePath);
                    results.push(result);
                    if (result.success) {
                        // Update file content for next fix
                        const newContent = this.applyFixToContent(content, fix);
                        fs.writeFileSync(filePath, newContent);
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    results.push({
                        success: false,
                        appliedFixes: [],
                        failedFixes: [fix],
                        rollbackRequired: false,
                        message: `Failed to apply fix: ${errorMessage}`
                    });
                }
            }
            else {
                results.push({
                    success: false,
                    appliedFixes: [],
                    failedFixes: [fix],
                    rollbackRequired: false,
                    message: 'Fix requires manual review or is too risky'
                });
            }
        }
        return results;
    }
    applyFixToContent(content, fix) {
        const lines = content.split('\n');
        const lineIndex = fix.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
            const line = lines[lineIndex];
            // Simple replacement - replace the exact pattern
            const newLine = line.replace(fix.before, fix.after);
            lines[lineIndex] = newLine;
        }
        return lines.join('\n');
    }
    async generateReport(analysis, fixes, iterations) {
        console.log('📋 Generating report...');
        const report = await this.reportGenerator.generateReport(analysis, fixes, iterations);
        // Save report
        const reportPath = path.join(this.options.outputPath, 'auto-fix-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        // Generate markdown report
        const markdownPath = path.join(this.options.outputPath, 'auto-fix-report.md');
        const markdown = this.reportGenerator.generateMarkdownReport(report);
        fs.writeFileSync(markdownPath, markdown);
        console.log(`📄 Report saved to: ${reportPath}`);
        console.log(`📄 Markdown saved to: ${markdownPath}`);
        return report;
    }
    calculateMetrics(analysis, fixes, iterations) {
        const endTime = Date.now();
        const executionTime = endTime - this.startTime;
        const totalIssues = analysis.metrics.totalIssues;
        const fixesGenerated = fixes.length;
        const fixesApplied = this.options.autoApply ? fixes.filter(f => f.risk === 'low').length : 0;
        // Calculate quality improvement based on issues resolved
        const qualityImprovement = totalIssues > 0 ? (fixesApplied / totalIssues) * 100 : 0;
        return {
            totalIssues,
            fixesGenerated,
            fixesApplied,
            qualityImprovement,
            executionTime,
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
        };
    }
}
exports.AutoFixAgent = AutoFixAgent;
//# sourceMappingURL=AutoFixAgent.js.map