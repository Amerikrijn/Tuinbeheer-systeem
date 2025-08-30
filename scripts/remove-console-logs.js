#!/usr/bin/env node

/**
 * Script to remove all console.log, console.error, console.warn statements
 * and replace them with conditional logging that only works in development
 */

const fs = require('fs');
const path = require('path');

// Directories to process
const dirsToProcess = [
  'app',
  'components',
  'lib',
  'hooks'
];

// Files to skip
const skipFiles = [
  'jest.setup.js',
  'jest.env.js',
  'jest-results-processor.js',
  'build-success.js',
  'scripts/',
  '__tests__/',
  '__mocks__/',
  'node_modules/',
  '.next/',
  'public/sw.js',
  'public/emergency.html'
];

let totalRemoved = 0;
let filesProcessed = 0;

function shouldSkipFile(filePath) {
  return skipFiles.some(skip => filePath.includes(skip));
}

function processFile(filePath) {
  if (shouldSkipFile(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let removedCount = 0;

  // Pattern to match console.log/error/warn statements (including multi-line)
  const patterns = [
    // Simple single line console statements
    /^\s*console\.(log|error|warn|info|debug)\([^)]*\);?\s*$/gm,
    // Multi-line console statements
    /^\s*console\.(log|error|warn|info|debug)\([^)]*\n([^)]*\n)*[^)]*\);?\s*$/gm,
    // Console statements with object literals
    /^\s*console\.(log|error|warn|info|debug)\(\{[\s\S]*?\}\);?\s*$/gm,
    // Console statements with template literals
    /^\s*console\.(log|error|warn|info|debug)\(`[\s\S]*?`\);?\s*$/gm,
  ];

  // Remove console statements
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      removedCount += matches.length;
      content = content.replace(pattern, '');
    }
  });

  // Clean up multiple empty lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Processed ${filePath}: Removed ${removedCount} console statements`);
    totalRemoved += removedCount;
    filesProcessed++;
  }
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !shouldSkipFile(fullPath)) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx'))) {
      processFile(fullPath);
    }
  });
}

console.log('🧹 Starting console.log cleanup...\n');

dirsToProcess.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`📁 Processing directory: ${dir}`);
    processDirectory(fullPath);
  }
});

console.log('\n' + '='.repeat(50));
console.log(`✨ Cleanup complete!`);
console.log(`📊 Files processed: ${filesProcessed}`);
console.log(`🗑️  Console statements removed: ${totalRemoved}`);
console.log('='.repeat(50));

// Now let's also create a logger utility if it doesn't exist
const loggerPath = path.join(process.cwd(), 'lib', 'logger.ts');
const loggerContent = `/**
 * Centralized logging utility
 * Only logs in development mode to avoid console pollution in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (!this.isDevelopment) return;
    
    const timestamp = new Date().toISOString();
    const prefix = \`[\${timestamp}] [\${level.toUpperCase()}]\`;
    
    switch (level) {
      case 'debug':
        console.debug(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger();
`;

if (!fs.existsSync(loggerPath) || fs.readFileSync(loggerPath, 'utf8').includes('console.log')) {
  fs.writeFileSync(loggerPath, loggerContent, 'utf8');
  console.log('\n✅ Created/Updated logger utility at lib/logger.ts');
}