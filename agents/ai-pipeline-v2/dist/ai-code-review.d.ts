export interface CodeReviewResult {
    success: boolean;
    review: string;
    filesReviewed: number;
    issuesFound: number;
    suggestions: string[];
    qualityScore: number;
    timestamp: Date;
    error?: string;
}
export declare class AICodeReviewAgent {
    private octokit;
    private openai;
    private owner;
    private repo;
    private prNumber;
    private model;
    constructor(githubToken: string, openaiApiKey: string, repo: string, prNumber: number);
    run(): Promise<CodeReviewResult>;
    private fetchChangedFiles;
    private generateDiffs;
    private performAIReview;
    private analyzeReview;
    postReviewToPR(review: string): Promise<void>;
}
//# sourceMappingURL=ai-code-review.d.ts.map