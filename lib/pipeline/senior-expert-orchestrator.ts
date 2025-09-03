/**
 * Senior Expert Pipeline Orchestrator
 * Manages echte senior expert agents die zich gedragen als LLMs met jaren ervaring
 */

import { readFileSync, writeFileSync } from 'fs'
import { SeniorAgentFactory, SeniorAgentContext, SeniorAgentResponse } from './senior-expert-agents'

export interface SeniorPipelineStage {
  spec: 'pending' | 'approved' | 'failed'
  tech: 'pending' | 'approved' | 'failed'
  impl: 'pending' | 'approved' | 'failed'
  test: 'pending' | 'approved' | 'failed'
  sec: 'pending' | 'approved' | 'failed'
  perf: 'pending' | 'approved' | 'failed'
  docs: 'pending' | 'approved' | 'failed'
  ready: 'pending' | 'approved' | 'failed'
}

export interface SeniorPipelineState {
  feature: string
  description: string
  stages: SeniorPipelineStage
  current_stage: keyof SeniorPipelineStage | 'completed'
  current_status: 'in_progress' | 'pending' | 'approved' | 'failed'
  emergency_stop: boolean
  notes: string
  created_at: string
  last_updated: string
  agent_responses: { [key: string]: SeniorAgentResponse }
  user_input: { [key: string]: string }
  selected_alternatives: { [key: string]: any }
  approved_recommendations: { [key: string]: any }
}

export class SeniorExpertPipelineOrchestrator {
  private approvalsPath = '.agent/approvals.yml'

  /**
   * Load current pipeline state
   */
  loadState(): SeniorPipelineState {
    try {
      const content = readFileSync(this.approvalsPath, 'utf8')
      const lines = content.split('\n')
      const state: SeniorPipelineState = {
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
        user_input: {},
        selected_alternatives: {},
        approved_recommendations: {}
      }
      
      // Parse the YAML content
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('feature:')) {
          state.feature = trimmed.split(':')[1].trim().replace(/"/g, '')
        } else if (trimmed.startsWith('description:')) {
          state.description = trimmed.split(':')[1].trim().replace(/"/g, '')
        } else if (trimmed.startsWith('current_stage:')) {
          state.current_stage = trimmed.split(':')[1].trim() as keyof SeniorPipelineStage
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
        user_input: {},
        selected_alternatives: {},
        approved_recommendations: {}
      }
    }
  }

  /**
   * Save pipeline state
   */
  saveState(state: SeniorPipelineState): void {
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
  startPipeline(feature: string, description: string): SeniorPipelineState {
    const state: SeniorPipelineState = {
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
      notes: `Started senior expert pipeline for ${feature}`,
      created_at: new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString().split('T')[0],
      agent_responses: {},
      user_input: {},
      selected_alternatives: {},
      approved_recommendations: {}
    }

    this.saveState(state)
    return state
  }

  /**
   * Get current stage that needs to be executed
   */
  getCurrentStage(): keyof SeniorPipelineStage | 'completed' {
    const state = this.loadState()
    
    if (state.emergency_stop) {
      throw new Error('Pipeline is in emergency stop mode')
    }

    // Use the current_stage from state if it's set
    if (state.current_stage && state.current_stage !== 'completed') {
      return state.current_stage
    }

    const stages: (keyof SeniorPipelineStage)[] = ['spec', 'tech', 'impl', 'test', 'sec', 'perf', 'docs', 'ready']
    
    for (const stage of stages) {
      if (state.stages[stage] !== 'approved') {
        return stage
      }
    }

    return 'completed'
  }

  /**
   * Execute current stage with senior expert agent
   */
  async executeCurrentStage(): Promise<SeniorAgentResponse> {
    const state = this.loadState()
    const currentStage = this.getCurrentStage()
    
    if (currentStage === 'completed') {
      return {
        success: true,
        message: '🎉 Senior Expert Pipeline already completed!',
        requiresApproval: false,
        nextAction: 'Create PR and deploy'
      }
    }

    // Create agent context
    const context: SeniorAgentContext = {
      feature: state.feature,
      description: state.description,
      currentStage: currentStage as string,
      userInput: state.user_input[currentStage] || undefined,
      approvals: state.stages,
      previousStageResults: state.agent_responses
    }

    // Create and execute senior expert agent
    const agent = SeniorAgentFactory.createAgent(currentStage as string, context)
    const response = await agent.execute()

    // Store agent response
    state.agent_responses[currentStage] = response
    state.last_updated = new Date().toISOString().split('T')[0]
    
    // Update status based on response
    if (response.requiresApproval) {
      state.current_status = 'pending'
      state.notes = `Waiting for approval of ${currentStage} stage from senior expert`
    } else if (response.success) {
      state.stages[currentStage] = 'approved'
      state.current_status = 'in_progress'
      state.notes = `${currentStage} stage completed by senior expert`
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
  approveStage(stage: keyof SeniorPipelineStage, userInput?: string, selectedAlternative?: any, approvedRecommendation?: any): SeniorPipelineState {
    const state = this.loadState()
    
    state.stages[stage] = 'approved'
    
    // Store user input if provided
    if (userInput) {
      state.user_input[stage] = userInput
    }
    
    // Store selected alternative if provided
    if (selectedAlternative) {
      state.selected_alternatives[stage] = selectedAlternative
    }
    
    // Store approved recommendation if provided
    if (approvedRecommendation) {
      state.approved_recommendations[stage] = approvedRecommendation
    }
    
    // Find next stage manually
    const stages: (keyof SeniorPipelineStage)[] = ['spec', 'tech', 'impl', 'test', 'sec', 'perf', 'docs', 'ready']
    let nextStage: keyof SeniorPipelineStage | 'completed' = 'completed'
    
    for (const s of stages) {
      if (state.stages[s] !== 'approved') {
        nextStage = s
        break
      }
    }
    
    state.current_stage = nextStage
    state.current_status = nextStage === 'completed' ? 'approved' : 'in_progress'
    state.last_updated = new Date().toISOString().split('T')[0]
    state.notes = nextStage === 'completed' ? 'Senior Expert Pipeline completed' : `Ready for ${nextStage} stage with senior expert`
    
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
    agent_analysis?: any
    agent_alternatives?: any[]
    agent_recommendations?: any[]
    requires_user_input: boolean
  } {
    const state = this.loadState()
    
    const totalStages = 8
    const completedStages = Object.values(state.stages).filter(s => s === 'approved').length
    const progress = `${completedStages}/${totalStages}`
    
    let nextAction = ''
    let requiresUserInput = false
    let agentAnalysis: any = undefined
    let agentAlternatives: any[] = []
    let agentRecommendations: any[] = []
    
    if (state.current_status === 'pending') {
      const currentStage = state.current_stage
      const agentResponse = state.agent_responses[currentStage]
      
      if (agentResponse) {
        agentAnalysis = agentResponse.analysis
        agentAlternatives = agentResponse.alternatives || []
        agentRecommendations = agentResponse.recommendations || []
        requiresUserInput = true
        nextAction = `Please review the senior expert analysis and choose your preferred approach`
      } else {
        nextAction = `Keur ${currentStage} stage goed in .agent/approvals.yml`
      }
    } else if (state.current_status === 'in_progress') {
      nextAction = `Wacht tot ${state.current_stage} stage voltooid is door senior expert`
    } else if (state.current_status === 'approved') {
      nextAction = 'Senior Expert Pipeline voltooid! 🚀'
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
      agent_analysis: agentAnalysis,
      agent_alternatives: agentAlternatives.length > 0 ? agentAlternatives : undefined,
      agent_recommendations: agentRecommendations.length > 0 ? agentRecommendations : undefined,
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

  /**
   * Select alternative for current stage
   */
  selectAlternative(alternative: any): void {
    const state = this.loadState()
    const currentStage = state.current_stage
    
    if (currentStage && currentStage !== 'completed') {
      state.selected_alternatives[currentStage] = alternative
      state.last_updated = new Date().toISOString().split('T')[0]
      this.saveState(state)
    }
  }

  /**
   * Approve recommendation for current stage
   */
  approveRecommendation(recommendation: any): void {
    const state = this.loadState()
    const currentStage = state.current_stage
    
    if (currentStage && currentStage !== 'completed') {
      state.approved_recommendations[currentStage] = recommendation
      state.last_updated = new Date().toISOString().split('T')[0]
      this.saveState(state)
    }
  }
}
