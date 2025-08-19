#!/usr/bin/env ts-node
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
const pipeline_1 = require("./pipeline");
const providers_1 = require("./core/providers");
const fs = __importStar(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const program = new commander_1.Command();
program
    .name('ai-pipeline')
    .description('AI-Powered Pipeline for Testing, Orchestration, and Code Fixing')
    .version('2.0.0');
program
    .command('run')
    .description('Run the AI pipeline')
    .option('-t, --target <path>', 'Target directory to analyze', './src')
    .option('-i, --iterations <number>', 'Maximum iterations', '10')
    .option('-q, --quality <number>', 'Quality threshold (0-100)', '90')
    .option('-o, --output <path>', 'Output directory', './ai-pipeline-results')
    .option('--auto-apply', 'Automatically apply fixes', false)
    .option('--git-integration', 'Enable Git integration', false)
    .option('--config <path>', 'Configuration file path')
    .option('--config <path>', 'Configuration file path')
    .action(async (options) => {
    try {
        console.log(chalk_1.default.blue('🚀 AI Pipeline v2.0 Starting...'));
        console.log('');
        // Load configuration
        const config = await loadConfiguration(options.config);
        // Override config with CLI options
        config.maxIterations = parseInt(options.iterations);
        config.qualityThreshold = parseInt(options.quality);
        config.outputPath = options.output;
        config.autoApply = options.autoApply;
        config.gitIntegration = options.gitIntegration;
        // Validate OpenAI API key
        const openaiApiKey = process.env.OPENAI_API_KEY || '';
        if (!openaiApiKey) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }
        // Create and run pipeline
        const pipeline = new pipeline_1.AIPipeline(config, openaiApiKey);
        const results = await pipeline.run(options.target);
        // Display results
        displayResults(results);
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Pipeline failed:'), error);
        process.exit(1);
    }
});
program
    .command('config')
    .description('Manage pipeline configuration')
    .option('--init', 'Initialize default configuration')
    .option('--show', 'Show current configuration')
    .option('--set <key=value>', 'Set configuration value')
    .action(async (options) => {
    try {
        if (options.init) {
            await initializeConfiguration();
        }
        else if (options.show) {
            await showConfiguration();
        }
        else if (options.set) {
            await setConfiguration(options.set);
        }
        else {
            console.log(chalk_1.default.yellow('Use --init, --show, or --set to manage configuration'));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Configuration failed:'), error);
        process.exit(1);
    }
});
program
    .command('agents')
    .description('Manage AI agents')
    .option('--list', 'List available agents')
    .option('--status', 'Check agent status')
    .action(async (options) => {
    try {
        if (options.list) {
            await listAgents();
        }
        else if (options.status) {
            await checkAgentStatus();
        }
        else {
            console.log(chalk_1.default.yellow('Use --list or --status to manage agents'));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Agent management failed:'), error);
        process.exit(1);
    }
});
async function loadConfiguration(configPath) {
    const defaultConfig = {
        agents: [
            {
                id: 'issue-collector',
                name: 'Issue Collector',
                description: 'Finds code issues and problems',
                provider: new providers_1.OpenAIProvider(),
                enabled: true,
                config: {}
            },
            {
                id: 'test-generator',
                name: 'Test Generator',
                description: 'Generates test cases for issues',
                provider: new providers_1.AnthropicProvider(),
                enabled: false,
                config: {}
            },
            {
                id: 'code-fixer',
                name: 'Code Fixer',
                description: 'Fixes identified code issues',
                provider: new providers_1.OpenAIProvider(),
                enabled: false,
                config: {}
            },
            {
                id: 'quality-validator',
                name: 'Quality Validator',
                description: 'Validates fixes and assesses quality',
                provider: new providers_1.OpenAIProvider(),
                enabled: true,
                config: {}
            }
        ],
        maxIterations: 10,
        qualityThreshold: 90,
        autoApply: false,
        gitIntegration: false,
        outputPath: './ai-pipeline-results',
        logLevel: 'info'
    };
    if (configPath && fs.existsSync(configPath)) {
        try {
            const fileContent = fs.readFileSync(configPath, 'utf-8');
            const fileConfig = JSON.parse(fileContent);
            return { ...defaultConfig, ...fileConfig };
        }
        catch (error) {
            console.warn(chalk_1.default.yellow(`Failed to load config from ${configPath}, using defaults`));
        }
    }
    return defaultConfig;
}
async function initializeConfiguration() {
    const configPath = './ai-pipeline.config.json';
    const config = await loadConfiguration();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk_1.default.green(`✅ Configuration initialized at ${configPath}`));
}
async function showConfiguration() {
    const config = await loadConfiguration();
    console.log(chalk_1.default.blue('📋 Current Configuration:'));
    console.log(JSON.stringify(config, null, 2));
}
async function setConfiguration(keyValue) {
    const [key, value] = keyValue.split('=');
    if (!key || !value) {
        throw new Error('Invalid format. Use: --set key=value');
    }
    console.log(chalk_1.default.yellow(`Setting ${key} = ${value} not yet implemented`));
}
async function listAgents() {
    const config = await loadConfiguration();
    console.log(chalk_1.default.blue('🤖 Available Agents:'));
    for (const agent of config.agents) {
        const status = agent.enabled ? chalk_1.default.green('✅ Enabled') : chalk_1.default.red('❌ Disabled');
        const provider = chalk_1.default.cyan(agent.provider.name);
        console.log(`  ${agent.name} (${provider}) - ${status}`);
        console.log(`    ${agent.description}`);
    }
}
async function checkAgentStatus() {
    console.log(chalk_1.default.yellow('Agent status check not yet implemented'));
}
function displayResults(results) {
    console.log('');
    console.log(chalk_1.default.green('🎯 Pipeline Results:'));
    console.log('─'.repeat(50));
    console.log(`Success: ${results.success ? chalk_1.default.green('✅ Yes') : chalk_1.default.red('❌ No')}`);
    console.log(`Iterations: ${chalk_1.default.cyan(results.iterations)}`);
    console.log(`Final Quality: ${chalk_1.default.cyan(results.finalQualityScore.toFixed(1))}%`);
    console.log(`Issues Found: ${chalk_1.default.cyan(results.issuesFound)}`);
    console.log(`Issues Fixed: ${chalk_1.default.cyan(results.issuesFixed)}`);
    console.log(`Tests Generated: ${chalk_1.default.cyan(results.testsGenerated)}`);
    console.log(`Execution Time: ${chalk_1.default.cyan(results.executionTime)}ms`);
    if (results.errors.length > 0) {
        console.log('');
        console.log(chalk_1.default.red('❌ Errors:'), results.errors);
    }
    if (results.warnings.length > 0) {
        console.log('');
        console.log(chalk_1.default.yellow('⚠️ Warnings:'), results.warnings);
    }
}
// Run CLI
if (require.main === module) {
    program.parse();
}
//# sourceMappingURL=cli.js.map