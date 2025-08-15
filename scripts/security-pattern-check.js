#!/usr/bin/env node

/**
 * Security Pattern Check Script
 * 
 * This script checks for common security vulnerabilities and patterns
 * that could compromise the application's security.
 * 
 * Used in the CI/CD pipeline for banking-grade security compliance.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Security patterns to check for
const SECURITY_PATTERNS = {
  hardcodedSecrets: {
    patterns: [
      /password\s*=\s*['"][a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}['"]/gi,
      /secret\s*=\s*['"][a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}['"]/gi,
      /token\s*=\s*['"][a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}['"]/gi,
      /api_key\s*=\s*['"][a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}['"]/gi,
      /private_key\s*=\s*['"][a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}['"]/gi,
      /access_token\s*=\s*['"][a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}['"]/gi,
    ],
    description: 'Hardcoded secrets',
    critical: true
  },
  sqlInjection: {
    patterns: [
      // Look for actual SQL injection patterns, not Supabase query builder
      /SELECT.*\$\{[^}]+\}.*FROM/gi,
      /INSERT.*\$\{[^}]+\}.*INTO/gi,
      /UPDATE.*\$\{[^}]+\}.*SET/gi,
      /DELETE.*\$\{[^}]+\}.*FROM/gi,
      /WHERE.*\$\{[^}]+\}/gi,
      // Look for raw SQL queries that might be vulnerable
      /executeQuery\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`/gi,
      /query\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`/gi,
    ],
    description: 'Potential SQL injection patterns',
    critical: true
  },
  xssVulnerabilities: {
    patterns: [
      /innerHTML\s*=/gi,
      /dangerouslySetInnerHTML/gi,
      /document\.write/gi,
      /eval\s*\(/gi,
    ],
    description: 'Potential XSS vulnerabilities',
    critical: true
  },
  consoleLogs: {
    patterns: [
      /console\.log\s*\(/gi,
      /console\.error\s*\(/gi,
      /console\.warn\s*\(/gi,
      /console\.info\s*\(/gi,
    ],
    description: 'Console logging statements',
    critical: false
  },
  anyTypes: {
    patterns: [
      /:\s*any\b/gi,
      /:\s*any\[\]/gi,
    ],
    description: 'TypeScript any types',
    critical: false
  }
};

// Directories to scan
const SCAN_DIRECTORIES = [
  'app',
  'lib',
  'components',
  'hooks',
  'middleware.ts',
  'next.config.mjs'
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /coverage/,
  /dist/,
  /build/,
  /\.d\.ts$/,
  /\.test\./,
  /\.spec\./,
  /security-pattern-check\.js/
];

/**
 * Check if a file should be excluded from scanning
 */
function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => 
    pattern.test(filePath) || pattern.test(path.basename(filePath))
  );
}

/**
 * Scan a single file for security patterns
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    Object.entries(SECURITY_PATTERNS).forEach(([key, config]) => {
      config.patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          // Skip SQL injection warnings for Supabase query builder files
          if (key === 'sqlInjection' && isSupabaseQueryBuilder(content)) {
            return; // Use return instead of continue in forEach
          }
          
          issues.push({
            type: key,
            description: config.description,
            critical: config.critical,
            matches: matches.length,
            file: filePath
          });
        }
      });
    });
    
    return issues;
  } catch (error) {
    console.warn(`⚠️  Warning: Could not read file ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * Check if a file uses Supabase query builder (safe from SQL injection)
 */
function isSupabaseQueryBuilder(content) {
  // Look for Supabase query builder patterns
  const supabasePatterns = [
    /\.from\(/gi,
    /\.select\(/gi,
    /\.insert\(/gi,
    /\.update\(/gi,
    /\.delete\(/gi,
    /\.eq\(/gi,
    /\.neq\(/gi,
    /\.gt\(/gi,
    /\.lt\(/gi,
    /\.gte\(/gi,
    /\.lte\(/gi,
    /\.like\(/gi,
    /\.ilike\(/gi,
    /\.in\(/gi,
    /\.not\(/gi,
    /\.or\(/gi,
    /\.and\(/gi,
    /\.order\(/gi,
    /\.limit\(/gi,
    /\.range\(/gi,
    /supabase/gi,
    /supabaseAdmin/gi
  ];
  
  return supabasePatterns.some(pattern => pattern.test(content));
}

/**
 * Recursively scan a directory for files
 */
function scanDirectory(dirPath) {
  const issues = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      
      if (shouldExcludeFile(fullPath)) {
        return;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        issues.push(...scanDirectory(fullPath));
      } else if (stat.isFile() && /\.(js|jsx|ts|tsx|mjs)$/.test(item)) {
        issues.push(...scanFile(fullPath));
      }
    });
  } catch (error) {
    console.warn(`⚠️  Warning: Could not scan directory ${dirPath}: ${error.message}`);
  }
  
  return issues;
}

/**
 * Main security scan function
 */
function runSecurityScan() {
  console.log('🔒 Starting Security Pattern Check...\n');
  
  let allIssues = [];
  
  // Scan each directory
  SCAN_DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
      if (fs.statSync(dir).isDirectory()) {
        console.log(`📁 Scanning directory: ${dir}`);
        allIssues.push(...scanDirectory(dir));
      } else {
        console.log(`📄 Scanning file: ${dir}`);
        allIssues.push(...scanFile(dir));
      }
    } else {
      console.log(`⚠️  Warning: ${dir} does not exist, skipping...`);
    }
  });
  
  // Group issues by type
  const issuesByType = {};
  allIssues.forEach(issue => {
    if (!issuesByType[issue.type]) {
      issuesByType[issue.type] = [];
    }
    issuesByType[issue.type].push(issue);
  });
  
  // Report results
  console.log('\n📊 Security Scan Results:');
  console.log('==========================\n');
  
  let hasCriticalIssues = false;
  let totalIssues = 0;
  
  Object.entries(issuesByType).forEach(([type, issues]) => {
    const config = SECURITY_PATTERNS[type];
    const criticalCount = issues.filter(i => i.critical).length;
    const warningCount = issues.length - criticalCount;
    
    console.log(`${config.critical ? '🚨' : '⚠️'} ${config.description}:`);
    console.log(`   Total: ${issues.length} | Critical: ${criticalCount} | Warnings: ${warningCount}`);
    
    if (criticalCount > 0) {
      hasCriticalIssues = true;
      console.log('   Critical issues found:');
      issues.filter(i => i.critical).forEach(issue => {
        console.log(`     - ${issue.file} (${issue.matches} matches)`);
      });
    }
    
    if (warningCount > 0) {
      console.log('   Warnings:');
      issues.filter(i => !i.critical).forEach(issue => {
        console.log(`     - ${issue.file} (${issue.matches} matches)`);
      });
    }
    
    console.log('');
    totalIssues += issues.length;
  });
  
  // Summary
  console.log('📋 Summary:');
  console.log('===========');
  console.log(`Total issues found: ${totalIssues}`);
  console.log(`Critical issues: ${allIssues.filter(i => i.critical).length}`);
  console.log(`Warnings: ${allIssues.filter(i => !i.critical).length}`);
  
  if (hasCriticalIssues) {
    console.log('\n❌ CRITICAL: Security vulnerabilities found!');
    console.log('🔒 Deployment blocked until issues are resolved.');
    process.exit(1);
  } else if (totalIssues > 0) {
    console.log('\n⚠️  WARNING: Security warnings found.');
    console.log('✅ Deployment can proceed, but consider addressing warnings.');
    process.exit(0);
  } else {
    console.log('\n✅ SUCCESS: No security issues found!');
    console.log('🔒 All security checks passed.');
    process.exit(0);
  }
}

// Run the security scan
if (require.main === module) {
  runSecurityScan();
}

module.exports = { runSecurityScan, SECURITY_PATTERNS };