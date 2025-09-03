/**
 * Enterprise AI Pipeline Orchestrator
 * Manages SPEC → TECH → IMPL → TEST → SEC → PERF → DOCS → READY workflow
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import * as yaml from 'js-yaml'

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
  stages: PipelineStage
  current_stage: keyof PipelineStage | 'completed'
  current_status: 'in_progress' | 'pending' | 'approved' | 'failed'
  emergency_stop: boolean
  notes: string
  created_at: string
  last_updated: string
}

export class PipelineOrchestrator {
  private approvalsPath = '.agent/approvals.yml'

  /**
   * Load current pipeline state
   */
  loadState(): PipelineState {
    try {
      const content = readFileSync(this.approvalsPath, 'utf8')
      return yaml.load(content) as PipelineState
    } catch (error) {
      throw new Error(`Failed to load pipeline state: ${error}`)
    }
  }

  /**
   * Save pipeline state
   */
  saveState(state: PipelineState): void {
    try {
      const yamlContent = yaml.dump(state, { indent: 2 })
      writeFileSync(this.approvalsPath, yamlContent, 'utf8')
    } catch (error) {
      throw new Error(`Failed to save pipeline state: ${error}`)
    }
  }

  /**
   * Start new pipeline for feature
   */
  startPipeline(feature: string): PipelineState {
    const state: PipelineState = {
      feature,
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
      last_updated: new Date().toISOString().split('T')[0]
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

    // Find first stage that is not approved
    const stages: (keyof PipelineStage)[] = ['spec', 'tech', 'impl', 'test', 'sec', 'perf', 'docs', 'ready']
    
    for (const stage of stages) {
      if (state.stages[stage] !== 'approved') {
        return stage
      }
    }

    return 'completed'
  }

  /**
   * Approve current stage and move to next
   */
  approveStage(stage: keyof PipelineStage): PipelineState {
    const state = this.loadState()
    
    // Approve the stage
    state.stages[stage] = 'approved'
    
    // Move to next stage
    const nextStage = this.getCurrentStage()
    state.current_stage = nextStage
    state.current_status = nextStage === 'completed' ? 'approved' : 'pending'
    state.last_updated = new Date().toISOString().split('T')[0]
    
    this.saveState(state)
    return state
  }

  /**
   * Fail current stage
   */
  failStage(stage: keyof PipelineStage, reason: string): PipelineState {
    const state = this.loadState()
    
    state.stages[stage] = 'failed'
    state.current_status = 'failed'
    state.notes = reason
    state.last_updated = new Date().toISOString().split('T')[0]
    
    this.saveState(state)
    return state
  }

  /**
   * Get pipeline status
   */
  getStatus(): {
    feature: string
    current_stage: string
    current_status: string
    progress: string
    next_action: string
  } {
    const state = this.loadState()
    
    const totalStages = 8
    const completedStages = Object.values(state.stages).filter(s => s === 'approved').length
    const progress = `${completedStages}/${totalStages}`
    
    let nextAction = ''
    if (state.current_status === 'pending') {
      nextAction = `Keur ${state.current_stage} stage goed in .agent/approvals.yml`
    } else if (state.current_status === 'in_progress') {
      nextAction = `Wacht tot ${state.current_stage} stage voltooid is`
    } else if (state.current_status === 'approved') {
      nextAction = 'Pipeline voltooid! 🚀'
    }
    
    return {
      feature: state.feature,
      current_stage: state.current_stage,
      current_status: state.current_status,
      progress,
      next_action
    }
  }

  /**
   * Emergency stop pipeline
   */
  emergencyStop(reason: string): PipelineState {
    const state = this.loadState()
    
    state.emergency_stop = true
    state.current_status = 'failed'
    state.notes = `EMERGENCY STOP: ${reason}`
    state.last_updated = new Date().toISOString().split('T')[0]
    
    this.saveState(state)
    return state
  }
}
