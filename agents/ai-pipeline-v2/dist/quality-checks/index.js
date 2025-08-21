"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityCheckRunner = void 0;
const eslint_1 = require("eslint");
async function runEslint(targetPath) {
    const eslint = new eslint_1.ESLint({ fix: true });
    const results = await eslint.lintFiles([`${targetPath}/**/*.{js,ts,tsx}`]);
    await eslint_1.ESLint.outputFixes(results);
    const issues = [];
    for (const result of results) {
        for (const message of result.messages) {
            issues.push({
                id: `${result.filePath}-${message.ruleId}-${message.line}-${message.column}`,
                type: message.severity === 2 ? 'error' : 'warning',
                severity: message.severity === 2 ? 'high' : 'medium',
                message: message.message,
                filePath: result.filePath,
                line: message.line,
                column: message.column,
                code: message.ruleId || '',
                category: 'eslint',
                fixable: Boolean(message.fix),
                confidence: 1,
                aiProvider: 'eslint',
                timestamp: new Date()
            });
        }
    }
    return issues;
}
class QualityCheckRunner {
    constructor(checkNames = []) {
        this.checks = [];
        if (checkNames.includes('eslint')) {
            this.checks.push({ name: 'eslint', run: runEslint });
        }
    }
    async run(targetPath) {
        let all = [];
        for (const check of this.checks) {
            try {
                const result = await check.run(targetPath);
                all = all.concat(result);
            }
            catch (err) {
                console.warn(`⚠️ Quality check ${check.name} failed: ${err}`);
            }
        }
        return all;
    }
}
exports.QualityCheckRunner = QualityCheckRunner;
//# sourceMappingURL=index.js.map