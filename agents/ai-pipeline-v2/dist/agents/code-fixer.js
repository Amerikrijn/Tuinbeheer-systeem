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
exports.CodeFixerAgent = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const openai_provider_1 = require("../core/providers/openai-provider");
class CodeFixerAgent {
    constructor(apiKey) {
        this.provider = new openai_provider_1.OpenAIProvider({ apiKey });
        this.isDemoMode = apiKey === 'demo-mode';
        this.backupDir = './ai-pipeline-backups';
    }
    async run(issues) {
        const startTime = Date.now();
        try {
            console.log('🔧 Code Fixer Agent starting...');
            console.log(`Issues to process: ${issues.length}`);
            // Filter fixable issues
            const fixableIssues = issues.filter(issue => issue.fixable);
            console.log(`Fixable issues: ${fixableIssues.length}`);
            if (fixableIssues.length === 0) {
                console.log('✅ No fixable issues found');
                return this.createResult([], startTime);
            }
            // Create backup directory
            await this.createBackupDirectory();
            // Process each fixable issue
            const fixes = [];
            const maxFixesPerIteration = 5;
            let fixesApplied = 0;
            for (const issue of fixableIssues) {
                if (fixesApplied >= maxFixesPerIteration) {
                    console.log(`⏸️ Max fixes per iteration reached (${maxFixesPerIteration})`);
                    break;
                }
                try {
                    console.log(`🔧 Processing issue: ${issue.message} (${issue.filePath}:${issue.line})`);
                    const fix = await this.generateFix(issue);
                    if (fix && fix.confidence > 70) {
                        const success = await this.applyFix(fix);
                        if (success) {
                            fixes.push(fix);
                            fixesApplied++;
                            console.log(`✅ Fix applied successfully: ${fix.description}`);
                        }
                    }
                }
                catch (error) {
                    console.warn(`⚠️ Failed to process issue: ${error}`);
                }
            }
            const executionTime = Date.now() - startTime;
            console.log(`✅ Code fixing complete! Applied ${fixes.length} fixes`);
            return this.createResult(fixes, startTime, executionTime);
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Code fixing failed: ${errorMessage}`);
            return this.createResult([], startTime, executionTime, errorMessage);
        }
    }
    async generateFix(issue) {
        if (this.isDemoMode) {
            return this.generateDemoFix(issue);
        }
        try {
            // Read the file content
            const fileContent = fs.readFileSync(issue.filePath, 'utf-8');
            const lines = fileContent.split('\n');
            // Get the problematic line
            const problemLine = lines[issue.line - 1];
            if (!problemLine)
                return null;
            // Generate AI fix
            const aiResponse = await this.provider.callAPI(this.buildFixPrompt(issue, problemLine, fileContent), { role: 'code-fixer' });
            // Parse AI response
            const parsedFix = this.parseAIResponse(aiResponse, issue, problemLine);
            if (parsedFix) {
                return parsedFix;
            }
            // Fallback to pattern-based fix
            return this.generatePatternBasedFix(issue, problemLine);
        }
        catch (error) {
            console.warn(`Failed to generate AI fix: ${error}`);
            return this.generatePatternBasedFix(issue, '');
        }
    }
    generateDemoFix(issue) {
        // Demo mode: generate realistic-looking fixes
        const fixId = `fix-${issue.id}-${Date.now()}`;
        let before = issue.code;
        let after = issue.code;
        let description = 'Demo fix generated';
        // Apply demo fixes based on issue type
        switch (issue.category) {
            case 'security':
            case 'quality':
                if (issue.message.includes('console.log')) {
                    // Simple fix: comment out the console.log
                    before = 'console.log';
                    after = '// console.log';
                    description = 'Commented out console.log for security';
                    console.log(`🔧 Demo fix: before="${before}", after="${after}"`);
                }
                else if (issue.message.includes('TODO')) {
                    before = issue.code;
                    after = issue.code.replace('TODO:', '// TODO:');
                    description = 'Formatted TODO comment';
                }
                break;
            case 'performance':
                if (issue.message.includes('var ')) {
                    before = issue.code;
                    after = issue.code.replace('var ', 'const ');
                    description = 'Changed var to const for better performance';
                }
                break;
            case 'typescript':
                if (issue.message.includes(': any')) {
                    before = issue.code;
                    after = issue.code.replace(': any', ': unknown');
                    description = 'Changed any to unknown for type safety';
                }
                break;
        }
        return {
            id: fixId,
            issueId: issue.id,
            description,
            before,
            after,
            filePath: issue.filePath,
            line: issue.line,
            column: issue.column,
            risk: 'low',
            confidence: 85,
            category: issue.category,
            aiProvider: 'demo-mode',
            autoApply: true,
            timestamp: new Date()
        };
    }
    generatePatternBasedFix(issue, problemLine) {
        // Pattern-based fixes as fallback
        const fixId = `pattern-fix-${issue.id}-${Date.now()}`;
        let before = problemLine;
        let after = problemLine;
        let description = 'Pattern-based fix';
        // Common patterns
        if (problemLine.includes('console.log')) {
            after = '// ' + problemLine + ' // Removed for production';
            description = 'Commented out console.log';
        }
        else if (problemLine.includes('var ')) {
            after = problemLine.replace('var ', 'const ');
            description = 'Changed var to const';
        }
        else if (problemLine.includes('TODO:')) {
            after = problemLine.replace('TODO:', '// TODO:');
            description = 'Formatted TODO comment';
        }
        else if (problemLine.includes(': any')) {
            after = problemLine.replace(': any', ': unknown');
            description = 'Changed any to unknown';
        }
        else {
            return null; // No pattern match
        }
        return {
            id: fixId,
            issueId: issue.id,
            description,
            before,
            after,
            filePath: issue.filePath,
            line: issue.line,
            column: issue.column,
            risk: 'low',
            confidence: 75,
            category: issue.category,
            aiProvider: 'pattern-based',
            autoApply: true,
            timestamp: new Date()
        };
    }
    async applyFix(fix) {
        try {
            // Create backup
            await this.createFileBackup(fix.filePath);
            // Read file
            const fileContent = fs.readFileSync(fix.filePath, 'utf-8');
            const lines = fileContent.split('\n');
            // Apply fix
            const targetLine = lines[fix.line - 1];
            if (targetLine) {
                // Simple string replacement
                let newLine = targetLine;
                if (targetLine.includes(fix.before)) {
                    newLine = targetLine.replace(fix.before, fix.after);
                    console.log(`🔧 Replacing "${fix.before}" with "${fix.after}"`);
                }
                lines[fix.line - 1] = newLine;
                // Write back to file
                const newContent = lines.join('\n');
                fs.writeFileSync(fix.filePath, newContent, 'utf-8');
                console.log(`✅ Fix applied to ${fix.filePath}:${fix.line}`);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error(`❌ Failed to apply fix: ${error}`);
            return false;
        }
    }
    async createBackupDirectory() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }
    async createFileBackup(filePath) {
        try {
            const fileName = path.basename(filePath);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(this.backupDir, `${fileName}.${timestamp}.backup`);
            fs.copyFileSync(filePath, backupPath);
            console.log(`💾 Backup created: ${backupPath}`);
        }
        catch (error) {
            console.warn(`⚠️ Failed to create backup: ${error}`);
        }
    }
    buildFixPrompt(issue, problemLine, fileContent) {
        return `Fix the following code issue:

Issue: ${issue.message}
Category: ${issue.category}
Severity: ${issue.severity}
File: ${issue.filePath}
Line: ${problemLine}

Context (surrounding code):
${fileContent}

Please provide a JSON response with:
- description: what the fix does
- before: the problematic code
- after: the fixed code
- risk: low/medium/high
- confidence: 0-100
- category: the issue category

Focus on making the code more secure, performant, and maintainable.`;
    }
    parseAIResponse(aiResponse, issue, problemLine) {
        try {
            const parsed = JSON.parse(aiResponse);
            if (parsed.after && parsed.description) {
                return {
                    id: `ai-fix-${issue.id}-${Date.now()}`,
                    issueId: issue.id,
                    description: parsed.description,
                    before: parsed.before || problemLine,
                    after: parsed.after,
                    filePath: issue.filePath,
                    line: issue.line,
                    column: issue.column,
                    risk: parsed.risk || 'medium',
                    confidence: parsed.confidence || 80,
                    category: issue.category,
                    aiProvider: this.provider.name,
                    autoApply: true,
                    timestamp: new Date()
                };
            }
        }
        catch (error) {
            console.warn(`Failed to parse AI response: ${error}`);
        }
        return null;
    }
    createResult(fixes, startTime, executionTime, error) {
        const finalExecutionTime = executionTime || Date.now() - startTime;
        const result = {
            success: !error,
            data: fixes,
            executionTime: finalExecutionTime,
            aiProvider: this.provider.name,
            timestamp: new Date()
        };
        if (error) {
            result.error = error;
        }
        return result;
    }
}
exports.CodeFixerAgent = CodeFixerAgent;
//# sourceMappingURL=code-fixer.js.map