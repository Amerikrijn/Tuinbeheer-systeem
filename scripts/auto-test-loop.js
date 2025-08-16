#!/usr/bin/env node
'use strict';

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_ATTEMPTS = 5;
const logFile = path.resolve(__dirname, '..', 'test-log.txt');

async function runCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      process.stdout.write(stdout);
      if (error) {
        fs.appendFileSync(logFile, `Attempt failed:\n${stderr}\n`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

(async () => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`\nAttempt ${attempt}/${MAX_ATTEMPTS}: running tests...`);
    const success = await runCommand('npm run test:ci');
    if (success) {
      console.log('Tests passed.');
      process.exit(0);
    }

    console.error(`Attempt ${attempt} failed. Log written to test-log.txt`);
    if (attempt < MAX_ATTEMPTS) {
      try {
        execSync('scripts/agent-fix-tests.sh', { stdio: 'inherit' });
      } catch (err) {
        console.error('agent-fix-tests.sh encountered an error:', err.message);
      }
    }
  }

  console.error(`Tests failed after ${MAX_ATTEMPTS} attempts.`);
  process.exit(1);
})();
