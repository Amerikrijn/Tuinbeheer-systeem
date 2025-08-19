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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigLoader = void 0;
const fs = __importStar(require("fs"));
const yaml = __importStar(require("yaml"));
class ConfigLoader {
    constructor(configPath = './config/pipeline-config.yml') {
        this.config = null;
        this.configPath = configPath;
    }
    async load() {
        if (this.config) {
            return this.config;
        }
        try {
            // Check if config file exists
            if (!fs.existsSync(this.configPath)) {
                console.log(`📁 Config file not found at ${this.configPath}, using defaults`);
                return this.getDefaultConfig();
            }
            // Read and parse YAML
            const configContent = fs.readFileSync(this.configPath, 'utf-8');
            const parsedConfig = yaml.parse(configContent);
            // Merge with defaults
            this.config = this.mergeWithDefaults(parsedConfig);
            console.log(`✅ Configuration loaded from ${this.configPath}`);
            return this.config;
        }
        catch (error) {
            console.warn(`⚠️ Failed to load config: ${error}, using defaults`);
            return this.getDefaultConfig();
        }
    }
    getDefaultConfig() {
        return {
            llm: {
                provider: 'openai',
                model: 'gpt-4',
                api_key: process.env.OPENAI_API_KEY || '',
                max_tokens: 4000,
                temperature: 0.1
            },
            quality: {
                threshold: 85,
                max_iterations: 5,
                auto_apply_fixes: true,
                require_validation: true
            },
            agents: {
                issue_collector: {
                    enabled: true,
                    description: 'Finds code issues and problems',
                    focus: ['security', 'performance', 'quality', 'typescript'],
                    max_issues_per_file: 50
                },
                code_fixer: {
                    enabled: true,
                    description: 'Generates and applies code fixes',
                    focus: ['security', 'performance', 'quality', 'typescript'],
                    max_fixes_per_iteration: 10,
                    confidence_threshold: 70
                },
                test_generator: {
                    enabled: true,
                    description: 'Generates test cases for issues',
                    focus: ['unit_tests', 'integration_tests', 'security_tests'],
                    test_framework: 'jest'
                },
                quality_validator: {
                    enabled: true,
                    description: 'Validates fixes and assesses quality',
                    focus: ['quality', 'validation', 'testing'],
                    validation_mode: 'ai'
                }
            },
            pipeline: {
                backup_files: true,
                git_integration: false,
                output_format: 'json',
                verbose_logging: true
            },
            files: {
                include: ['**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx'],
                exclude: ['**/node_modules/**', '**/dist/**', '**/build/**']
            },
            advanced: {
                retry_attempts: 3,
                timeout_seconds: 30,
                batch_size: 5,
                parallel_processing: true
            }
        };
    }
    mergeWithDefaults(userConfig) {
        const defaults = this.getDefaultConfig();
        return {
            llm: { ...defaults.llm, ...userConfig.llm },
            quality: { ...defaults.quality, ...userConfig.quality },
            agents: {
                issue_collector: { ...defaults.agents.issue_collector, ...userConfig.agents?.issue_collector },
                code_fixer: { ...defaults.agents.code_fixer, ...userConfig.agents?.code_fixer },
                test_generator: { ...defaults.agents.test_generator, ...userConfig.agents?.test_generator },
                quality_validator: { ...defaults.agents.quality_validator, ...userConfig.agents?.quality_validator }
            },
            pipeline: { ...defaults.pipeline, ...userConfig.pipeline },
            files: { ...defaults.files, ...userConfig.files },
            advanced: { ...defaults.advanced, ...userConfig.advanced }
        };
    }
    // Helper methods for specific config sections
    getLLMConfig() {
        return this.config?.llm || null;
    }
    getQualityConfig() {
        return this.config?.quality || null;
    }
    getAgentConfig(agentName) {
        return this.config?.agents[agentName] || null;
    }
    isAgentEnabled(agentName) {
        const agentConfig = this.getAgentConfig(agentName);
        return agentConfig?.enabled || false;
    }
    getFilePatterns() {
        return this.config?.files || null;
    }
}
exports.ConfigLoader = ConfigLoader;
//# sourceMappingURL=config-loader.js.map