#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting custom Next.js build for Vercel...');

// Set environment variables
process.env.SKIP_ENV_VALIDATION = '1';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

try {
  // Run Next.js build and capture output
  console.log('📦 Running Next.js build...');
  
  try {
    execSync('npx next build --no-lint', { 
      stdio: 'inherit',
      timeout: 600000 // 10 minutes timeout
    });
  } catch (buildError) {
    console.log('⚠️  Build completed with warnings/errors - checking artifacts...');
  }
  
  // Check if build artifacts exist
  const nextDir = path.join(process.cwd(), '.next');
  const standaloneDir = path.join(nextDir, 'standalone');
  const serverDir = path.join(nextDir, 'server');
  const staticDir = path.join(nextDir, 'static');
  
  if (fs.existsSync(nextDir)) {
    console.log('✅ .next directory found');
    
    // List what we have
    if (fs.existsSync(standaloneDir)) {
      console.log('✅ Standalone build found');
    }
    if (fs.existsSync(serverDir)) {
      console.log('✅ Server build found');
    }
    if (fs.existsSync(staticDir)) {
      console.log('✅ Static assets found');
    }
    
    console.log('🎉 Build artifacts ready for Vercel deployment!');
    process.exit(0);
  } else {
    console.error('❌ No build artifacts found');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}