import { IntegrationResults, SonarQubeConfig, CodeClimateConfig, GitHubConfig, GitLabConfig } from './types';
export declare class ExternalToolIntegration {
    private sonarQubeConfig;
    private codeClimateConfig;
    private githubConfig;
    private gitlabConfig;
    constructor(config?: {
        sonarQube?: SonarQubeConfig;
        codeClimate?: CodeClimateConfig;
        github?: GitHubConfig;
        gitlab?: GitLabConfig;
    });
    /**
     * Analyze code with all enabled external tools
     */
    analyzeWithExternalTools(filePath: string): Promise<IntegrationResults>;
    /**
     * Analyze code with SonarQube
     */
    private analyzeWithSonarQube;
    /**
     * Analyze code with CodeClimate
     */
    private analyzeWithCodeClimate;
    /**
     * Analyze code with GitHub
     */
    private analyzeWithGitHub;
    /**
     * Analyze code with GitLab
     */
    private analyzeWithGitLab;
    /**
     * Save SonarQube results to file
     */
    private saveSonarQubeResults;
    /**
     * Save CodeClimate results to file
     */
    private saveCodeClimateResults;
    /**
     * Save GitHub results to file
     */
    private saveGitHubResults;
    /**
     * Save GitLab results to file
     */
    private saveGitLabResults;
    /**
     * Get quality score from all tools
     */
    getOverallQualityScore(results: IntegrationResults): Promise<number>;
    /**
     * Calculate SonarQube quality score
     */
    private calculateSonarQubeScore;
    /**
     * Calculate CodeClimate quality score
     */
    private calculateCodeClimateScore;
    /**
     * Calculate GitHub quality score
     */
    private calculateGitHubScore;
    /**
     * Calculate GitLab quality score
     */
    private calculateGitLabScore;
    /**
     * Generate quality report from all tools
     */
    generateQualityReport(results: IntegrationResults): Promise<string>;
    /**
     * Generate critical recommendations
     */
    private generateCriticalRecommendations;
    /**
     * Generate improvement suggestions
     */
    private generateImprovementSuggestions;
    /**
     * Cleanup resources
     */
    dispose(): void;
}
//# sourceMappingURL=ExternalToolIntegration.d.ts.map