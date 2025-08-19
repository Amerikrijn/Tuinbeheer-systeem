import { 
  AgentConfig, 
  AgentHealth, 
  HealthCheckConfig,
  PipelineStatus 
} from './types'
import * as fs from 'fs'
import * as path from 'path'
import { spawn } from 'child_process'

export class AgentManager {
  private agents: Map<string, AgentConfig> = new Map()
  private agentHealth: Map<string, AgentHealth> = new Map()
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map()
  private startTime: number

  constructor() {
    this.startTime = Date.now()
  }

  /**
   * Register an agent
   */
  registerAgent(config: AgentConfig): void {
    this.agents.set(config.id, config)
    
    if (config.healthCheck.enabled) {
      this.startHealthCheck(config)
    }
    
    console.log(`✅ Registered agent: ${config.name} (${config.type})`)
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): boolean {
    const agent = this.agents.get(agentId)
    if (!agent) return false

    // Stop health check
    this.stopHealthCheck(agentId)
    
    // Remove from maps
    this.agents.delete(agentId)
    this.agentHealth.delete(agentId)
    
    console.log(`❌ Unregistered agent: ${agent.name}`)
    return true
  }

  /**
   * Get agent configuration
   */
  getAgent(agentId: string): AgentConfig | undefined {
    return this.agents.get(agentId)
  }

  /**
   * Get all agents
   */
  getAllAgents(): AgentConfig[] {
    return Array.from(this.agents.values())
  }

  /**
   * Get agents by type
   */
  getAgentsByType(type: string): AgentConfig[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type)
  }

  /**
   * Start health check for an agent
   */
  private startHealthCheck(config: AgentConfig): void {
    const interval = setInterval(async () => {
      await this.performHealthCheck(config)
    }, config.healthCheck.interval)

    this.healthCheckIntervals.set(config.id, interval)
  }

  /**
   * Stop health check for an agent
   */
  private stopHealthCheck(agentId: string): void {
    const interval = this.healthCheckIntervals.get(agentId)
    if (interval) {
      clearInterval(interval)
      this.healthCheckIntervals.delete(agentId)
    }
  }

  /**
   * Perform health check for an agent
   */
  private async performHealthCheck(config: AgentConfig): Promise<void> {
    try {
      const startTime = Date.now()
      const health = await this.checkAgentHealth(config)
      const responseTime = Date.now() - startTime

      // Update health status
      this.agentHealth.set(config.id, {
        ...health,
        lastCheck: new Date().toISOString(),
        responseTime
      })

      // Update agent status if needed
      if (health.status === 'critical' && config.status !== 'error') {
        config.status = 'error'
        console.warn(`⚠️ Agent ${config.name} is in critical health state`)
      } else if (health.status === 'healthy' && config.status === 'error') {
        config.status = 'active'
        console.log(`✅ Agent ${config.name} recovered from error state`)
      }

    } catch (error) {
      console.error(`Health check failed for agent ${config.name}:`, error)
      
      // Mark as offline
      this.agentHealth.set(config.id, {
        agentId: config.id,
        status: 'offline',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 1.0,
        uptime: 0
      })
    }
  }

  /**
   * Check agent health
   */
  private async checkAgentHealth(config: AgentConfig): Promise<AgentHealth> {
    const healthCheck = config.healthCheck

    if (healthCheck.endpoint) {
      return await this.checkEndpointHealth(config, healthCheck)
    } else {
      return await this.checkProcessHealth(config, healthCheck)
    }
  }

  /**
   * Check endpoint health
   */
  private async checkEndpointHealth(config: AgentConfig, healthCheck: HealthCheckConfig): Promise<AgentHealth> {
    // For now, we'll simulate endpoint health check
    // In a real implementation, this would make HTTP requests
    return {
      agentId: config.id,
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      responseTime: Math.random() * 100,
      errorRate: 0.0,
      uptime: Date.now() - this.startTime
    }
  }

  /**
   * Check process health
   */
  private async checkProcessHealth(config: AgentConfig, healthCheck: HealthCheckConfig): Promise<AgentHealth> {
    try {
      // Check if agent directory exists
      const agentPath = path.resolve(config.path)
      if (!fs.existsSync(agentPath)) {
        return {
          agentId: config.id,
          status: 'critical',
          lastCheck: new Date().toISOString(),
          responseTime: 0,
          errorRate: 1.0,
          uptime: 0
        }
      }

      // Check if package.json exists
      const packagePath = path.join(agentPath, 'package.json')
      if (!fs.existsSync(packagePath)) {
        return {
          agentId: config.id,
          status: 'warning',
          lastCheck: new Date().toISOString(),
          responseTime: 0,
          errorRate: 0.5,
          uptime: Date.now() - this.startTime
        }
      }

      // Try to run a simple command to check if agent is responsive
      const isResponsive = await this.testAgentResponsiveness(config)
      
      return {
        agentId: config.id,
        status: isResponsive ? 'healthy' : 'warning',
        lastCheck: new Date().toISOString(),
        responseTime: isResponsive ? Math.random() * 50 : 0,
        errorRate: isResponsive ? 0.0 : 0.3,
        uptime: Date.now() - this.startTime
      }

    } catch (error) {
      return {
        agentId: config.id,
        status: 'critical',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 1.0,
        uptime: 0
      }
    }
  }

  /**
   * Test if agent is responsive
   */
  private async testAgentResponsiveness(config: AgentConfig): Promise<boolean> {
    return new Promise((resolve) => {
      const agentPath = path.resolve(config.path)
      
      // Try to run help command
      const agentProcess = spawn('npx', ['ts-node', 'cli.ts', '--help'], {
        cwd: agentPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 5000 // 5 second timeout
      })

      let hasOutput = false

      agentProcess.stdout?.on('data', () => {
        hasOutput = true
      })

      agentProcess.on('close', (code) => {
        resolve(hasOutput && code === 0)
      })

      agentProcess.on('error', () => {
        resolve(false)
      })

      // Timeout fallback
      setTimeout(() => {
        agentProcess.kill()
        resolve(false)
      }, 5000)
    })
  }

  /**
   * Get agent health status
   */
  getAgentHealth(agentId: string): AgentHealth | undefined {
    return this.agentHealth.get(agentId)
  }

  /**
   * Get all agent health statuses
   */
  getAllAgentHealth(): AgentHealth[] {
    return Array.from(this.agentHealth.values())
  }

  /**
   * Get pipeline status
   */
  getPipelineStatus(): PipelineStatus {
    const totalAgents = this.agents.size
    const healthyAgents = Array.from(this.agentHealth.values()).filter(h => h.status === 'healthy').length
    const criticalAgents = Array.from(this.agentHealth.values()).filter(h => h.status === 'critical').length

    let status: 'running' | 'idle' | 'error' | 'maintenance' = 'running'
    
    if (criticalAgents > 0) {
      status = 'error'
    } else if (healthyAgents === 0) {
      status = 'idle'
    }

    return {
      status,
      activeWorkflows: 0, // This would come from WorkflowEngine
      queuedWorkflows: 0, // This would come from WorkflowEngine
      agentStatus: Object.fromEntries(
        Array.from(this.agents.entries()).map(([id, agent]) => [id, agent.status])
      ),
      lastActivity: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      registeredAgents: totalAgents,
      totalIterations: 0 // This would come from PipelineOrchestrator
    }
  }

  /**
   * Get agent statistics
   */
  getAgentStatistics(): {
    total: number
    active: number
    inactive: number
    error: number
    healthy: number
    warning: number
    critical: number
    offline: number
  } {
    const agents = Array.from(this.agents.values())
    const health = Array.from(this.agentHealth.values())

    return {
      total: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      inactive: agents.filter(a => a.status === 'inactive').length,
      error: agents.filter(a => a.status === 'error').length,
      healthy: health.filter(h => h.status === 'healthy').length,
      warning: health.filter(h => h.status === 'warning').length,
      critical: health.filter(h => h.status === 'critical').length,
      offline: health.filter(h => h.status === 'offline').length
    }
  }

  /**
   * Restart agent health checks
   */
  restartHealthChecks(): void {
    // Stop all existing health checks
    for (const [agentId, interval] of this.healthCheckIntervals) {
      clearInterval(interval)
    }
    this.healthCheckIntervals.clear()

    // Restart health checks for all agents
    for (const agent of this.agents.values()) {
      if (agent.healthCheck.enabled) {
        this.startHealthCheck(agent)
      }
    }

    console.log('🔄 Restarted all agent health checks')
  }

  /**
   * Stop all health checks
   */
  stopAllHealthChecks(): void {
    for (const [agentId, interval] of this.healthCheckIntervals) {
      clearInterval(interval)
    }
    this.healthCheckIntervals.clear()
    console.log('⏹️ Stopped all agent health checks')
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopAllHealthChecks()
    this.agents.clear()
    this.agentHealth.clear()
  }
}