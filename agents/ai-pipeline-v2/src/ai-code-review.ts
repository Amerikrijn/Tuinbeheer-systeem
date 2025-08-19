import { Octokit } from "@octokit/rest";
import OpenAI from "openai";
import * as fs from 'fs';
import * as path from 'path';

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

export class AICodeReviewAgent {
  private octokit: Octokit;
  private openai: OpenAI;
  private owner: string;
  private repo: string;
  private prNumber: number;
  private model: string;

  constructor(githubToken: string, openaiApiKey: string, repo: string, prNumber: number) {
    this.octokit = new Octokit({ auth: githubToken });
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.model = "gpt-4o-mini";
    
    const [owner, repoName] = repo.split("/");
    this.owner = owner;
    this.repo = repoName;
    this.prNumber = prNumber;
  }

  async run(): Promise<CodeReviewResult> {
    try {
      console.log("🚀 Starting AI Code Quality Review...");
      console.log(`📁 Repository: ${this.owner}/${this.repo}`);
      console.log(`🔢 PR Number: ${this.prNumber}`);

      // Fetch changed files
      const changedFiles = await this.fetchChangedFiles();
      if (!changedFiles.length) {
        console.log("ℹ️ No files changed in this PR");
        return {
          success: true,
          review: "No files changed in this PR",
          filesReviewed: 0,
          issuesFound: 0,
          suggestions: [],
          qualityScore: 100,
          timestamp: new Date()
        };
      }

      console.log(`📝 Found ${changedFiles.length} changed files`);

      // Generate diffs for analysis
      const diffs = this.generateDiffs(changedFiles);
      console.log(`🔍 Generated diffs for analysis (${diffs.length} characters)`);

      // Perform AI code review
      const aiReview = await this.performAIReview(diffs);
      console.log("✅ AI review completed");

      // Analyze review for metrics
      const analysis = this.analyzeReview(aiReview, changedFiles.length);

      const result: CodeReviewResult = {
        success: true,
        review: aiReview,
        filesReviewed: changedFiles.length,
        issuesFound: analysis.issuesFound,
        suggestions: analysis.suggestions,
        qualityScore: analysis.qualityScore,
        timestamp: new Date()
      };

      console.log(`📊 Review Summary: ${analysis.issuesFound} issues found, Quality Score: ${analysis.qualityScore}/100`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ AI Code Review failed: ${errorMessage}`);
      
      return {
        success: false,
        review: "",
        filesReviewed: 0,
        issuesFound: 0,
        suggestions: [],
        qualityScore: 0,
        timestamp: new Date(),
        error: errorMessage
      };
    }
  }

  private async fetchChangedFiles(): Promise<any[]> {
    const files = [];
    let page = 1;
    
    while (true) {
      const { data } = await this.octokit.pulls.listFiles({
        owner: this.owner,
        repo: this.repo,
        pull_number: this.prNumber,
        per_page: 100,
        page,
      });
      
      files.push(...data);
      
      if (data.length < 100) break;
      page++;
    }
    
    return files;
  }

  private generateDiffs(changedFiles: any[]): string {
    const diffs = changedFiles
      .filter(f => f.patch)
      .map(f => `FILE: ${f.filename}\n${f.patch}`)
      .join("\n\n");
    
    // Limit to 32k characters to stay within API limits
    return diffs.slice(0, 32000);
  }

  private async performAIReview(diffs: string): Promise<string> {
    const prompt = `You are an expert code quality assistant specializing in TypeScript, React, and Next.js applications.

Review the following Git diff snippets and provide constructive, actionable feedback:

${diffs}

Please provide a comprehensive code review that includes:

1. **Code Quality Issues**: Identify any code quality problems, anti-patterns, or areas for improvement
2. **Security Concerns**: Highlight any potential security vulnerabilities or unsafe practices
3. **Performance Optimizations**: Suggest performance improvements where applicable
4. **Best Practices**: Recommend modern React/TypeScript best practices
5. **Testing Suggestions**: Suggest tests that should be added or improved
6. **Documentation**: Note areas where documentation could be improved

Format your response in clear sections with actionable recommendations. Be specific and constructive.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: "You are an expert code reviewer specializing in TypeScript, React, and Next.js applications. Provide constructive, actionable feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content || "No review generated";
  }

  private analyzeReview(review: string, filesCount: number): { issuesFound: number; suggestions: string[]; qualityScore: number } {
    // Simple analysis - count issues and suggestions
    const issuesFound = (review.match(/issue|problem|bug|vulnerability|concern/gi) || []).length;
    const suggestions = review.split('\n').filter(line => 
      line.includes('suggest') || line.includes('recommend') || line.includes('consider') || line.includes('should')
    );

    // Calculate quality score based on issues found
    let qualityScore = 100;
    if (issuesFound > 0) {
      qualityScore = Math.max(0, 100 - (issuesFound * 10));
    }

    return {
      issuesFound,
      suggestions: suggestions.slice(0, 10), // Limit to 10 suggestions
      qualityScore
    };
  }

  async postReviewToPR(review: string): Promise<void> {
    try {
      const body = `<!-- ai-code-quality-review -->
# 🤖 AI Code Quality Review

${review}

---
*This review was automatically generated by AI Pipeline v2.0 using OpenAI GPT-4*`;

      await this.octokit.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: this.prNumber,
        body,
      });

      console.log("✅ Posted AI code review to PR");
    } catch (error) {
      console.error(`❌ Failed to post review to PR: ${error}`);
      throw error;
    }
  }
}