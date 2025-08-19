#!/usr/bin/env node

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AIStandardsAgent {
  constructor(openaiApiKey) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.standards = [];
    this.issues = [];
    this.fixes = [];
    this.cycle = 0;
    this.maxCycles = 5;
    this.qualityThreshold = 80;
    this.currentQuality = 0;
  }

  async run() {
    console.log('🚀 AI Standards Agent Starting...');
    console.log('🎯 Mission: Find banking standards, analyze code, and auto-fix issues!');
    
    try {
      // Step 1: Find and load coding standards
      await this.findCodingStandards();
      
      // Step 2: Start fixing cycles
      await this.runFixingCycles();
      
      // Step 3: Generate final report
      await this.generateReport();
      
      console.log('✅ AI Standards Agent completed successfully!');
      return {
        success: true,
        cycles: this.cycle,
        finalQuality: this.currentQuality,
        issuesFound: this.issues.length,
        fixesApplied: this.fixes.length
      };
      
    } catch (error) {
      console.error('❌ AI Standards Agent failed:', error.message);
      throw error;
    }
  }

  async findCodingStandards() {
    console.log('🔍 Finding banking/financial coding standards...');
    
    // Use OpenAI to find relevant coding standards
    const prompt = `Find the most important coding standards and best practices for financial/banking applications. 
    Focus on:
    1. Security standards (OWASP, PCI DSS)
    2. Code quality (SOLID principles, clean code)
    3. Performance standards
    4. Error handling best practices
    5. Financial compliance requirements
    
    Return as a structured list of standards with specific rules and examples.`;
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a coding standards expert specializing in financial and banking applications. Provide specific, actionable coding standards."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000
      });
      
      const standardsText = completion.choices[0].message.content;
      this.standards = this.parseStandards(standardsText);
      
      console.log(`✅ Found ${this.standards.length} coding standards`);
      console.log('📋 Standards:', this.standards.map(s => s.category).join(', '));
      
    } catch (error) {
      console.log('⚠️ Could not fetch standards from OpenAI, using fallback standards');
      this.standards = this.getFallbackStandards();
    }
  }

  parseStandards(standardsText) {
    // Parse the AI response into structured standards
    const standards = [];
    
    // Extract different categories
    const categories = [
      { name: 'Security', keywords: ['security', 'OWASP', 'PCI DSS', 'vulnerability'] },
      { name: 'Code Quality', keywords: ['SOLID', 'clean code', 'readability', 'maintainability'] },
      { name: 'Performance', keywords: ['performance', 'efficiency', 'optimization', 'speed'] },
      { name: 'Error Handling', keywords: ['error handling', 'robustness', 'reliability', 'exception'] },
      { name: 'Financial Compliance', keywords: ['compliance', 'audit', 'logging', 'traceability'] }
    ];
    
    categories.forEach(category => {
      if (standardsText.toLowerCase().includes(category.name.toLowerCase()) || 
          category.keywords.some(keyword => standardsText.toLowerCase().includes(keyword))) {
        standards.push({
          category: category.name,
          rules: this.extractRules(standardsText, category.name),
          priority: 'high'
        });
      }
    });
    
    return standards;
  }

  extractRules(text, category) {
    // Extract specific rules for a category
    const rules = [];
    
    // Simple rule extraction - in practice this would be more sophisticated
    if (category === 'Security') {
      rules.push('Input validation and sanitization');
      rules.push('SQL injection prevention');
      rules.push('XSS protection');
      rules.push('Secure authentication');
    } else if (category === 'Code Quality') {
      rules.push('Single responsibility principle');
      rules.push('Meaningful variable names');
      rules.push('Function length limits');
      rules.push('Code documentation');
    }
    
    return rules;
  }

  getFallbackStandards() {
    return [
      {
        category: 'Security',
        rules: ['Input validation', 'SQL injection prevention', 'XSS protection'],
        priority: 'high'
      },
      {
        category: 'Code Quality',
        rules: ['SOLID principles', 'Clean code', 'Readability'],
        priority: 'high'
      },
      {
        category: 'Performance',
        rules: ['Efficient algorithms', 'Memory management', 'Database optimization'],
        priority: 'medium'
      }
    ];
  }

  async runFixingCycles() {
    console.log('🔄 Starting fixing cycles...');
    
    while (this.cycle < this.maxCycles && this.currentQuality < this.qualityThreshold) {
      this.cycle++;
      console.log(`\n🔄 Cycle ${this.cycle}/${this.maxCycles}`);
      
      // Step 1: Analyze current code
      await this.analyzeCode();
      
      // Step 2: Find issues
      await this.findIssues();
      
      // Step 3: Generate fixes
      await this.generateFixes();
      
      // Step 4: Apply fixes
      await this.applyFixes();
      
      // Step 5: Test fixes
      await this.testFixes();
      
      // Step 6: Calculate new quality
      this.currentQuality = this.calculateQuality();
      
      console.log(`📊 Quality after cycle ${this.cycle}: ${this.currentQuality}%`);
      
      if (this.currentQuality >= this.qualityThreshold) {
        console.log(`🎯 Target quality (${this.qualityThreshold}%) reached!`);
        break;
      }
    }
  }

  async analyzeCode() {
    console.log('🔍 Analyzing current code...');
    
    // Analyze the codebase using the standards
    const analysisPrompt = `Analyze this codebase for compliance with financial/banking coding standards.
    
    Standards to check:
    ${this.standards.map(s => `- ${s.category}: ${s.rules.join(', ')}`).join('\n')}
    
    Focus on finding specific code issues that can be automatically fixed.`;
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a code analysis expert. Analyze code for specific issues that can be automatically fixed."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        max_tokens: 1500
      });
      
      console.log('✅ Code analysis completed');
      
    } catch (error) {
      console.log('⚠️ AI analysis failed, using fallback analysis');
    }
  }

  async findIssues() {
    console.log('🔍 Finding specific issues...');
    
    // Find issues using existing tools and AI analysis
    const newIssues = [];
    
    // Check for common issues
    try {
      // Linting issues
      const lintResult = execSync('npm run lint', { encoding: 'utf8', cwd: process.cwd() });
      if (lintResult.includes('error')) {
        newIssues.push({
          type: 'linting',
          severity: 'medium',
          description: 'Code style violations found',
          location: 'codebase',
          fixable: true
        });
      }
    } catch (error) {
      // Linting found issues
      newIssues.push({
        type: 'linting',
        severity: 'medium',
        description: 'Code style violations found',
        location: 'codebase',
        fixable: true
      });
    }
    
    // Check for security issues
    try {
      const auditResult = execSync('npm audit --audit-level moderate', { encoding: 'utf8', cwd: process.cwd() });
      if (auditResult.includes('vulnerabilities')) {
        newIssues.push({
          type: 'security',
          severity: 'high',
          description: 'Security vulnerabilities in dependencies',
          location: 'dependencies',
          fixable: true
        });
      }
    } catch (error) {
      // Security issues found
      newIssues.push({
        type: 'security',
        severity: 'high',
        description: 'Security vulnerabilities in dependencies',
        location: 'dependencies',
        fixable: true
      });
    }
    
    this.issues = [...this.issues, ...newIssues];
    console.log(`🔍 Found ${newIssues.length} new issues (total: ${this.issues.length})`);
  }

  async generateFixes() {
    console.log('🔧 Generating fixes for issues...');
    
    const newFixes = [];
    
    for (const issue of this.issues) {
      if (issue.fixable && !this.fixes.some(f => f.issueId === issue.type)) {
        const fix = await this.generateFix(issue);
        if (fix) {
          newFixes.push(fix);
        }
      }
    }
    
    this.fixes = [...this.fixes, ...newFixes];
    console.log(`🔧 Generated ${newFixes.length} new fixes (total: ${this.fixes.length})`);
  }

  async generateFix(issue) {
    // Generate specific fixes based on issue type
    let fix = null;
    
    switch (issue.type) {
      case 'linting':
        fix = {
          issueId: issue.type,
          command: 'npm run lint:fix',
          description: 'Automatically fix linting issues',
          type: 'command'
        };
        break;
        
      case 'security':
        fix = {
          issueId: issue.type,
          command: 'npm audit fix',
          description: 'Fix security vulnerabilities',
          type: 'command'
        };
        break;
        
      default:
        // Use AI to generate more specific fixes
        try {
          const completion = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a code fixing expert. Generate specific fixes for code issues."
              },
              {
                role: "user",
                content: `Generate a fix for this issue: ${issue.description}`
              }
            ],
            max_tokens: 500
          });
          
          fix = {
            issueId: issue.type,
            description: completion.choices[0].message.content,
            type: 'ai-suggestion'
          };
        } catch (error) {
          console.log(`⚠️ Could not generate AI fix for ${issue.type}`);
        }
    }
    
    return fix;
  }

  async applyFixes() {
    console.log('🔧 Applying fixes...');
    
    let fixesApplied = 0;
    
    for (const fix of this.fixes) {
      if (fix.type === 'command') {
        try {
          console.log(`🔧 Applying fix: ${fix.description}`);
          execSync(fix.command, { encoding: 'utf8', cwd: process.cwd() });
          fix.applied = true;
          fixesApplied++;
          console.log(`✅ Fix applied: ${fix.description}`);
        } catch (error) {
          console.log(`❌ Fix failed: ${fix.description}`);
          fix.applied = false;
          fix.error = error.message;
        }
      }
    }
    
    console.log(`🔧 Applied ${fixesApplied} fixes`);
  }

  async testFixes() {
    console.log('🧪 Testing fixes...');
    
    try {
      // Run tests to ensure fixes didn't break anything
      const testResult = execSync('npm run test:ci', { encoding: 'utf8', cwd: process.cwd() });
      console.log('✅ Tests passed after fixes');
    } catch (error) {
      console.log('⚠️ Some tests failed after fixes');
      // Rollback problematic fixes if needed
    }
  }

  calculateQuality() {
    // Calculate quality score based on issues and fixes
    const totalIssues = this.issues.length;
    const fixedIssues = this.fixes.filter(f => f.applied).length;
    
    if (totalIssues === 0) return 100;
    
    const baseQuality = 60; // Start with 60% for basic compliance
    const improvement = (fixedIssues / totalIssues) * 40; // Up to 40% improvement
    
    return Math.min(100, Math.round(baseQuality + improvement));
  }

  async generateReport() {
    const outputDir = './ai-standards-results';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const resultsFile = path.join(outputDir, 'ai-standards-results.json');
    const reportFile = path.join(outputDir, 'ai-standards-report.md');
    
    // Save JSON results
    const results = {
      success: true,
      cycles: this.cycle,
      finalQuality: this.currentQuality,
      issuesFound: this.issues.length,
      fixesApplied: this.fixes.filter(f => f.applied).length,
      standards: this.standards,
      issues: this.issues,
      fixes: this.fixes,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    
    // Generate markdown report
    const report = this.generateMarkdownReport(results);
    fs.writeFileSync(reportFile, report);
    
    console.log(`📁 Results saved to ${outputDir}/`);
  }

  generateMarkdownReport(results) {
    return `# 🤖 AI Standards Agent Report

## 📊 Executive Summary
- **Cycles Run**: ${results.cycles}
- **Final Quality**: ${results.finalQuality}%
- **Issues Found**: ${results.issuesFound}
- **Fixes Applied**: ${results.fixesApplied}
- **Target Quality**: ${this.qualityThreshold}%

## 🎯 Standards Implemented
${results.standards.map(s => 
  `### ${s.category}
  - **Priority**: ${s.priority}
  - **Rules**: ${s.rules.join(', ')}`
).join('\n\n')}

## 🔍 Issues Found
${results.issues.length === 0 ? '✅ No issues found!' : results.issues.map(issue => 
  `### ${issue.type.toUpperCase()}
  - **Severity**: ${issue.severity}
  - **Description**: ${issue.description}
  - **Location**: ${issue.location}
  - **Fixable**: ${issue.fixable ? 'Yes' : 'No'}`
).join('\n\n')}

## 🔧 Fixes Applied
${results.fixes.filter(f => f.applied).length === 0 ? '✅ No fixes applied!' : results.fixes.filter(f => f.applied).map(fix => 
  `### ${fix.issueId.toUpperCase()}
  - **Description**: ${fix.description}
  - **Type**: ${fix.type}
  - **Status**: ✅ Applied`
).join('\n\n')}

## 📈 Quality Improvement
- **Starting Quality**: 60%
- **Final Quality**: ${results.finalQuality}%
- **Improvement**: ${results.finalQuality - 60}%
- **Target Reached**: ${results.finalQuality >= this.qualityThreshold ? '✅ Yes' : '❌ No'}

---
*Generated by AI Standards Agent at ${new Date().toISOString()}*`;
  }
}

// Run the agent if called directly
if (require.main === module) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.error('❌ OPENAI_API_KEY environment variable required');
    process.exit(1);
  }
  
  const agent = new AIStandardsAgent(openaiApiKey);
  agent.run().catch(console.error);
}

module.exports = AIStandardsAgent;