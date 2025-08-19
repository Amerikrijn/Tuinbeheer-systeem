import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'yaml'

export interface LLMConfig {
  provider: string
  model: string
  api_key: string
  max_tokens: number
  temperature: number
}

export interface QualityConfig {
  threshold: number
  max_iterations: number
  auto_apply_fixes: boolean
  require_validation: boolean
}

export interface AgentConfig {
  enabled: boolean
  description: string
  focus: string[]
  max_issues_per_file?: number
  max_fixes_per_iteration?: number
  confidence_threshold?: number
  test_framework?: string
  validation_mode?: string
}

export interface PipelineConfig {
  backup_files: boolean
  git_integration: boolean
  output_format: string
  verbose_logging: boolean
}

export interface FilePatterns {
  include: string[]
  exclude: string[]
}

export interface AdvancedConfig {
  retry_attempts: number
  timeout_seconds: number
  batch_size: number
  parallel_processing: boolean
}

export interface FullPipelineConfig {
  llm: LLMConfig
  quality: QualityConfig
  agents: {
    issue_collector: AgentConfig
    code_fixer: AgentConfig
    test_generator: AgentConfig
    quality_validator: AgentConfig
  }
  pipeline: PipelineConfig
  files: FilePatterns
  advanced: AdvancedConfig
}

export class ConfigLoader {
  private configPath: string
  private config: FullPipelineConfig | null = null

  constructor(configPath: string = './config/pipeline-config.yml') {
    this.configPath = configPath
  }

  async load(): Promise<FullPipelineConfig> {
    if (this.config) {
      return this.config
    }

    try {
      // Check if config file exists
      if (!fs.existsSync(this.configPath)) {
        console.log(`📁 Config file not found at ${this.configPath}, using defaults`)
        return this.getDefaultConfig()
      }

      // Read and parse YAML
      const configContent = fs.readFileSync(this.configPath, 'utf-8')
      const parsedConfig = yaml.parse(configContent) as Partial<FullPipelineConfig>

      // Merge with defaults
      this.config = this.mergeWithDefaults(parsedConfig)
      
      console.log(`✅ Configuration loaded from ${this.configPath}`)
      return this.config

    } catch (error) {
      console.warn(`⚠️ Failed to load config: ${error}, using defaults`)
      return this.getDefaultConfig()
    }
  }

  private getDefaultConfig(): FullPipelineConfig {
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
    }
  }

  private mergeWithDefaults(userConfig: Partial<FullPipelineConfig>): FullPipelineConfig {
    const defaults = this.getDefaultConfig()
    
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
    }
  }

  // Helper methods for specific config sections
  getLLMConfig(): LLMConfig | null {
    return this.config?.llm || null
  }

  getQualityConfig(): QualityConfig | null {
    return this.config?.quality || null
  }

  getAgentConfig(agentName: string): AgentConfig | null {
    return this.config?.agents[agentName as keyof typeof this.config.agents] || null
  }

  isAgentEnabled(agentName: string): boolean {
    const agentConfig = this.getAgentConfig(agentName)
    return agentConfig?.enabled || false
  }

  getFilePatterns(): FilePatterns | null {
    return this.config?.files || null
  }
}