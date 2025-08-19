import { OpenAIProvider } from '../core/providers/openai-provider';
import { CodeIssue, CodeFix, AgentResult } from '../types';
export declare class CodeFixerAgent {
    private provider;
    private backupDir;
    constructor(openaiProvider: OpenAIProvider);
    run(issues: CodeIssue[]): Promise<AgentResult<CodeFix[]>>;
    private generateFix;
    private generatePatternBasedFix;
    private applyFix;
    private createBackupDirectory;
    private createFileBackup;
    private buildFixPrompt;
    private parseAIResponse;
    private createResult;
}
//# sourceMappingURL=code-fixer.d.ts.map