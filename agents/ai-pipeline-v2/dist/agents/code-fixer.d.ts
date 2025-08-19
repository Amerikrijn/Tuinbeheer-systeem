import { CodeIssue, CodeFix, AgentResult } from '../types';
export declare class CodeFixerAgent {
    private provider;
    private isDemoMode;
    private backupDir;
    constructor(apiKey: string);
    run(issues: CodeIssue[]): Promise<AgentResult<CodeFix[]>>;
    private generateFix;
    private generateDemoFix;
    private generatePatternBasedFix;
    private applyFix;
    private createBackupDirectory;
    private createFileBackup;
    private buildFixPrompt;
    private parseAIResponse;
    private createResult;
}
//# sourceMappingURL=code-fixer.d.ts.map