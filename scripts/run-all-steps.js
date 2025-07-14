#!/usr/bin/env node

/**
 * MASTER SCRIPT: Voer alle 9 setup stappen uit
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

async function runStep(stepNumber, scriptName, description) {
  console.log(`\n🚀 STAP ${stepNumber}: ${description}`)
  console.log('=' .repeat(50))
  
  try {
    execSync(`node scripts/${scriptName}`, { stdio: 'inherit' })
    console.log(`\n✅ Stap ${stepNumber} voltooid!`)
    return true
  } catch (error) {
    console.log(`\n❌ Stap ${stepNumber} gefaald!`)
    console.log('Error:', error.message)
    
    const retry = await askQuestion('Wil je deze stap opnieuw proberen? (y/n): ')
    if (retry === 'y' || retry === 'yes') {
      return await runStep(stepNumber, scriptName, description)
    }
    return false
  }
}

async function runAllSteps() {
  console.log('🧪 TUINBEHEER TEST ENVIRONMENT - VOLLEDIGE SETUP')
  console.log('=' .repeat(60))
  console.log('Dit script voert alle 9 setup stappen automatisch uit')
  console.log('')
  
  const proceed = await askQuestion('Wil je doorgaan met de volledige setup? (y/n): ')
  if (proceed !== 'y' && proceed !== 'yes') {
    console.log('Setup geannuleerd.')
    process.exit(0)
  }
  
  const steps = [
    { num: 1, script: '01-check-environment.js', desc: 'Environment Check' },
    { num: 2, script: '02-test-connection.js', desc: 'Connection Test' },
    { num: 3, script: '03-show-sql.js', desc: 'Database Setup SQL' },
    { num: 4, script: '04-test-database.js', desc: 'Database Schema Test' },
    { num: 5, script: '05-test-write.js', desc: 'Write Operations Test' },
    { num: 6, script: '06-test-config.js', desc: 'Application Config Test' },
    // Skip step 7 (server start) in auto mode
    { num: 8, script: '08-test-app.js', desc: 'Application Integration Test' },
    { num: 9, script: '09-final-check.js', desc: 'Final Verification' }
  ]
  
  let allPassed = true
  
  for (const step of steps) {
    if (step.num === 3) {
      // Special handling for SQL step
      console.log(`\n📋 STAP ${step.num}: ${step.desc}`)
      console.log('=' .repeat(50))
      execSync(`node scripts/${step.script}`, { stdio: 'inherit' })
      
      const sqlDone = await askQuestion('\nHeb je de SQL uitgevoerd in je Supabase dashboard? (y/n): ')
      if (sqlDone !== 'y' && sqlDone !== 'yes') {
        console.log('⚠️  Je moet de SQL uitvoeren voordat je verder kunt!')
        console.log('Ga naar: https://dwsgwqosmihsfaxuheji.supabase.co')
        console.log('En voer de SQL uit in de SQL Editor')
        const waitMore = await askQuestion('Druk Enter wanneer je klaar bent...')
      }
      continue
    }
    
    const success = await runStep(step.num, step.script, step.desc)
    if (!success) {
      allPassed = false
      const continueAnyway = await askQuestion('Wil je doorgaan ondanks de fout? (y/n): ')
      if (continueAnyway !== 'y' && continueAnyway !== 'yes') {
        break
      }
    }
  }
  
  console.log('\n' + '=' .repeat(60))
  if (allPassed) {
    console.log('🎉 ALLE STAPPEN VOLTOOID!')
    console.log('Je test environment is klaar voor gebruik!')
    console.log('')
    console.log('🚀 Start je test server met:')
    console.log('   npm run dev:test')
  } else {
    console.log('⚠️  SETUP NIET VOLLEDIG')
    console.log('Sommige stappen zijn mislukt. Controleer de errors hierboven.')
    console.log('Je kunt individuele stappen opnieuw uitvoeren.')
  }
  
  console.log('')
  console.log('📋 Individuele scripts:')
  console.log('   node scripts/01-check-environment.js')
  console.log('   node scripts/02-test-connection.js')
  console.log('   ... etc')
  
  rl.close()
}

runAllSteps().catch(console.error)