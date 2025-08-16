#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');

function run(command, args) {
  return spawnSync(command, args, { stdio: 'inherit' }).status;
}

while (true) {
  const testStatus = run('npm', ['run', 'test:ci']);
  if (testStatus === 0) {
    console.log('✅ Tests passed');
    process.exit(0);
  }

  console.log('❌ Tests failed, running agent-fix-tests.sh...');
  const fixStatus = run('bash', ['scripts/agent-fix-tests.sh']);
  if (fixStatus !== 0) {
    console.error('Fix script failed. Exiting.');
    process.exit(testStatus || 1);
  }
}
