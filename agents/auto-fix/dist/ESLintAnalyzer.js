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
exports.ESLintAnalyzer = void 0;
const eslint_1 = require("eslint");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ESLintAnalyzer {
    constructor(configPath) {
        this.configPath = configPath || this.findESLintConfig();
        this.eslint = new eslint_1.ESLint({
            useEslintrc: true,
            configFile: this.configPath,
            fix: false,
            cache: true,
            cacheLocation: path.join(process.cwd(), '.eslintcache')
        });
    }
    async analyzeFile(filePath) {
        try {
            console.log(`🔍 Analyzing ${filePath} with ESLint...`);
            const results = await this.eslint.lintFiles([filePath]);
            const result = results[0];
            if (!result) {
                throw new Error(`No ESLint results for ${filePath}`);
            }
            const analysis = {
                results: [result],
                errorCount: result.errorCount,
                warningCount: result.warningCount,
                fixableErrorCount: result.fixableErrorCount,
                fixableWarningCount: result.fixableWarningCount,
                usedDeprecatedRules: result.usedDeprecatedRules || []
            };
            console.log(`✅ ESLint analysis complete: ${result.errorCount} errors, ${result.warningCount} warnings`);
            return analysis;
        }
        catch (error) {
            console.error(`❌ ESLint analysis failed for ${filePath}:`, error);
            throw error;
        }
    }
    async generateFixes(analysis) {
        const fixes = [];
        for (const result of analysis.results) {
            for (const message of result.messages) {
                if (message.fix) {
                    const fix = await this.generateFixForMessage(message, result.filePath);
                    if (fix) {
                        fixes.push(fix);
                    }
                }
            }
        }
        return fixes;
    }
    async generateFixForMessage(message, filePath) {
        if (!message.fix)
            return null;
        try {
            const sourceCode = fs.readFileSync(filePath, 'utf8');
            const fixedCode = this.applyESLintFix(sourceCode, message.fix);
            if (fixedCode === sourceCode)
                return null;
            return {
                id: `eslint-${message.ruleId}-${message.line}-${message.column}`,
                filePath,
                lineNumber: message.line,
                issueType: 'eslint',
                severity: this.mapSeverity(message.severity),
                description: message.message,
                originalCode: sourceCode.substring(message.fix.range[0], message.fix.range[1]),
                fixedCode: fixedCode.substring(message.fix.range[0], message.fix.range[1]),
                confidence: 0.95,
                validationRules: [{
                        type: 'eslint',
                        condition: 'ESLint rule passes after fix',
                        message: `Fix must resolve ESLint rule: ${message.ruleId}`
                    }],
                dependencies: [],
                estimatedEffort: 'low',
                risk: 'low',
                tags: ['eslint', message.ruleId || 'unknown'],
                createdAt: new Date().toISOString(),
                eslintRule: message.ruleId || undefined
            };
        }
        catch (error) {
            console.error(`Failed to generate fix for ESLint message:`, error);
            return null;
        }
    }
    applyESLintFix(sourceCode, fix) {
        const before = sourceCode.substring(0, fix.range[0]);
        const after = sourceCode.substring(fix.range[1]);
        return before + fix.text + after;
    }
    mapSeverity(severity) {
        switch (severity) {
            case 0: return 'low';
            case 1: return 'medium';
            case 2: return 'high';
            default: return 'low';
        }
    }
    findESLintConfig() {
        const possibleConfigs = [
            '.eslintrc.js',
            '.eslintrc.cjs',
            '.eslintrc.yaml',
            '.eslintrc.yml',
            '.eslintrc.json',
            'eslint.config.js'
        ];
        let currentDir = process.cwd();
        while (currentDir !== path.dirname(currentDir)) {
            for (const config of possibleConfigs) {
                const configPath = path.join(currentDir, config);
                if (fs.existsSync(configPath)) {
                    return configPath;
                }
            }
            currentDir = path.dirname(currentDir);
        }
        return path.join(process.cwd(), '.eslintrc.json');
    }
    dispose() {
        try {
            const cachePath = path.join(process.cwd(), '.eslintcache');
            if (fs.existsSync(cachePath)) {
                fs.unlinkSync(cachePath);
            }
        }
        catch (error) {
            // Ignore cleanup errors
        }
    }
}
exports.ESLintAnalyzer = ESLintAnalyzer;
//# sourceMappingURL=ESLintAnalyzer.js.map