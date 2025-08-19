import { GitHistoryAnalysis, GitCommitInfo, PullRequestInfo, CodeFix } from './types';
export declare class GitIntegration {
    private git;
    private repoPath;
    private branchPrefix;
    private autoCommit;
    private generatePRs;
    private requireReview;
    constructor(options?: {
        repoPath?: string;
        branchPrefix?: string;
        autoCommit?: boolean;
        generatePRs?: boolean;
        requireReview?: boolean;
    });
    /**
     * Initialize git integration
     */
    initialize(): Promise<void>;
    /**
     * Analyze git history for a file
     */
    analyzeGitHistory(filePath: string): Promise<GitHistoryAnalysis>;
    /**
     * Create a new branch for fixes
     */
    createFixBranch(fixType: string, issueId: string): Promise<string>;
    /**
     * Stage and commit fixes
     */
    commitFixes(fixes: CodeFix[], commitMessage?: string): Promise<GitCommitInfo>;
    /**
     * Generate a meaningful commit message
     */
    private generateCommitMessage;
    /**
     * Push changes to remote
     */
    pushChanges(branchName: string): Promise<void>;
    /**
     * Create a Pull Request
     */
    createPullRequest(branchName: string, fixes: CodeFix[], baseBranch?: string): Promise<PullRequestInfo>;
    /**
     * Generate PR title
     */
    private generatePRTitle;
    /**
     * Generate PR description
     */
    private generatePRDescription;
    /**
     * Create PR template file
     */
    private createPRTemplate;
    /**
     * Check if fixes require a Pull Request
     */
    shouldGeneratePR(fixes: CodeFix[]): boolean;
    /**
     * Get current branch information
     */
    getCurrentBranch(): Promise<string>;
    /**
     * Get repository status
     */
    getStatus(): Promise<any>;
    /**
     * Check if there are uncommitted changes
     */
    hasUncommittedChanges(): Promise<boolean>;
    /**
     * Stash current changes
     */
    stashChanges(message?: string): Promise<void>;
    /**
     * Pop stashed changes
     */
    popStashedChanges(): Promise<void>;
    /**
     * Reset to a specific commit
     */
    resetToCommit(commitHash: string, mode?: 'soft' | 'mixed' | 'hard'): Promise<void>;
    /**
     * Get commit history for a file
     */
    getFileHistory(filePath: string, limit?: number): Promise<GitCommitInfo[]>;
    /**
     * Check if a file is tracked by git
     */
    isFileTracked(filePath: string): Promise<boolean>;
    /**
     * Get diff for a file
     */
    getFileDiff(filePath: string): Promise<string>;
    /**
     * Cleanup resources
     */
    dispose(): void;
}
//# sourceMappingURL=GitIntegration.d.ts.map