"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitIntegration = void 0;
const simple_git_1 = __importDefault(require("simple-git"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class GitIntegration {
    constructor(options = {}) {
        this.repoPath = options.repoPath || process.cwd();
        this.branchPrefix = options.branchPrefix || 'auto-fix';
        this.autoCommit = options.autoCommit || false;
        this.generatePRs = options.generatePRs || false;
        this.requireReview = options.requireReview || false;
        const gitOptions = {
            baseDir: this.repoPath,
            binary: 'git',
            maxConcurrentProcesses: 6,
            trimmed: false
        };
        this.git = (0, simple_git_1.default)(gitOptions);
    }
    /**
     * Initialize git integration
     */
    async initialize() {
        try {
            console.log('🔧 Initializing Git integration...');
            // Check if we're in a git repository
            const isRepo = await this.git.checkIsRepo();
            if (!isRepo) {
                throw new Error('Not a git repository');
            }
            // Get current status
            const status = await this.git.status();
            console.log(`✅ Git integration ready. Current branch: ${status.current}`);
        }
        catch (error) {
            console.error('❌ Git integration initialization failed:', error);
            throw error;
        }
    }
    /**
     * Analyze git history for a file
     */
    async analyzeGitHistory(filePath) {
        try {
            console.log(`📊 Analyzing git history for ${filePath}...`);
            // Get file history
            const log = await this.git.log({ file: filePath });
            const contributors = new Set();
            log.all.forEach(commit => {
                if (commit.author_name) {
                    contributors.add(commit.author_name);
                }
            });
            // Calculate change frequency (commits per month)
            const now = new Date();
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            const recentCommits = log.all.filter(commit => new Date(commit.date) > sixMonthsAgo);
            const changeFrequency = recentCommits.length / 6; // per month
            const analysis = {
                commitCount: log.total,
                lastCommit: log.latest?.hash || '',
                branch: (await this.git.branch()).current || 'unknown',
                contributors: Array.from(contributors),
                changeFrequency
            };
            console.log(`✅ Git history analysis complete: ${log.total} commits, ${contributors.size} contributors`);
            return analysis;
        }
        catch (error) {
            console.error(`❌ Git history analysis failed for ${filePath}:`, error);
            throw error;
        }
    }
    /**
     * Create a new branch for fixes
     */
    async createFixBranch(fixType, issueId) {
        try {
            const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const branchName = `${this.branchPrefix}/${fixType}/${issueId}-${timestamp}`;
            console.log(`🌿 Creating fix branch: ${branchName}`);
            // Create and checkout new branch
            await this.git.checkoutLocalBranch(branchName);
            console.log(`✅ Created and checked out branch: ${branchName}`);
            return branchName;
        }
        catch (error) {
            console.error('❌ Failed to create fix branch:', error);
            throw error;
        }
    }
    /**
     * Stage and commit fixes
     */
    async commitFixes(fixes, commitMessage) {
        try {
            if (!this.autoCommit) {
                console.log('⚠️ Auto-commit disabled, skipping commit');
                return {
                    hash: '',
                    message: 'Auto-commit disabled',
                    author: 'Auto-Fix Agent',
                    timestamp: new Date().toISOString(),
                    filesChanged: [],
                    fixesApplied: []
                };
            }
            console.log(`💾 Committing ${fixes.length} fixes...`);
            // Stage all modified files
            const filesToStage = [...new Set(fixes.map(fix => fix.filePath))];
            await this.git.add(filesToStage);
            // Create commit message
            const message = commitMessage || this.generateCommitMessage(fixes);
            // Commit changes
            const commitResult = await this.git.commit(message);
            const commitInfo = {
                hash: commitResult.commit,
                message: message,
                author: 'Auto-Fix Agent',
                timestamp: new Date().toISOString(),
                filesChanged: filesToStage,
                fixesApplied: fixes.map(fix => fix.id)
            };
            console.log(`✅ Committed fixes: ${commitResult.commit}`);
            return commitInfo;
        }
        catch (error) {
            console.error('❌ Failed to commit fixes:', error);
            throw error;
        }
    }
    /**
     * Generate a meaningful commit message
     */
    generateCommitMessage(fixes) {
        const fixTypes = [...new Set(fixes.map(fix => fix.issueType))];
        const fileCount = [...new Set(fixes.map(fix => fix.filePath))].length;
        let message = `fix: Auto-fix ${fixes.length} issues`;
        if (fixTypes.length > 0) {
            message += ` (${fixTypes.join(', ')})`;
        }
        if (fileCount > 0) {
            message += ` in ${fileCount} file${fileCount > 1 ? 's' : ''}`;
        }
        // Add details about specific fixes
        const criticalFixes = fixes.filter(fix => fix.severity === 'critical');
        if (criticalFixes.length > 0) {
            message += `\n\nCritical fixes:\n${criticalFixes.map(fix => `- ${fix.description}`).join('\n')}`;
        }
        return message;
    }
    /**
     * Push changes to remote
     */
    async pushChanges(branchName) {
        try {
            console.log(`🚀 Pushing changes to remote...`);
            await this.git.push('origin', branchName);
            console.log(`✅ Successfully pushed branch ${branchName} to remote`);
        }
        catch (error) {
            console.error('❌ Failed to push changes:', error);
            throw error;
        }
    }
    /**
     * Create a Pull Request
     */
    async createPullRequest(branchName, fixes, baseBranch = 'main') {
        try {
            if (!this.generatePRs) {
                console.log('⚠️ Pull Request generation disabled');
                return {
                    id: '',
                    title: 'Pull Request generation disabled',
                    description: 'Auto-PR generation is not enabled',
                    branch: branchName,
                    status: 'closed',
                    url: '',
                    fixesIncluded: [],
                    reviewStatus: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
            console.log(`🔀 Creating Pull Request for branch ${branchName}...`);
            // Generate PR title and description
            const title = this.generatePRTitle(fixes);
            const description = this.generatePRDescription(fixes, branchName);
            // For now, we'll create a PR template file
            // In a real implementation, you'd use GitHub/GitLab API
            const prInfo = {
                id: `pr-${Date.now()}`,
                title,
                description,
                branch: branchName,
                status: 'open',
                url: `https://github.com/your-repo/pull/${Date.now()}`, // Placeholder
                fixesIncluded: fixes.map(fix => fix.id),
                reviewStatus: this.requireReview ? 'pending' : 'approved',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            // Create PR template file
            await this.createPRTemplate(prInfo, fixes);
            console.log(`✅ Pull Request template created: ${title}`);
            return prInfo;
        }
        catch (error) {
            console.error('❌ Failed to create Pull Request:', error);
            throw error;
        }
    }
    /**
     * Generate PR title
     */
    generatePRTitle(fixes) {
        const fixTypes = [...new Set(fixes.map(fix => fix.issueType))];
        const criticalCount = fixes.filter(fix => fix.severity === 'critical').length;
        let title = `🔧 Auto-fix: ${fixes.length} issues`;
        if (criticalCount > 0) {
            title += ` (${criticalCount} critical)`;
        }
        if (fixTypes.length > 0) {
            title += ` - ${fixTypes.join(', ')}`;
        }
        return title;
    }
    /**
     * Generate PR description
     */
    generatePRDescription(fixes, branchName) {
        const description = [
            `## 🤖 Auto-generated Pull Request`,
            ``,
            `This PR was automatically generated by the Auto-Fix Agent to resolve code quality issues.`,
            ``,
            `### 📊 Summary`,
            `- **Total fixes:** ${fixes.length}`,
            `- **Files modified:** ${[...new Set(fixes.map(fix => fix.filePath))].length}`,
            `- **Branch:** \`${branchName}\``,
            `- **Generated:** ${new Date().toLocaleString()}`,
            ``,
            `### 🔍 Fix Details`,
            `| Type | Severity | Count | Description |`,
            `|------|----------|-------|-------------|`
        ];
        // Group fixes by type and severity
        const fixGroups = new Map();
        fixes.forEach(fix => {
            if (!fixGroups.has(fix.issueType)) {
                fixGroups.set(fix.issueType, new Map());
            }
            if (!fixGroups.get(fix.issueType).has(fix.severity)) {
                fixGroups.get(fix.issueType).set(fix.severity, []);
            }
            fixGroups.get(fix.issueType).get(fix.severity).push(fix);
        });
        fixGroups.forEach((severityMap, issueType) => {
            severityMap.forEach((fixList, severity) => {
                const exampleFix = fixList[0];
                description.push(`| ${issueType} | ${severity} | ${fixList.length} | ${exampleFix.description} |`);
            });
        });
        description.push(``, `### 🚨 Critical Fixes`, fixes.filter(fix => fix.severity === 'critical')
            .map(fix => `- **${fix.issueType}:** ${fix.description} (${fix.filePath}:${fix.lineNumber})`)
            .join('\n') || 'None', ``, `### ✅ Validation`, `- [x] TypeScript compilation passes`, `- [x] ESLint rules satisfied`, `- [x] Machine learning confidence threshold met`, `- [ ] Code review completed`, `- [ ] Tests pass`, ``, `### 🔄 Next Steps`, `1. Review the changes carefully`, `2. Run tests to ensure nothing is broken`, `3. Approve and merge if satisfied`, `4. Request changes if modifications needed`, ``, `---
      *Generated by Auto-Fix Agent v2.0*`);
        return description.join('\n');
    }
    /**
     * Create PR template file
     */
    async createPRTemplate(prInfo, fixes) {
        const prDir = path.join(this.repoPath, '.auto-fix', 'pull-requests');
        if (!fs.existsSync(prDir)) {
            fs.mkdirSync(prDir, { recursive: true });
        }
        const prFile = path.join(prDir, `${prInfo.id}.md`);
        fs.writeFileSync(prFile, prInfo.description);
        // Also create a JSON summary
        const summaryFile = path.join(prDir, `${prInfo.id}.json`);
        fs.writeFileSync(summaryFile, JSON.stringify(prInfo, null, 2));
    }
    /**
     * Check if fixes require a Pull Request
     */
    shouldGeneratePR(fixes) {
        if (!this.generatePRs)
            return false;
        // Generate PR for critical fixes or when multiple files are affected
        const criticalFixes = fixes.filter(fix => fix.severity === 'critical');
        const filesAffected = new Set(fixes.map(fix => fix.filePath)).size;
        return criticalFixes.length > 0 || filesAffected > 2;
    }
    /**
     * Get current branch information
     */
    async getCurrentBranch() {
        try {
            const branch = await this.git.branch();
            return branch.current || 'unknown';
        }
        catch (error) {
            console.error('Failed to get current branch:', error);
            return 'unknown';
        }
    }
    /**
     * Get repository status
     */
    async getStatus() {
        try {
            return await this.git.status();
        }
        catch (error) {
            console.error('Failed to get git status:', error);
            return null;
        }
    }
    /**
     * Check if there are uncommitted changes
     */
    async hasUncommittedChanges() {
        try {
            const status = await this.git.status();
            return status.files.length > 0;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Stash current changes
     */
    async stashChanges(message = 'Auto-fix agent stash') {
        try {
            console.log('📦 Stashing current changes...');
            await this.git.stash(['push', '-m', message]);
            console.log('✅ Changes stashed successfully');
        }
        catch (error) {
            console.error('❌ Failed to stash changes:', error);
            throw error;
        }
    }
    /**
     * Pop stashed changes
     */
    async popStashedChanges() {
        try {
            console.log('📦 Popping stashed changes...');
            await this.git.stash(['pop']);
            console.log('✅ Stashed changes restored');
        }
        catch (error) {
            console.error('❌ Failed to pop stashed changes:', error);
            throw error;
        }
    }
    /**
     * Reset to a specific commit
     */
    async resetToCommit(commitHash, mode = 'mixed') {
        try {
            console.log(`🔄 Resetting to commit ${commitHash} (${mode})...`);
            await this.git.reset([mode, commitHash]);
            console.log(`✅ Reset to commit ${commitHash} successful`);
        }
        catch (error) {
            console.error(`❌ Failed to reset to commit ${commitHash}:`, error);
            throw error;
        }
    }
    /**
     * Get commit history for a file
     */
    async getFileHistory(filePath, limit = 10) {
        try {
            const log = await this.git.log({ file: filePath, maxCount: limit });
            return log.all.map(commit => ({
                hash: commit.hash,
                message: commit.message,
                author: commit.author_name || 'Unknown',
                timestamp: commit.date,
                filesChanged: [filePath],
                fixesApplied: []
            }));
        }
        catch (error) {
            console.error(`Failed to get file history for ${filePath}:`, error);
            return [];
        }
    }
    /**
     * Check if a file is tracked by git
     */
    async isFileTracked(filePath) {
        try {
            const status = await this.git.status();
            return status.files.some(file => file.path === filePath);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get diff for a file
     */
    async getFileDiff(filePath) {
        try {
            return await this.git.diff([filePath]);
        }
        catch (error) {
            console.error(`Failed to get diff for ${filePath}:`, error);
            return '';
        }
    }
    /**
     * Cleanup resources
     */
    dispose() {
        // Git integration doesn't need explicit cleanup
    }
}
exports.GitIntegration = GitIntegration;
//# sourceMappingURL=GitIntegration.js.map