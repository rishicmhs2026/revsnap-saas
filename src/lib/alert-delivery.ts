// Custom alerts delivery system for Professional and Enterprise plans
import { PlanService } from './plan-limits'

export interface CustomAlert {
  id: string
  organizationId: string
  name: string
  description: string
  type: 'price_change' | 'competitor_action' | 'market_shift' | 'threshold' | 'custom'
  conditions: AlertCondition[]
  actions: AlertAction[]
  status: 'active' | 'paused' | 'disabled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastTriggered?: Date
  triggerCount: number
}

export interface AlertCondition {
  id: string
  field: string // e.g., 'competitor_price', 'market_share', 'demand'
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'contains' | 'changes_by'
  value: string | number | Array<string | number>
  logic?: 'and' | 'or' // for combining multiple conditions
}

export interface AlertAction {
  id: string
  type: 'email' | 'webhook' | 'slack' | 'teams' | 'sms' | 'push' | 'in_app'
  configuration: Record<string, any>
  enabled: boolean
}

export interface AlertTrigger {
  id: string
  alertId: string
  organizationId: string
  triggeredAt: Date
  triggerData: Record<string, any>
  conditionsMet: string[]
  actionsExecuted: AlertActionResult[]
  resolved: boolean
  resolvedAt?: Date
}

export interface AlertActionResult {
  actionId: string
  actionType: string
  status: 'success' | 'failed' | 'pending'
  executedAt: Date
  error?: string
  response?: any
}

// Predefined alert templates
export const ALERT_TEMPLATES: Record<string, Omit<CustomAlert, 'id' | 'organizationId' | 'createdBy' | 'createdAt' | 'updatedAt' | 'triggerCount'>> = {
  price_drop: {
    name: 'Competitor Price Drop',
    description: 'Alert when a competitor drops their price significantly',
    type: 'price_change',
    conditions: [
      {
        id: 'condition_1',
        field: 'competitor_price_change_percent',
        operator: 'less_than',
        value: -10 // 10% price drop
      }
    ],
    actions: [
      {
        id: 'action_1',
        type: 'email',
        configuration: {
          subject: 'Competitor Price Drop Alert',
          template: 'price_drop_alert'
        },
        enabled: true
      }
    ],
    status: 'active',
    priority: 'high',
    frequency: 'immediate'
  },
  market_share_loss: {
    name: 'Market Share Decline',
    description: 'Alert when market share drops below threshold',
    type: 'market_shift',
    conditions: [
      {
        id: 'condition_1',
        field: 'market_share_percent',
        operator: 'less_than',
        value: 15 // Below 15% market share
      }
    ],
    actions: [
      {
        id: 'action_1',
        type: 'email',
        configuration: {
          subject: 'Market Share Alert',
          priority: 'high'
        },
        enabled: true
      },
      {
        id: 'action_2',
        type: 'slack',
        configuration: {
          channel: '#alerts',
          message: 'Market share has dropped below 15%'
        },
        enabled: false
      }
    ],
    status: 'active',
    priority: 'critical',
    frequency: 'daily'
  },
  inventory_low: {
    name: 'Low Inventory Alert',
    description: 'Alert when competitor inventory is running low',
    type: 'threshold',
    conditions: [
      {
        id: 'condition_1',
        field: 'competitor_inventory_level',
        operator: 'less_than',
        value: 10
      }
    ],
    actions: [
      {
        id: 'action_1',
        type: 'in_app',
        configuration: {
          title: 'Opportunity Alert',
          message: 'Competitor inventory is low - consider price adjustment'
        },
        enabled: true
      }
    ],
    status: 'active',
    priority: 'medium',
    frequency: 'hourly'
  }
}

export class AlertDeliveryService {
  private static alertQueue: Map<string, AlertTrigger> = new Map()
  private static isProcessing = false

  /**
   * Check if custom alerts are available for the plan
   */
  static isAvailable(planId: string): boolean {
    return PlanService.hasFeature(planId, 'customAlerts')
  }

  /**
   * Get alert limits based on plan
   */
  static getAlertLimits(planId: string): {
    maxAlerts: number
    maxActionsPerAlert: number
    availableChannels: string[]
    hasAdvancedConditions: boolean
    hasWebhooks: boolean
    customFrequency: boolean
  } {
    switch (planId) {
      case 'professional':
        return {
          maxAlerts: 10,
          maxActionsPerAlert: 3,
          availableChannels: ['email', 'in_app', 'webhook'],
          hasAdvancedConditions: false,
          hasWebhooks: true,
          customFrequency: false
        }
      case 'enterprise':
        return {
          maxAlerts: -1, // unlimited
          maxActionsPerAlert: -1, // unlimited
          availableChannels: ['email', 'webhook', 'slack', 'teams', 'sms', 'push', 'in_app'],
          hasAdvancedConditions: true,
          hasWebhooks: true,
          customFrequency: true
        }
      default:
        return {
          maxAlerts: 0,
          maxActionsPerAlert: 0,
          availableChannels: [],
          hasAdvancedConditions: false,
          hasWebhooks: false,
          customFrequency: false
        }
    }
  }

  /**
   * Create a custom alert
   */
  static async createAlert(
    organizationId: string,
    alert: Omit<CustomAlert, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'triggerCount'>,
    planId: string
  ): Promise<{ success: boolean; alert?: CustomAlert; error?: string }> {
    try {
      // Check if custom alerts are available
      if (!this.isAvailable(planId)) {
        return { success: false, error: 'Custom alerts not available in your plan' }
      }

      // Check alert limits
      const limits = this.getAlertLimits(planId)
      const currentAlertCount = await this.getAlertCount(organizationId)
      
      if (limits.maxAlerts !== -1 && currentAlertCount >= limits.maxAlerts) {
        return { success: false, error: `Alert limit reached. Maximum ${limits.maxAlerts} alerts allowed.` }
      }

      // Validate actions
      if (limits.maxActionsPerAlert !== -1 && alert.actions.length > limits.maxActionsPerAlert) {
        return { success: false, error: `Too many actions. Maximum ${limits.maxActionsPerAlert} actions per alert.` }
      }

      // Validate channels
      const invalidChannels = alert.actions.filter(action => 
        !limits.availableChannels.includes(action.type)
      )
      if (invalidChannels.length > 0) {
        return { success: false, error: `Invalid channels: ${invalidChannels.map(a => a.type).join(', ')}` }
      }

      const customAlert: CustomAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        organizationId,
        ...alert,
        createdAt: new Date(),
        updatedAt: new Date(),
        triggerCount: 0
      }

      // Store alert
      await this.storeAlert(customAlert)

      return { success: true, alert: customAlert }

    } catch (error) {
      console.error('Error creating alert:', error)
      return { success: false, error: 'Failed to create alert' }
    }
  }

  /**
   * Create alert from template
   */
  static async createFromTemplate(
    organizationId: string,
    templateId: string,
    customizations: Partial<CustomAlert>,
    createdBy: string,
    planId: string
  ): Promise<{ success: boolean; alert?: CustomAlert; error?: string }> {
    const template = ALERT_TEMPLATES[templateId]
    if (!template) {
      return { success: false, error: 'Invalid template ID' }
    }

    const alert = {
      ...template,
      ...customizations,
      createdBy
    }

    return this.createAlert(organizationId, alert, planId)
  }

  /**
   * Trigger alert evaluation
   */
  static async evaluateAlerts(
    organizationId: string,
    eventData: Record<string, any>,
    eventType: string
  ): Promise<void> {
    try {
      const alerts = await this.getActiveAlerts(organizationId)
      
      for (const alert of alerts) {
        // Check if alert should be evaluated for this event type
        if (this.shouldEvaluateAlert(alert, eventType)) {
          const conditionsMet = this.evaluateConditions(alert.conditions, eventData)
          
          if (conditionsMet.length > 0) {
            await this.triggerAlert(alert, eventData, conditionsMet)
          }
        }
      }

    } catch (error) {
      console.error('Error evaluating alerts:', error)
    }
  }

  /**
   * Trigger an alert
   */
  private static async triggerAlert(
    alert: CustomAlert,
    triggerData: Record<string, any>,
    conditionsMet: string[]
  ): Promise<void> {
    try {
      // Check frequency limitations
      if (!this.shouldTriggerBasedOnFrequency(alert)) {
        return
      }

      const trigger: AlertTrigger = {
        id: `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        alertId: alert.id,
        organizationId: alert.organizationId,
        triggeredAt: new Date(),
        triggerData,
        conditionsMet,
        actionsExecuted: [],
        resolved: false
      }

      // Add to processing queue
      this.alertQueue.set(trigger.id, trigger)

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processAlertQueue()
      }

      // Update alert trigger count
      alert.triggerCount++
      alert.lastTriggered = new Date()
      await this.updateAlert(alert)

    } catch (error) {
      console.error('Error triggering alert:', error)
    }
  }

  /**
   * Process alert queue
   */
  private static async processAlertQueue(): Promise<void> {
    if (this.isProcessing) return
    this.isProcessing = true

    try {
      while (this.alertQueue.size > 0) {
        const triggers = Array.from(this.alertQueue.values())
        
        // Process triggers in batches
        const batch = triggers.slice(0, 5) // Process 5 at a time
        
        await Promise.all(batch.map(trigger => this.processTrigger(trigger)))
        
        // Remove processed triggers
        batch.forEach(trigger => this.alertQueue.delete(trigger.id))
        
        // Brief pause between batches
        await this.sleep(1000)
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Process a single alert trigger
   */
  private static async processTrigger(trigger: AlertTrigger): Promise<void> {
    try {
      const alert = await this.getAlert(trigger.organizationId, trigger.alertId)
      if (!alert) return

      // Execute all actions
      for (const action of alert.actions) {
        if (!action.enabled) continue

        const result = await this.executeAction(action, trigger, alert)
        trigger.actionsExecuted.push(result)
      }

      // Store trigger record
      await this.storeTrigger(trigger)

    } catch (error) {
      console.error('Error processing trigger:', error)
    }
  }

  /**
   * Execute an alert action
   */
  private static async executeAction(
    action: AlertAction,
    trigger: AlertTrigger,
    alert: CustomAlert
  ): Promise<AlertActionResult> {
    const result: AlertActionResult = {
      actionId: action.id,
      actionType: action.type,
      status: 'pending',
      executedAt: new Date()
    }

    try {
      switch (action.type) {
        case 'email':
          await this.sendEmailAlert(action, trigger, alert)
          break
        case 'webhook':
          await this.sendWebhookAlert(action, trigger, alert)
          break
        case 'slack':
          await this.sendSlackAlert(action, trigger, alert)
          break
        case 'in_app':
          await this.createInAppNotification(action, trigger, alert)
          break
        default:
          throw new Error(`Unsupported action type: ${action.type}`)
      }

      result.status = 'success'

    } catch (error) {
      result.status = 'failed'
      result.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return result
  }

  /**
   * Send email alert
   */
  private static async sendEmailAlert(
    action: AlertAction,
    trigger: AlertTrigger,
    alert: CustomAlert
  ): Promise<void> {
    const emailConfig = action.configuration
    
    // In real implementation, integrate with email service
    console.log('Sending email alert:', {
      to: emailConfig.recipients || 'default@example.com',
      subject: emailConfig.subject || alert.name,
      alertName: alert.name,
      triggerData: trigger.triggerData
    })
  }

  /**
   * Send webhook alert
   */
  private static async sendWebhookAlert(
    action: AlertAction,
    trigger: AlertTrigger,
    alert: CustomAlert
  ): Promise<void> {
    const webhookConfig = action.configuration
    
    // In real implementation, make HTTP request to webhook URL
    console.log('Sending webhook alert:', {
      url: webhookConfig.url,
      method: webhookConfig.method || 'POST',
      payload: {
        alert: alert.name,
        trigger: trigger.triggerData,
        timestamp: trigger.triggeredAt
      }
    })
  }

  /**
   * Send Slack alert
   */
  private static async sendSlackAlert(
    action: AlertAction,
    trigger: AlertTrigger,
    alert: CustomAlert
  ): Promise<void> {
    const slackConfig = action.configuration
    
    console.log('Sending Slack alert:', {
      channel: slackConfig.channel,
      message: slackConfig.message || `Alert: ${alert.name}`,
      attachments: {
        alert: alert.name,
        priority: alert.priority,
        triggerData: trigger.triggerData
      }
    })
  }

  /**
   * Create in-app notification
   */
  private static async createInAppNotification(
    action: AlertAction,
    trigger: AlertTrigger,
    alert: CustomAlert
  ): Promise<void> {
    const notificationConfig = action.configuration
    
    console.log('Creating in-app notification:', {
      title: notificationConfig.title || alert.name,
      message: notificationConfig.message,
      priority: alert.priority,
      organizationId: alert.organizationId
    })
  }

  /**
   * Evaluate alert conditions
   */
  private static evaluateConditions(
    conditions: AlertCondition[],
    data: Record<string, any>
  ): string[] {
    const metConditions: string[] = []

    for (const condition of conditions) {
      if (this.evaluateCondition(condition, data)) {
        metConditions.push(condition.id)
      }
    }

    return metConditions
  }

  /**
   * Evaluate a single condition
   */
  private static evaluateCondition(
    condition: AlertCondition,
    data: Record<string, any>
  ): boolean {
    const fieldValue = data[condition.field]
    if (fieldValue === undefined) return false

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'not_equals':
        return fieldValue !== condition.value
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value)
      case 'less_than':
        return Number(fieldValue) < Number(condition.value)
      case 'between':
        const [min, max] = Array.isArray(condition.value) ? condition.value : [0, 0]
        return Number(fieldValue) >= Number(min) && Number(fieldValue) <= Number(max)
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase())
      case 'changes_by':
        // This would require historical data comparison
        return Math.abs(Number(fieldValue)) >= Math.abs(Number(condition.value))
      default:
        return false
    }
  }

  /**
   * Check if alert should be evaluated for event type
   */
  private static shouldEvaluateAlert(alert: CustomAlert, eventType: string): boolean {
    // Map alert types to relevant event types
    const relevantEvents: Record<string, string[]> = {
      'price_change': ['competitor_price_update', 'market_price_change'],
      'competitor_action': ['competitor_update', 'competitor_action'],
      'market_shift': ['market_data_update', 'trend_change'],
      'threshold': ['metric_update', 'data_refresh'],
      'custom': ['*'] // Custom alerts can respond to any event
    }

    const events = relevantEvents[alert.type] || []
    return events.includes('*') || events.includes(eventType)
  }

  /**
   * Check if alert should trigger based on frequency
   */
  private static shouldTriggerBasedOnFrequency(alert: CustomAlert): boolean {
    if (!alert.lastTriggered) return true

    const now = new Date()
    const lastTriggered = alert.lastTriggered
    const timeDiff = now.getTime() - lastTriggered.getTime()

    switch (alert.frequency) {
      case 'immediate':
        return true
      case 'hourly':
        return timeDiff >= 60 * 60 * 1000 // 1 hour
      case 'daily':
        return timeDiff >= 24 * 60 * 60 * 1000 // 24 hours
      case 'weekly':
        return timeDiff >= 7 * 24 * 60 * 60 * 1000 // 7 days
      default:
        return true
    }
  }

  // Mock database methods
  private static async getAlertCount(organizationId: string): Promise<number> {
    return 3 // Mock
  }

  private static async getActiveAlerts(organizationId: string): Promise<CustomAlert[]> {
    return [] // Mock
  }

  private static async getAlert(organizationId: string, alertId: string): Promise<CustomAlert | null> {
    return null // Mock
  }

  private static async storeAlert(alert: CustomAlert): Promise<void> {
    console.log('Storing alert:', alert.id)
  }

  private static async updateAlert(alert: CustomAlert): Promise<void> {
    console.log('Updating alert:', alert.id)
  }

  private static async storeTrigger(trigger: AlertTrigger): Promise<void> {
    console.log('Storing trigger:', trigger.id)
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
} 