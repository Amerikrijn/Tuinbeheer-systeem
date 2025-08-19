import { OpenAIProvider } from '../core/providers/openai-provider';
import { CodeIssue, CodeFix, QualityValidation, AgentResult } from '../types';
export declare class QualityValidatorAgent {
    private provider;
    constructor(openaiProvider: OpenAIProvider);
    run(issues: CodeIssue[], fixes: CodeFix[]): Promise<AgentResult<QualityValidation>>;
    private validateFixes;
    private validateAIFix;
    private calculateQualityScore;
    private calculateRiskScore;
    private generateRecommendations;
    private parseAIResponse;
    private createResult;
}
//# sourceMappingURL=quality-validator.d.ts.map