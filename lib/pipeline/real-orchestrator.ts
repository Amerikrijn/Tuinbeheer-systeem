/**
 * Real AI Pipeline Orchestrator
 * Manages echte AI agents met LLM interactie en approvals workflow
 */

import { readFileSync, writeFileSync } from 'fs'
import { AgentFactory, AgentContext, AgentResponse } from './real-ai-agents'

export interface PipelineStage {
  spec: 'pending' | 'approved' | 'failed'
  tech: 'pending' | 'approved' | 'failed'
  impl: 'pending' | 'approved' | 'failed'
  test: 'pending' | 'approved' | 'failed'
  sec: 'pending' | 'approved' | 'failed'
  perf: 'pending' | 'approved' | 'failed'
  docs: 'pending' | 'approved' | 'failed'
  ready: 'pending' | 'approved' | 'failed'
}

export interface PipelineState {
  feature: string
  description: string
  stages: PipelineStage
  current_stage: keyof PipelineStage | 'completed'
  current_status: 'in_progress' | 'pending' | 'approved' | 'failed'
  emergency_stop: boolean
  notes: string
  created_at: string
  last_updated: string
  agent_responses: { [key: string]: AgentResponse }
  user_input: { [key: string]: string }
}

export class RealAIPipelineOrchestrator {
  private approvalsPath = '.agent/approvals.yml'

  /**
   * Load current pipeline state
   */
  loadState(): PipelineState {
    try {
      const content = readFileSync(this.approvalsPath, 'utf8')
      // Parse YAML content
      const lines = content.split('\n')
      const state: PipelineState = {
        feature: 'new-feature',
        description: '',
        stages: {
          spec: 'pending',
          tech: 'pending',
          impl: 'pending',
          test: 'pending',
          sec: 'pending',
          perf: 'pending',
          docs: 'pending',
          ready: 'pending'
        },
        current_stage: 'spec',
        current_status: 'in_progress',
        emergency_stop: false,
        notes: 'Pipeline ready',
        created_at: new Date().toISOString().split('T')[0],
        last_updated: new Date().toISOString().split('T')[0],
        agent_responses: {},
        user_input: {}
      }
      
      // Parse the YAML content
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('feature:')) {
          state.feature = trimmed.split(':')[1].trim().replace(/"/g, '')
        } else if (trimmed.startsWith('description:')) {
          state.description = trimmed.split(':')[1].trim().replace(/"/g, '')
        } else if (trimmed.startsWith('current_stage:')) {
          state.current_stage = trimmed.split(':')[1].trim() as keyof PipelineStage
        } else if (trimmed.startsWith('current_status:')) {
          state.current_status = trimmed.split(':')[1].trim() as 'in_progress' | 'pending' | 'approved' | 'failed'
        } else if (trimmed.startsWith('emergency_stop:')) {
          state.emergency_stop = trimmed.split(':')[1].trim() === 'true'
        } else if (trimmed.startsWith('notes:')) {
          state.notes = trimmed.split(':')[1].trim().replace(/"/g, '')
        } else if (trimmed.startsWith('created_at:')) {
          state.created_at = trimmed.split(':')[1].trim().replace(/"/g, '')
        } else if (trimmed.startsWith('last_updated:')) {
          state.last_updated = trimmed.split(':')[1].trim().replace(/"/g, '')
        } else if (trimmed.startsWith('spec:')) {
          state.stages.spec = trimmed.split(':')[1].trim() as 'pending' | 'approved' | 'failed'
        } else if (trimmed.startsWith('tech:')) {
          state.stages.tech = trimmed.split(':')[1].trim() as 'pending' | 'approved' | 'failed'
        } else if (trimmed.startsWith('impl:')) {
          state.stages.impl = trimmed.split(':')[1].trim() as 'pending' | 'approved' | 'failed'
        } else if (trimmed.startsWith('test:')) {
          state.stages.test = trimmed.split(':')[1].trim() as 'pending' | 'approved' | 'failed'
        } else if (trimmed.startsWith('sec:')) {
          state.stages.sec = trimmed.split(':')[1].trim() as 'pending' | 'approved' | 'failed'
        } else if (trimmed.startsWith('perf:')) {
          state.stages.perf = trimmed.split(':')[1].trim() as 'pending' | 'approved' | 'failed'
        } else if (trimmed.startsWith('docs:')) {
          state.stages.docs = trimmed.split(':')[1].trim() as 'pending' | 'approved' | 'failed'
        } else if (trimmed.startsWith('ready:')) {
          state.stages.ready = trimmed.split(':')[1].trim() as 'pending' | 'approved' | 'failed'
        }
      }
      
      return state
    } catch (error) {
      // Return default state if file doesn't exist
      return {
        feature: 'new-feature',
        description: '',
        stages: {
          spec: 'pending',
          tech: 'pending',
          impl: 'pending',
          test: 'pending',
          sec: 'pending',
          perf: 'pending',
          docs: 'pending',
          ready: 'pending'
        },
        current_stage: 'spec',
        current_status: 'in_progress',
        emergency_stop: false,
        notes: 'Pipeline ready',
        created_at: new Date().toISOString().split('T')[0],
        last_updated: new Date().toISOString().split('T')[0],
        agent_responses: {},
        user_input: {}
      }
    }
  }

  /**
   * Save pipeline state
   */
  saveState(state: PipelineState): void {
    try {
      const yamlContent = `feature: "${state.feature}"
description: "${state.description}"
stages:
  spec: ${state.stages.spec}
  tech: ${state.stages.tech}
  impl: ${state.stages.impl}
  test: ${state.stages.test}
  sec: ${state.stages.sec}
  perf: ${state.stages.perf}
  docs: ${state.stages.docs}
  ready: ${state.stages.ready}
current_stage: ${state.current_stage}
current_status: ${state.current_status}
emergency_stop: ${state.emergency_stop}
notes: "${state.notes}"
created_at: "${state.created_at}"
last_updated: "${state.last_updated}"`
      
      writeFileSync(this.approvalsPath, yamlContent, 'utf8')
    } catch (error) {
      console.error('Failed to save pipeline state:', error)
    }
  }

  /**
   * Start new pipeline for feature
   */
  startPipeline(feature: string, description: string): PipelineState {
    const state: PipelineState = {
      feature,
      description,
      stages: {
        spec: 'pending',
        tech: 'pending',
        impl: 'pending',
        test: 'pending',
        sec: 'pending',
        perf: 'pending',
        docs: 'pending',
        ready: 'pending'
      },
      current_stage: 'spec',
      current_status: 'in_progress',
      emergency_stop: false,
      notes: `Started pipeline for ${feature}`,
      created_at: new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString().split('T')[0],
      agent_responses: {},
      user_input: {}
    }

    this.saveState(state)
    return state
  }

  /**
   * Get current stage that needs to be executed
   */
  getCurrentStage(): keyof PipelineStage | 'completed' {
    const state = this.loadState()
    
    if (state.emergency_stop) {
      throw new Error('Pipeline is in emergency stop mode')
    }

    // Use the current_stage from state if it's set
    if (state.current_stage && state.current_stage !== 'completed') {
      return state.current_stage
    }

    const stages: (keyof PipelineStage)[] = ['spec', 'tech', 'impl', 'test', 'sec', 'perf', 'docs', 'ready']
    
    for (const stage of stages) {
      if (state.stages[stage] !== 'approved') {
        return stage
      }
    }

    return 'completed'
  }

  /**
   * Execute current stage with AI agent
   */
  async executeCurrentStage(): Promise<AgentResponse> {
    const state = this.loadState()
    const currentStage = this.getCurrentStage()
    
    if (currentStage === 'completed') {
      return {
        success: true,
        message: '🎉 Pipeline already completed!',
        requiresApproval: false,
        nextAction: 'Create PR and deploy'
      }
    }

    // Create agent context
    const context: AgentContext = {
      feature: state.feature,
      description: state.description,
      currentStage: currentStage as string,
      userInput: state.user_input[currentStage] || undefined,
      approvals: state.stages
    }

    // Create and execute agent
    const agent = AgentFactory.createAgent(currentStage as string, context)
    const response = await agent.execute()

    // Store agent response
    state.agent_responses[currentStage] = response
    state.last_updated = new Date().toISOString().split('T')[0]
    
    // Update status based on response
    if (response.requiresApproval) {
      state.current_status = 'pending'
      state.notes = `Waiting for approval of ${currentStage} stage`
    } else if (response.success) {
      state.stages[currentStage] = 'approved'
      state.current_status = 'in_progress'
      state.notes = `${currentStage} stage completed`
    } else {
      state.stages[currentStage] = 'failed'
      state.current_status = 'failed'
      state.notes = `${currentStage} stage failed: ${response.message}`
    }

    this.saveState(state)
    return response
  }

  /**
   * Approve current stage and move to next
   */
  approveStage(stage: keyof PipelineStage, userInput?: string): PipelineState {
    const state = this.loadState()
    
    state.stages[stage] = 'approved'
    
    // Store user input if provided
    if (userInput) {
      state.user_input[stage] = userInput
    }
    
    // Find next stage manually
    const stages: (keyof PipelineStage)[] = ['spec', 'tech', 'impl', 'test', 'sec', 'perf', 'docs', 'ready']
    let nextStage: keyof PipelineStage | 'completed' = 'completed'
    
    for (const s of stages) {
      if (state.stages[s] !== 'approved') {
        nextStage = s
        break
      }
    }
    
    state.current_stage = nextStage
    state.current_status = nextStage === 'completed' ? 'approved' : 'in_progress'
    state.last_updated = new Date().toISOString().split('T')[0]
    state.notes = nextStage === 'completed' ? 'Pipeline completed' : `Ready for ${nextStage} stage`
    
    this.saveState(state)
    return state
  }

  /**
   * Get pipeline status
   */
  getStatus(): {
    feature: string
    description: string
    current_stage: string
    current_status: string
    progress: string
    next_action: string
    agent_questions?: string[]
    requires_user_input: boolean
  } {
    const state = this.loadState()
    
    const totalStages = 8
    const completedStages = Object.values(state.stages).filter(s => s === 'approved').length
    const progress = `${completedStages}/${totalStages}`
    
    let nextAction = ''
    let requiresUserInput = false
    let agentQuestions: string[] = []
    
    if (state.current_status === 'pending') {
      const currentStage = state.current_stage
      const agentResponse = state.agent_responses[currentStage]
      
      if (agentResponse && agentResponse.questions) {
        agentQuestions = agentResponse.questions
        requiresUserInput = true
        nextAction = `Please answer the questions from the ${currentStage} agent`
      } else {
        nextAction = `Keur ${currentStage} stage goed in .agent/approvals.yml`
      }
    } else if (state.current_status === 'in_progress') {
      nextAction = `Wacht tot ${state.current_stage} stage voltooid is`
    } else if (state.current_status === 'approved') {
      nextAction = 'Pipeline voltooid! 🚀'
    } else if (state.current_status === 'failed') {
      nextAction = 'Pipeline failed - check logs and fix issues'
    }
    
    return {
      feature: state.feature,
      description: state.description,
      current_stage: state.current_stage,
      current_status: state.current_status,
      progress,
      next_action: nextAction,
      agent_questions: agentQuestions.length > 0 ? agentQuestions : undefined,
      requires_user_input: requiresUserInput
    }
  }

  /**
   * Provide user input for current stage
   */
  provideUserInput(input: string): void {
    const state = this.loadState()
    const currentStage = state.current_stage
    
    if (currentStage && currentStage !== 'completed') {
      state.user_input[currentStage] = input
      state.last_updated = new Date().toISOString().split('T')[0]
      this.saveState(state)
    }
  }
}
