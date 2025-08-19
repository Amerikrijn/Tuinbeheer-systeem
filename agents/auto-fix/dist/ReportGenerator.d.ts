import { CodeAnalysis, CodeFix, FixReport } from './types';
export declare class ReportGenerator {
    constructor();
    generateReport(analysis: CodeAnalysis, fixes: CodeFix[], iterations: number): Promise<FixReport>;
    generateMarkdownReport(report: FixReport): string;
    private calculateSummary;
    private generateRecommendations;
    private groupIssuesByCategory;
    private groupFixesByCategory;
}
//# sourceMappingURL=ReportGenerator.d.ts.map