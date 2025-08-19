#!/usr/bin/env node
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
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs = __importStar(require("fs"));
const AutoFixAgent_1 = require("./AutoFixAgent");
const program = new commander_1.Command();
program
    .name('auto-fix-agent')
    .description('AI-powered Auto-Fix Agent v2.0 with TypeScript compiler API, ESLint, ML, and Git integration')
    .version('2.0.0');
program
    .command('analyze')
    .description('Analyze code without applying fixes')
    .argument('<file>', 'File or directory to analyze')
    .option('-o, --output <path>', 'Output directory for reports', './auto-fix-results')
    .option('--typescript', 'Enable TypeScript compiler API analysis')
    .option('--eslint', 'Enable ESLint analysis')
    .option('--ml', 'Enable Machine Learning analysis')
    .option('--git', 'Enable Git integration')
    .option('--external-tools', 'Enable external tools (SonarQube, CodeClimate)')
    .option('--max-issues <number>', 'Maximum number of issues to report', '100')
    .action(async (file, options) => {
    await runAnalysis(file, { ...options, autoApply: false });
});
program
    .command('fix')
    .description('Analyze and automatically apply safe fixes')
    .argument('<file>', 'File or directory to fix')
    .option('-o, --output <path>', 'Output directory for reports', './auto-fix-results')
    .option('--typescript', 'Enable TypeScript compiler API fixes')
    .option('--eslint', 'Enable ESLint fixes')
    .option('--ml', 'Enable Machine Learning fixes')
    .option('--git', 'Enable Git integration')
    .option('--auto-commit', 'Automatically commit fixes')
    .option('--generate-pr', 'Generate Pull Request for risky fixes')
    .option('--require-review', 'Require code review for all fixes')
    .option('--max-fixes <number>', 'Maximum number of fixes to apply', '50')
    .option('--confidence <number>', 'Minimum confidence for ML fixes', '0.7')
    .action(async (file, options) => {
    await runAnalysis(file, { ...options, autoApply: true });
});
program
    .command('pr')
    .description('Generate Pull Request for existing fixes')
    .argument('<file>', 'File that was fixed')
    .option('--branch <name>', 'Branch name for the PR', 'auto-fix')
    .option('--title <title>', 'PR title')
    .option('--description <desc>', 'PR description')
    .action(async (file, options) => {
    await generatePullRequest(file, options);
});
program
    .command('ml')
    .description('Machine Learning operations')
    .option('--train', 'Train the ML model')
    .option('--predict <file>', 'Generate predictions for a file')
    .option('--metrics', 'Show ML model metrics')
    .option('--model-path <path>', 'Path to ML model', './ml-models')
    .action(async (options) => {
    await handleMLOperations(options);
});
program
    .command('config')
    .description('Manage configuration')
    .option('--init', 'Initialize default configuration')
    .option('--show', 'Show current configuration')
    .option('--edit', 'Edit configuration file')
    .action(async (options) => {
    await handleConfiguration(options);
});
program
    .command('tools')
    .description('External tool operations')
    .option('--sonarqube', 'Configure SonarQube integration')
    .option('--codeclimate', 'Configure CodeClimate integration')
    .option('--github', 'Configure GitHub integration')
    .option('--gitlab', 'Configure GitLab integration')
    .option('--test', 'Test external tool connections')
    .action(async (options) => {
    await handleExternalTools(options);
});
async function runAnalysis(file, options) {
    const spinner = (0, ora_1.default)('Initializing Auto-Fix Agent...').start();
    try {
        // Validate file/directory exists
        if (!fs.existsSync(file)) {
            spinner.fail(`File/directory not found: ${file}`);
            process.exit(1);
        }
        // Create output directory
        if (!fs.existsSync(options.output)) {
            fs.mkdirSync(options.output, { recursive: true });
        }
        // Prepare options
        const agentOptions = {
            filePath: file,
            outputPath: options.output,
            maxFixes: parseInt(options.maxFixes) || 50,
            autoApply: options.autoApply || false,
            requireValidation: true,
            includeSecurityFixes: true,
            includePerformanceFixes: true,
            includeQualityFixes: true,
            includeTypeScriptFixes: options.typescript || false,
            includeESLintFixes: options.eslint || false,
            enableMachineLearning: options.ml || false,
            gitIntegration: options.git || false,
            autoCommit: options.autoCommit || false,
            generatePullRequests: options.generatePr || false,
            requireCodeReview: options.requireReview || false,
            sonarQubeIntegration: options.externalTools || false,
            codeClimateIntegration: options.externalTools || false,
            mlModelPath: './ml-models',
            eslintConfigPath: '.eslintrc.json',
            typescriptConfigPath: 'tsconfig.json'
        };
        spinner.text = 'Running enhanced code analysis...';
        // Create and run agent
        const agent = new AutoFixAgent_1.AutoFixAgent(agentOptions);
        const result = await agent.run();
        spinner.succeed('Analysis complete!');
        // Display results
        displayResults(result, options);
        // Show next steps
        showNextSteps(result, options);
    }
    catch (error) {
        spinner.fail(`Analysis failed: ${error.message}`);
        console.error(chalk_1.default.red('Error details:'), error);
        process.exit(1);
    }
}
function displayResults(result, options) {
    console.log('\n' + chalk_1.default.blue('📊 Analysis Results'));
    console.log('='.repeat(50));
    if (result.metrics) {
        console.log(`Total Issues: ${chalk_1.default.yellow(result.metrics.totalIssues)}`);
        console.log(`Fixes Generated: ${chalk_1.default.green(result.metrics.fixesGenerated)}`);
        if (options.autoApply) {
            console.log(`Fixes Applied: ${chalk_1.default.green(result.metrics.fixesApplied)}`);
            console.log(`Success Rate: ${chalk_1.default.blue((result.metrics.successRate * 100).toFixed(1))}%`);
        }
        if (result.metrics.typescriptIssues) {
            console.log(`TypeScript Issues: ${chalk_1.default.red(result.metrics.typescriptIssues)}`);
        }
        if (result.metrics.eslintIssues) {
            console.log(`ESLint Issues: ${chalk_1.default.red(result.metrics.eslintIssues)}`);
        }
        if (result.metrics.mlSuggestions) {
            console.log(`ML Suggestions: ${chalk_1.default.magenta(result.metrics.mlSuggestions)}`);
        }
    }
    if (result.fixes && result.fixes.length > 0) {
        console.log('\n' + chalk_1.default.blue('🔧 Generated Fixes'));
        console.log('-'.repeat(30));
        const fixTypes = new Map();
        result.fixes.forEach((fix) => {
            const type = fix.issueType || 'unknown';
            fixTypes.set(type, (fixTypes.get(type) || 0) + 1);
        });
        fixTypes.forEach((count, type) => {
            console.log(`${type}: ${chalk_1.default.yellow(count)}`);
        });
    }
}
function showNextSteps(result, options) {
    console.log('\n' + chalk_1.default.blue('🔄 Next Steps'));
    console.log('='.repeat(30));
    if (!options.autoApply && result.fixes && result.fixes.length > 0) {
        console.log('To apply fixes automatically:');
        console.log(chalk_1.default.green(`  auto-fix-agent fix ${options.file} --auto-apply`));
    }
    if (result.fixes && result.fixes.some((f) => f.severity === 'critical')) {
        console.log('\n🚨 Critical issues detected! Consider:');
        console.log('  - Reviewing fixes manually');
        console.log('  - Running tests after fixes');
        console.log('  - Generating Pull Request for review');
    }
    if (options.git && result.fixes && result.fixes.length > 0) {
        console.log('\n🔗 Git integration enabled:');
        console.log('  - Fixes are committed automatically');
        console.log('  - Pull Request generated for review');
        console.log('  - Check .auto-fix/pull-requests/ for PR templates');
    }
    console.log(`\n📋 Detailed reports saved to: ${chalk_1.default.blue(options.output)}`);
}
async function generatePullRequest(file, options) {
    const spinner = (0, ora_1.default)('Generating Pull Request...').start();
    try {
        // This would integrate with the GitIntegration class
        // For now, we'll show a message
        spinner.succeed('Pull Request generation not yet implemented');
        console.log('Use the --generate-pr flag with the fix command instead');
    }
    catch (error) {
        spinner.fail(`Pull Request generation failed: ${error.message}`);
        process.exit(1);
    }
}
async function handleMLOperations(options) {
    if (options.train) {
        const spinner = (0, ora_1.default)('Training ML model...').start();
        try {
            // This would call the ML engine training
            spinner.succeed('ML model training not yet implemented');
        }
        catch (error) {
            spinner.fail(`ML training failed: ${error.message}`);
        }
    }
    if (options.predict) {
        const spinner = (0, ora_1.default)('Generating ML predictions...').start();
        try {
            // This would call the ML engine prediction
            spinner.succeed('ML predictions not yet implemented');
        }
        catch (error) {
            spinner.fail(`ML prediction failed: ${error.message}`);
        }
    }
    if (options.metrics) {
        console.log('ML Model Metrics:');
        console.log('  - Training data size: 0');
        console.log('  - Model accuracy: N/A');
        console.log('  - Last trained: Never');
    }
}
async function handleConfiguration(options) {
    if (options.init) {
        await initializeConfiguration();
    }
    else if (options.show) {
        showConfiguration();
    }
    else if (options.edit) {
        editConfiguration();
    }
    else {
        console.log('Use --init, --show, or --edit to manage configuration');
    }
}
async function initializeConfiguration() {
    const spinner = (0, ora_1.default)('Initializing configuration...').start();
    try {
        const configPath = './auto-fix.config.json';
        const defaultConfig = {
            general: {
                maxFixes: 50,
                autoApply: false,
                requireValidation: true,
                outputPath: './auto-fix-results',
                logLevel: 'info'
            },
            typescript: {
                enabled: true,
                configPath: './tsconfig.json',
                strictMode: true,
                includeNodeModules: false,
                customRules: []
            },
            eslint: {
                enabled: true,
                configPath: './.eslintrc.json',
                autoFix: true,
                customRules: [],
                ignorePatterns: []
            },
            machineLearning: {
                enabled: false,
                modelPath: './ml-models',
                confidenceThreshold: 0.7,
                trainingDataPath: './ml-data',
                updateFrequency: 7
            },
            git: {
                enabled: false,
                autoCommit: false,
                generatePRs: false,
                requireReview: true,
                branchPrefix: 'auto-fix'
            },
            integrations: {
                sonarQube: {
                    enabled: false,
                    url: '',
                    token: '',
                    projectKey: ''
                },
                codeClimate: {
                    enabled: false,
                    url: '',
                    token: '',
                    repositoryId: ''
                },
                github: {
                    enabled: false,
                    token: '',
                    owner: '',
                    repository: ''
                },
                gitlab: {
                    enabled: false,
                    token: '',
                    url: '',
                    projectId: ''
                }
            }
        };
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        spinner.succeed(`Configuration initialized at ${configPath}`);
    }
    catch (error) {
        spinner.fail(`Configuration initialization failed: ${error.message}`);
    }
}
function showConfiguration() {
    const configPath = './auto-fix.config.json';
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('Current Configuration:');
        console.log(JSON.stringify(config, null, 2));
    }
    else {
        console.log('No configuration file found. Run --init to create one.');
    }
}
function editConfiguration() {
    const configPath = './auto-fix.config.json';
    if (fs.existsSync(configPath)) {
        console.log(`Edit configuration file: ${configPath}`);
        console.log('The file will open in your default editor.');
        // In a real implementation, you'd open the file in an editor
    }
    else {
        console.log('No configuration file found. Run --init to create one.');
    }
}
async function handleExternalTools(options) {
    if (options.test) {
        await testExternalTools();
    }
    else {
        console.log('External tool configuration:');
        console.log('  --sonarqube: Configure SonarQube');
        console.log('  --codeclimate: Configure CodeClimate');
        console.log('  --github: Configure GitHub');
        console.log('  --gitlab: Configure GitLab');
        console.log('  --test: Test connections');
    }
}
async function testExternalTools() {
    const spinner = (0, ora_1.default)('Testing external tool connections...').start();
    try {
        // This would test the actual connections
        spinner.succeed('External tool testing not yet implemented');
        console.log('Configure tools first using the configuration options');
    }
    catch (error) {
        spinner.fail(`External tool testing failed: ${error.message}`);
    }
}
// Add help text for common scenarios
program.addHelpText('after', `

Examples:
  $ auto-fix-agent analyze src/components/Button.tsx --typescript --eslint
  $ auto-fix-agent fix src/utils/helpers.ts --auto-apply --git --auto-commit
  $ auto-fix-agent config --init
  $ auto-fix-agent ml --train
  $ auto-fix-agent tools --test

For more information, visit: https://github.com/your-repo/auto-fix-agent
`);
// Parse command line arguments
program.parse();
// If no command is provided, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=enhanced-cli.js.map