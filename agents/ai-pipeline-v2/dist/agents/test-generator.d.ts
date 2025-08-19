import { CodeIssue, TestSuite, AgentResult } from '../types';
export declare class TestGeneratorAgent {
    private provider;
    private isDemoMode;
    private outputDir;
    constructor(apiKey: string);
    run(issues: CodeIssue[]): Promise<AgentResult<TestSuite[]>>;
    private generateTestSuite;
    private generateTestCase;
    private generateDemoTestCase;
    private generatePatternBasedTest;
    private saveTestSuite;
    private generateTestFileContent;
    private groupIssuesByFile;
    private createOutputDirectory;
    private buildTestPrompt;
    private parseAIResponse;
    private createResult;
}
//# sourceMappingURL=test-generator.d.ts.map