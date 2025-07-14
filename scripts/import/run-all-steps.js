#!/usr/bin/env node

/**
 * MASTER SCRIPT: Run All Import Steps
 * Voer alle 9 import stappen automatisch uit
 */

const { execSync } = require('child_process')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim())
    })
  })
}

async function runStep(stepNumber, description, command) {
  console.log(`\n🚀 RUNNING STEP ${stepNumber}: ${description}`)
  console.log('=' .repeat(60))
  
  try {
    if (stepNumber === 4) {
      // Step 4 is interactive, just run it
      execSync(command, { stdio: 'inherit' })
      return true
    } else if (stepNumber === 3) {
      // Step 3 shows SQL, pause for user
      execSync(command, { stdio: 'inherit' })
      const proceed = await askQuestion('\nHave you executed the SQL in Supabase? (y/n): ')
      if (proceed === 'y' || proceed === 'yes') {
        return true
      } else {
        console.log('⚠️  Please execute the SQL first, then continue.')
        return false
      }
    } else {
      // Regular steps
      execSync(command, { stdio: 'inherit' })
      return true
    }
  } catch (error) {
    console.log(`\n❌ Step ${stepNumber} failed!`)
    const retry = await askQuestion('Do you want to retry this step? (y/n): ')
    if (retry === 'y' || retry === 'yes') {
      return await runStep(stepNumber, description, command)
    }
    return false
  }
}

async function runAllSteps() {
  console.log('🎯 TUINBEHEER IMPORT SETUP - COMPLETE WORKFLOW')
  console.log('=' .repeat(60))
  console.log('This script will run all 9 import steps automatically.')
  console.log('You will be prompted for input when needed.')
  console.log('')
  
  const proceed = await askQuestion('Ready to start the complete import setup? (y/n): ')
  if (proceed !== 'y' && proceed !== 'yes') {
    console.log('Setup cancelled.')
    rl.close()
    process.exit(0)
  }
  
  const steps = [
    { num: 1, desc: 'Environment Check', cmd: 'node scripts/import/01-check-environment.js' },
    { num: 2, desc: 'Connection Test', cmd: 'node scripts/import/02-test-connection.js' },
    { num: 3, desc: 'Show SQL', cmd: 'node scripts/import/03-show-sql.js' },
    { num: 4, desc: 'Confirm SQL Execution', cmd: 'node scripts/import/04-run-sql.js' },
    { num: 5, desc: 'Verify Tables', cmd: 'node scripts/import/05-verify-tables.js' },
    { num: 6, desc: 'Test CRUD', cmd: 'node scripts/import/06-test-crud.js' },
    { num: 7, desc: 'Environment Test', cmd: 'node scripts/import/07-environment-test.js' },
    { num: 8, desc: 'Final Verification', cmd: 'node scripts/import/08-final-verification.js' },
    { num: 9, desc: 'Summary', cmd: 'node scripts/import/09-summary.js' }
  ]
  
  let allPassed = true
  
  for (const step of steps) {
    const success = await runStep(step.num, step.desc, step.cmd)
    if (!success) {
      allPassed = false
      const continueAnyway = await askQuestion('Continue with remaining steps? (y/n): ')
      if (continueAnyway !== 'y' && continueAnyway !== 'yes') {
        break
      }
    }
    
    // Small pause between steps
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n' + '=' .repeat(60))
  if (allPassed) {
    console.log('🎉 ALL IMPORT STEPS COMPLETED SUCCESSFULLY!')
    console.log('Your Tuinbeheer System is ready for development!')
    console.log('')
    console.log('🚀 Start developing with:')
    console.log('   npm run dev:test')
  } else {
    console.log('⚠️  IMPORT SETUP PARTIALLY COMPLETED')
    console.log('Some steps had issues. Review the output above.')
    console.log('You can re-run individual steps or the entire process.')
  }
  
  console.log('')
  console.log('📋 Individual step commands:')
  console.log('   npm run import:step1 through npm run import:step9')
  console.log('   npm run import:all (this script)')
  
  rl.close()
}

runAllSteps().catch(console.error)