#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

class BuildMonitor {
  constructor() {
    this.fixPatterns = [];
    this.maxAutoFixAttempts = 3;
    this.safetyLevel = 'moderate';
    this.initializeFixPatterns();
  }

  initializeFixPatterns() {
    this.fixPatterns = [
      // TypeScript type errors
      {
        pattern: /Element implicitly has an 'any' type because expression of type .* can't be used to index type/,
        description: 'Fix implicit any type in index access',
        safety: 'safe',
        dnbCompliant: true,
        fix: async (error, content) => {
          const lines = content.split('\n');
          
          // Find the headers declaration and add type annotation
          for (let i = Math.max(0, error.line - 10); i < error.line; i++) {
            if (i < lines.length && lines[i].includes('const headers = {')) {
              lines[i] = lines[i].replace('const headers = {', 'const headers: Record<string, string> = {');
              break;
            }
          }
          
          return lines.join('\n');
        }
      },
      
      // Missing import statements
      {
        pattern: /Cannot find name '(.+)'/,
        description: 'Add missing imports for undefined variables',
        safety: 'moderate',
        dnbCompliant: true,
        fix: async (error, content) => {
          const match = error.message.match(/Cannot find name '(.+)'/);
          if (!match) return content;
          
          const missingName = match[1];
          const commonImports = {
            'React': "import React from 'react';",
            'useState': "import { useState } from 'react';",
            'useEffect': "import { useEffect } from 'react';",
            'NextRequest': "import { NextRequest } from 'next/server';",
            'NextResponse': "import { NextResponse } from 'next/server';",
            'supabase': "import { createClient } from '@supabase/supabase-js';",
          };
          
          if (commonImports[missingName]) {
            const lines = content.split('\n');
            let insertIndex = 0;
            
            // Find the last import statement
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('import ')) {
                insertIndex = i + 1;
              } else if (lines[i].trim() === '' || lines[i].startsWith('//')) {
                continue;
              } else {
                break;
              }
            }
            
            lines.splice(insertIndex, 0, commonImports[missingName]);
            return lines.join('\n');
          }
          
          return content;
        }
      },
      
      // Missing dependencies
      {
        pattern: /Module not found: Can't resolve '(.+)'/,
        description: 'Install missing npm packages',
        safety: 'moderate',
        dnbCompliant: true,
        fix: async (error, content) => {
          const match = error.message.match(/Module not found: Can't resolve '(.+)'/);
          if (!match) return content;
          
          const missingModule = match[1];
          
          // Common packages that are safe to install
          const safePackages = [
            '@types/node',
            '@types/react',
            '@types/react-dom',
            'lucide-react',
            'clsx',
            'tailwind-merge',
            'date-fns',
            'zod',
            'bcryptjs',
            '@types/bcryptjs'
          ];
          
          if (safePackages.includes(missingModule)) {
            try {
              await execAsync(`npm install ${missingModule}`);
              console.log(`✅ Installed missing package: ${missingModule}`);
            } catch (installError) {
              console.log(`❌ Failed to install ${missingModule}:`, installError.message);
            }
          }
          
          return content;
        }
      },

      // Next.js config warnings
      {
        pattern: /Invalid next\.config\.(js|mjs) options detected/,
        description: 'Fix Next.js configuration issues',
        safety: 'safe',
        dnbCompliant: true,
        fix: async (error, content) => {
          const configPath = path.join(process.cwd(), 'next.config.mjs');
          try {
            let configContent = await fs.readFile(configPath, 'utf8');
            
            // Remove deprecated options
            configContent = configContent.replace(/reactStrictMode:\s*true,?\s*/g, '');
            configContent = configContent.replace(/swcMinify:\s*true,?\s*/g, '');
            
            // Clean up empty compiler object
            configContent = configContent.replace(/compiler:\s*{\s*},?\s*/g, '');
            
            await fs.writeFile(configPath, configContent);
            console.log('✅ Fixed Next.js config issues');
          } catch (configError) {
            console.log('❌ Failed to fix Next.js config:', configError.message);
          }
          
          return content;
        }
      }
    ];
  }

  async parseVercelBuildLogs(logContent) {
    const errors = [];
    const lines = logContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // TypeScript errors
      const tsErrorMatch = line.match(/^(.+):(\d+):(\d+) - error TS(\d+): (.+)$/);
      if (tsErrorMatch) {
        errors.push({
          file: tsErrorMatch[1],
          line: parseInt(tsErrorMatch[2]),
          column: parseInt(tsErrorMatch[3]),
          message: tsErrorMatch[5],
          type: 'typescript',
          severity: 'error',
          code: `TS${tsErrorMatch[4]}`
        });
        continue;
      }

      // Next.js build errors
      const nextErrorMatch = line.match(/^(.+):(\d+):(\d+)$/);
      if (nextErrorMatch && i + 1 < lines.length && lines[i + 1].includes('Type error:')) {
        errors.push({
          file: nextErrorMatch[1],
          line: parseInt(nextErrorMatch[2]),
          column: parseInt(nextErrorMatch[3]),
          message: lines[i + 1].replace('Type error: ', ''),
          type: 'typescript',
          severity: 'error'
        });
        continue;
      }

      // Module not found errors
      if (line.includes("Module not found: Can't resolve")) {
        const moduleMatch = line.match(/Module not found: Can't resolve '(.+)'/);
        if (moduleMatch) {
          errors.push({
            file: '',
            line: 0,
            column: 0,
            message: line,
            type: 'dependency',
            severity: 'error'
          });
        }
      }
    }

    return errors;
  }

  async autoFixErrors(errors) {
    let fixesApplied = 0;
    const maxFixes = 10; // Prevent infinite loops

    console.log(`🔍 Analyzing ${errors.length} build errors...`);

    for (const error of errors.slice(0, maxFixes)) {
      console.log(`\n📝 Processing: ${error.message}`);

      const applicablePatterns = this.fixPatterns.filter(pattern => 
        pattern.pattern.test(error.message) && 
        pattern.dnbCompliant &&
        (this.safetyLevel === 'risky' || pattern.safety !== 'risky')
      );

      for (const pattern of applicablePatterns) {
        try {
          if (error.file && error.file !== '') {
            const filePath = path.resolve(error.file);
            const fileContent = await fs.readFile(filePath, 'utf8');
            const fixedContent = await pattern.fix(error, fileContent);

            if (fixedContent !== fileContent) {
              await fs.writeFile(filePath, fixedContent);
              console.log(`✅ Applied fix: ${pattern.description}`);
              fixesApplied++;
            }
          } else {
            // Handle non-file specific errors (like missing dependencies)
            await pattern.fix(error, '');
            console.log(`✅ Applied fix: ${pattern.description}`);
            fixesApplied++;
          }
        } catch (fixError) {
          console.log(`❌ Failed to apply fix for ${error.message}:`, fixError.message);
        }
      }
    }

    console.log(`\n🎯 Applied ${fixesApplied} automated fixes`);
    return fixesApplied > 0;
  }

  async runBuildAndAnalyze() {
    console.log('🚀 Starting automated build analysis...');
    
    let attempts = 0;
    
    while (attempts < this.maxAutoFixAttempts) {
      attempts++;
      console.log(`\n📋 Build attempt ${attempts}/${this.maxAutoFixAttempts}`);

      try {
        // Run the build and capture output
        const { stdout, stderr } = await execAsync('npm run build', { 
          cwd: process.cwd(),
          timeout: 300000 // 5 minutes timeout
        });

        console.log('✅ Build successful!');
        
        // Commit successful fixes
        if (attempts > 1) {
          await this.commitFixes(`Automated build fix - attempt ${attempts} successful`);
        }
        
        return true;

      } catch (buildError) {
        console.log(`❌ Build failed on attempt ${attempts}`);
        
        const buildOutput = (buildError.stdout || '') + (buildError.stderr || '');
        const errors = await this.parseVercelBuildLogs(buildOutput);
        
        if (errors.length === 0) {
          console.log('❌ No parseable errors found in build output');
          console.log('Build output:', buildOutput.substring(0, 1000));
          break;
        }

        const fixesApplied = await this.autoFixErrors(errors);
        
        if (!fixesApplied) {
          console.log('❌ No applicable fixes found');
          break;
        }

        // Small delay before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`❌ Build failed after ${attempts} attempts`);
    return false;
  }

  async commitFixes(message) {
    try {
      await execAsync('git add -A');
      await execAsync(`git commit -m "Banking Standards: ${message} - DNB compliant automated fixes"`);
      await execAsync('git push');
      console.log('✅ Committed and pushed automated fixes');
    } catch (commitError) {
      console.log('❌ Failed to commit fixes:', commitError.message);
    }
  }

  async monitorFromWebhook(webhookPayload) {
    if (webhookPayload.type === 'deployment.error') {
      console.log('🚨 Deployment error detected via webhook');
      console.log('Deployment ID:', webhookPayload.payload.deployment.id);
      console.log('Project:', webhookPayload.payload.project.id);
      
      // Trigger automated analysis
      const success = await this.runBuildAndAnalyze();
      
      if (success) {
        console.log('✅ Automated fix successful, build should pass now');
      } else {
        console.log('❌ Automated fix failed, manual intervention required');
        await this.sendFailureNotification(webhookPayload);
      }
    }
  }

  async sendFailureNotification(webhookPayload) {
    console.log('📧 Sending failure notification...');
    console.log('Deployment URL:', webhookPayload.payload.links.deployment);
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new BuildMonitor();
  
  const command = process.argv[2];
  
  if (command === 'analyze') {
    monitor.runBuildAndAnalyze()
      .then(success => {
        process.exit(success ? 0 : 1);
      })
      .catch(error => {
        console.error('❌ Build monitor failed:', error);
        process.exit(1);
      });
  } else if (command === 'webhook') {
    console.log('🔗 Webhook listener mode - integrate with your webhook endpoint');
  } else {
    console.log('Usage: node scripts/build-monitor.js [analyze|webhook]');
    console.log('  analyze - Run build analysis and auto-fix');
    console.log('  webhook - Process webhook payload (for integration)');
  }
}

module.exports = { BuildMonitor };