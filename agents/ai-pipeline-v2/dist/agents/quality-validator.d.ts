import { CodeIssue, CodeFix, QualityValidation, AgentResult } from '../types';
export declare class QualityValidatorAgent {
    private provider;
    private isDemoMode;
    constructor(apiKey: string);
    run(issues: CodeIssue[], fixes: CodeFix[]): Promise<AgentResult<QualityValidation>>;
    private validateFixes;
    private validateDemoFix;
    private validateAIFix;
    private calculateQualityScore;
    private calculateRiskScore;
    private generateRecommendations;
    private parseAIResponse;
    private createResult;
}
//# sourceMappingURL=quality-validator.d.ts.map