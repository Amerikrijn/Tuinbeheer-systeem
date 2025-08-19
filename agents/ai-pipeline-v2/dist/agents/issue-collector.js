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
exports.IssueCollectorAgent = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob = __importStar(require("glob"));
const openai_provider_1 = require("../core/providers/openai-provider");
class IssueCollectorAgent {
    constructor(apiKey) {
        this.supportedExtensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.go', '.rs'];
        this.provider = new openai_provider_1.OpenAIProvider({ apiKey });
        this.isDemoMode = apiKey === 'demo-mode';
    }
    async run(targetPath = './src') {
        const startTime = Date.now();
        try {
            if (!this.isDemoMode && !this.provider.isAvailable) {
                throw new Error('OpenAI provider not available');
            }
            console.log('🔍 Issue Collector Agent starting...');
            console.log(`Target: ${targetPath}`);
            // Find all code files
            const files = this.findCodeFiles(targetPath);
            console.log(`Found ${files.length} code files`);
            // Analyze each file
            const allIssues = [];
            for (const file of files) {
                console.log(`Analyzing: ${file}`);
                const fileIssues = await this.analyzeFile(file);
                allIssues.push(...fileIssues);
            }
            const executionTime = Date.now() - startTime;
            console.log(`✅ Issue collection complete! Found ${allIssues.length} issues`);
            return {
                success: true,
                data: allIssues,
                executionTime,
                aiProvider: this.provider.name,
                timestamp: new Date()
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Issue collection failed: ${errorMessage}`);
            return {
                success: false,
                data: [],
                error: errorMessage,
                executionTime,
                aiProvider: this.provider.name,
                timestamp: new Date()
            };
        }
    }
    findCodeFiles(targetPath) {
        // Check if targetPath is a file or directory
        if (fs.statSync(targetPath).isFile()) {
            // Single file
            const ext = path.extname(targetPath).toLowerCase();
            if (this.supportedExtensions.includes(ext)) {
                return [targetPath];
            }
            return [];
        }
        // Directory - use glob pattern
        const pattern = path.join(targetPath, '**/*');
        const files = glob.sync(pattern, { nodir: true });
        return files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return this.supportedExtensions.includes(ext);
        });
    }
    async analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            if (this.isDemoMode) {
                // Use basic analysis in demo mode
                return this.performBasicAnalysis(filePath, lines);
            }
            else {
                // Analyze with AI
                const aiResponse = await this.provider.analyzeCode(content, filePath);
                // Parse AI response
                const parsedIssues = this.parseAIResponse(aiResponse, filePath, lines);
                return parsedIssues;
            }
        }
        catch (error) {
            console.warn(`Failed to analyze ${filePath}: ${error}`);
            return [];
        }
    }
    parseAIResponse(aiResponse, filePath, lines) {
        try {
            // Try to parse JSON response
            const parsed = JSON.parse(aiResponse);
            if (parsed.issues && Array.isArray(parsed.issues)) {
                return parsed.issues.map((issue, index) => ({
                    id: `issue-${filePath}-${index}-${Date.now()}`,
                    type: issue.type || 'warning',
                    severity: issue.severity || 'medium',
                    message: issue.message || 'Issue detected',
                    filePath,
                    line: issue.line || 1,
                    column: issue.column || 1,
                    code: lines[issue.line - 1] || '',
                    category: issue.category || 'quality',
                    fixable: issue.fixable !== false,
                    confidence: issue.confidence || 80,
                    aiProvider: this.provider.name,
                    timestamp: new Date()
                }));
            }
        }
        catch (error) {
            console.warn(`Failed to parse AI response: ${error}`);
        }
        // Fallback: basic analysis
        return this.performBasicAnalysis(filePath, lines);
    }
    performBasicAnalysis(filePath, lines) {
        const issues = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            // Basic pattern matching as fallback
            if (line && line.includes('console.log')) {
                issues.push({
                    id: `basic-${filePath}-${lineNumber}-${Date.now()}`,
                    type: 'warning',
                    severity: 'low',
                    message: 'Console.log statement found - consider removing in production',
                    filePath,
                    line: lineNumber,
                    column: 1,
                    code: line.trim(),
                    category: 'quality',
                    fixable: true,
                    confidence: 90,
                    aiProvider: 'basic-analysis',
                    timestamp: new Date()
                });
            }
            if (line && (line.includes('TODO:') || line.includes('FIXME:'))) {
                issues.push({
                    id: `basic-${filePath}-${lineNumber}-${Date.now()}`,
                    type: 'suggestion',
                    severity: 'medium',
                    message: 'TODO/FIXME comment found - consider addressing',
                    filePath,
                    line: lineNumber,
                    column: 1,
                    code: line.trim(),
                    category: 'quality',
                    fixable: false,
                    confidence: 85,
                    aiProvider: 'basic-analysis',
                    timestamp: new Date()
                });
            }
        }
        return issues;
    }
}
exports.IssueCollectorAgent = IssueCollectorAgent;
//# sourceMappingURL=issue-collector.js.map