// RevSnap Zapier Integration - Connect to 5000+ Apps
import { PlanService } from './plan-limits'

export interface ZapierTrigger {
  id: string
  name: string
  description: string
  inputFields: ZapierField[]
  sampleData: any
  isPolling: boolean
}

export interface ZapierAction {
  id: string
  name: string
  description: string
  inputFields: ZapierField[]
  outputFields: ZapierField[]
  performAction: (data: any) => Promise<any>
}

export interface ZapierField {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'datetime' | 'object' | 'array'
  required: boolean
  helpText?: string
  choices?: Array<{ value: string; label: string }>
  dynamic?: string
}

export interface ZapConnection {
  id: string
  organizationId: string
  zapId: string
  triggerType: string
  targetApp: string
  targetAction: string
  isActive: boolean
  config: any
  createdAt: Date
  lastTriggered?: Date
  triggerCount: number
}

export class ZapierIntegrationService {
  
  /**
   * RevSnap Zapier Triggers - Events that can start Zaps
   */
  static readonly TRIGGERS: ZapierTrigger[] = [
    {
      id: 'price_change_detected',
      name: 'Price Change Detected',
      description: 'Triggers when a competitor changes their price',
      isPolling: true,
      inputFields: [
        {
          key: 'product_id',
          label: 'Product',
          type: 'string',
          required: false,
          helpText: 'Leave blank to monitor all products',
          dynamic: 'product_list'
        },
        {
          key: 'price_change_threshold',
          label: 'Price Change Threshold (%)',
          type: 'number',
          required: false,
          helpText: 'Minimum price change percentage to trigger (default: 5%)'
        },
        {
          key: 'competitor_sources',
          label: 'Competitor Sources',
          type: 'array',
          required: false,
          helpText: 'Which competitors to monitor',
          choices: [
            { value: 'amazon', label: 'Amazon' },
            { value: 'walmart', label: 'Walmart' },
            { value: 'target', label: 'Target' },
            { value: 'bestbuy', label: 'Best Buy' }
          ]
        }
      ],
      sampleData: {
        product_id: 'prod_123',
        product_name: 'Wireless Headphones',
        old_price: 99.99,
        new_price: 89.99,
        price_change_percent: -10.0,
        competitor: 'amazon',
        competitor_url: 'https://amazon.com/product/xyz',
        detected_at: '2024-01-15T10:30:00Z'
      }
    },
    {
      id: 'pricing_recommendation_ready',
      name: 'Pricing Recommendation Ready',
      description: 'Triggers when AI generates new pricing recommendations',
      isPolling: true,
      inputFields: [
        {
          key: 'confidence_threshold',
          label: 'Minimum Confidence Level',
          type: 'number',
          required: false,
          helpText: 'Only trigger for recommendations with this confidence % or higher'
        }
      ],
      sampleData: {
        product_id: 'prod_123',
        product_name: 'Wireless Headphones',
        current_price: 99.99,
        recommended_price: 94.99,
        confidence: 0.89,
        reasoning: 'Based on 5 competitors, recommend 5% price reduction',
        expected_impact: {
          revenue_change: 150.00,
          margin_change: 12.5
        },
        generated_at: '2024-01-15T10:30:00Z'
      }
    },
    {
      id: 'competitor_out_of_stock',
      name: 'Competitor Out of Stock',
      description: 'Triggers when a competitor runs out of stock',
      isPolling: true,
      inputFields: [
        {
          key: 'product_id',
          label: 'Product',
          type: 'string',
          required: false,
          dynamic: 'product_list'
        }
      ],
      sampleData: {
        product_id: 'prod_123',
        product_name: 'Wireless Headphones',
        competitor: 'walmart',
        competitor_url: 'https://walmart.com/product/xyz',
        last_price: 89.99,
        detected_at: '2024-01-15T10:30:00Z',
        opportunity_score: 8.5
      }
    },
    {
      id: 'profit_milestone_reached',
      name: 'Profit Milestone Reached',
      description: 'Triggers when cumulative profit increase hits a milestone',
      isPolling: true,
      inputFields: [
        {
          key: 'milestone_amount',
          label: 'Milestone Amount ($)',
          type: 'number',
          required: true,
          helpText: 'Trigger when profit increase reaches this amount'
        }
      ],
      sampleData: {
        milestone_amount: 1000,
        current_profit_increase: 1250,
        percentage_increase: 23.5,
        timeframe_days: 30,
        top_performing_products: [
          { name: 'Wireless Headphones', profit_increase: 450 },
          { name: 'Smart Watch', profit_increase: 380 }
        ],
        reached_at: '2024-01-15T10:30:00Z'
      }
    }
  ]

  /**
   * RevSnap Zapier Actions - Things Zaps can do in RevSnap
   */
  static readonly ACTIONS: ZapierAction[] = [
    {
      id: 'add_product_tracking',
      name: 'Add Product to Tracking',
      description: 'Add a new product to competitor price monitoring',
      inputFields: [
        {
          key: 'product_name',
          label: 'Product Name',
          type: 'string',
          required: true
        },
        {
          key: 'product_url',
          label: 'Product URL',
          type: 'string',
          required: false,
          helpText: 'URL of your product page'
        },
        {
          key: 'current_price',
          label: 'Current Price',
          type: 'number',
          required: true
        },
        {
          key: 'competitor_urls',
          label: 'Competitor URLs',
          type: 'array',
          required: false,
          helpText: 'URLs of competitor products to track'
        }
      ],
      outputFields: [
        { key: 'product_id', label: 'Product ID', type: 'string', required: true },
        { key: 'tracking_status', label: 'Tracking Status', type: 'string', required: true },
        { key: 'competitors_found', label: 'Competitors Found', type: 'number', required: true }
      ],
      performAction: async (data) => {
        return await this.addProductTracking(data)
      }
    },
    {
      id: 'update_product_price',
      name: 'Update Product Price',
      description: 'Update the price of a tracked product',
      inputFields: [
        {
          key: 'product_id',
          label: 'Product',
          type: 'string',
          required: true,
          dynamic: 'product_list'
        },
        {
          key: 'new_price',
          label: 'New Price',
          type: 'number',
          required: true
        },
        {
          key: 'reason',
          label: 'Price Change Reason',
          type: 'string',
          required: false
        }
      ],
      outputFields: [
        { key: 'updated', label: 'Successfully Updated', type: 'boolean', required: true },
        { key: 'old_price', label: 'Previous Price', type: 'number', required: true },
        { key: 'new_price', label: 'New Price', type: 'number', required: true }
      ],
      performAction: async (data) => {
        return await this.updateProductPrice(data)
      }
    },
    {
      id: 'create_price_alert',
      name: 'Create Price Alert',
      description: 'Set up a custom price monitoring alert',
      inputFields: [
        {
          key: 'product_id',
          label: 'Product',
          type: 'string',
          required: true,
          dynamic: 'product_list'
        },
        {
          key: 'alert_type',
          label: 'Alert Type',
          type: 'string',
          required: true,
          choices: [
            { value: 'price_drop', label: 'Price Drop' },
            { value: 'price_increase', label: 'Price Increase' },
            { value: 'out_of_stock', label: 'Out of Stock' },
            { value: 'back_in_stock', label: 'Back in Stock' }
          ]
        },
        {
          key: 'threshold',
          label: 'Threshold (%)',
          type: 'number',
          required: false,
          helpText: 'Percentage change to trigger alert'
        }
      ],
      outputFields: [
        { key: 'alert_id', label: 'Alert ID', type: 'string', required: true },
        { key: 'status', label: 'Alert Status', type: 'string', required: true }
      ],
      performAction: async (data) => {
        return await this.createPriceAlert(data)
      }
    },
    {
      id: 'get_pricing_recommendation',
      name: 'Get Pricing Recommendation',
      description: 'Get AI-powered pricing recommendation for a product',
      inputFields: [
        {
          key: 'product_id',
          label: 'Product',
          type: 'string',
          required: true,
          dynamic: 'product_list'
        }
      ],
      outputFields: [
        { key: 'current_price', label: 'Current Price', type: 'number', required: true },
        { key: 'recommended_price', label: 'Recommended Price', type: 'number', required: true },
        { key: 'confidence', label: 'Confidence Score', type: 'number', required: true },
        { key: 'reasoning', label: 'Recommendation Reasoning', type: 'string', required: true },
        { key: 'expected_impact', label: 'Expected Impact', type: 'object', required: true }
      ],
      performAction: async (data) => {
        return await this.getPricingRecommendation(data)
      }
    }
  ]

  /**
   * Set up a new Zapier connection
   */
  static async setupZapConnection(
    organizationId: string,
    zapConfig: {
      triggerType: string
      targetApp: string
      targetAction: string
      config: any
    }
  ): Promise<{ success: boolean; connection?: ZapConnection; error?: string }> {
    try {
      // Check plan limits - using existing plan check
      const canUseZapier = await PlanService.hasFeature(organizationId, 'apiAccess')
      if (!canUseZapier) {
        return { success: false, error: 'Zapier integration not available on current plan' }
      }

      const connection: ZapConnection = {
        id: `zap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        organizationId,
        zapId: `zap_${Math.random().toString(36).substr(2, 12)}`,
        triggerType: zapConfig.triggerType,
        targetApp: zapConfig.targetApp,
        targetAction: zapConfig.targetAction,
        isActive: true,
        config: zapConfig.config,
        createdAt: new Date(),
        triggerCount: 0
      }

      // Store connection in database
      await this.storeZapConnection(connection)

      return { success: true, connection }

    } catch (error) {
      console.error('Error setting up Zap connection:', error)
      return { success: false, error: 'Failed to set up connection' }
    }
  }

  /**
   * Get dynamic dropdown data for Zapier
   */
  static async getDynamicData(
    organizationId: string,
    field: string
  ): Promise<Array<{ value: string; label: string }>> {
    switch (field) {
      case 'product_list':
        return await this.getProductList(organizationId)
      
      default:
        return []
    }
  }

  /**
   * Process trigger events and send to Zapier
   */
  static async processTriggerEvent(
    triggerType: string,
    eventData: any,
    organizationId: string
  ): Promise<void> {
    try {
      // Get all active connections for this trigger type
      const connections = await this.getActiveConnections(organizationId, triggerType)

      for (const connection of connections) {
        // Check if event matches connection config
        if (this.matchesTriggerConfig(eventData, connection.config)) {
          await this.sendToZapier(connection, eventData)
          
          // Update trigger count
          connection.triggerCount++
          connection.lastTriggered = new Date()
          await this.updateZapConnection(connection)
        }
      }

    } catch (error) {
      console.error('Error processing trigger event:', error)
    }
  }

  /**
   * Popular Zapier workflow templates
   */
  static readonly WORKFLOW_TEMPLATES = [
    {
      id: 'slack_price_alerts',
      name: 'Slack Price Alerts',
      description: 'Send price change notifications to Slack',
      trigger: 'price_change_detected',
      action: 'slack_send_message',
      config: {
        channel: '#pricing-alerts',
        message: 'Price Alert: {{product_name}} changed from ${{old_price}} to ${{new_price}} ({{price_change_percent}}%)'
      }
    },
    {
      id: 'google_sheets_tracking',
      name: 'Google Sheets Price Tracking',
      description: 'Log all price changes to a Google Sheet',
      trigger: 'price_change_detected',
      action: 'google_sheets_add_row',
      config: {
        spreadsheet: 'RevSnap Price Tracking',
        worksheet: 'Price Changes',
        values: ['{{product_name}}', '{{old_price}}', '{{new_price}}', '{{competitor}}', '{{detected_at}}']
      }
    },
    {
      id: 'email_recommendations',
      name: 'Email Pricing Recommendations',
      description: 'Email weekly pricing recommendations',
      trigger: 'pricing_recommendation_ready',
      action: 'email_send',
      config: {
        subject: 'Weekly Pricing Recommendations',
        body: 'New recommendations for {{product_name}}: Change price to ${{recommended_price}} ({{confidence}}% confidence)'
      }
    },
    {
      id: 'shopify_price_sync',
      name: 'Shopify Price Sync',
      description: 'Automatically update Shopify prices based on recommendations',
      trigger: 'pricing_recommendation_ready',
      action: 'shopify_update_product',
      config: {
        confidence_threshold: 0.8,
        max_change_percent: 10
      }
    },
    {
      id: 'discord_profit_milestone',
      name: 'Discord Profit Celebrations',
      description: 'Celebrate profit milestones in Discord',
      trigger: 'profit_milestone_reached',
      action: 'discord_send_message',
      config: {
        channel: '#wins',
        message: '🎉 Profit milestone reached! ${{milestone_amount}} in additional profit from RevSnap optimizations!'
      }
    }
  ]

  // Private helper methods

  private static async addProductTracking(data: any): Promise<any> {
    // Mock implementation - in real version, use actual API
    const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      product_id: productId,
      tracking_status: 'active',
      competitors_found: Math.floor(Math.random() * 5) + 1
    }
  }

  private static async updateProductPrice(data: any): Promise<any> {
    // Mock implementation
    return {
      updated: true,
      old_price: 99.99,
      new_price: data.new_price
    }
  }

  private static async createPriceAlert(data: any): Promise<any> {
    // Mock implementation
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      alert_id: alertId,
      status: 'active'
    }
  }

  private static async getPricingRecommendation(data: any): Promise<any> {
    // Mock implementation
    const currentPrice = 99.99
    const recommendedPrice = currentPrice * (0.9 + Math.random() * 0.2)
    
    return {
      current_price: currentPrice,
      recommended_price: Math.round(recommendedPrice * 100) / 100,
      confidence: 0.75 + Math.random() * 0.2,
      reasoning: 'Based on competitor analysis and market trends',
      expected_impact: {
        revenue_change: (recommendedPrice - currentPrice) * 10,
        margin_change: ((recommendedPrice - currentPrice) / currentPrice) * 100
      }
    }
  }

  private static async getProductList(organizationId: string): Promise<Array<{ value: string; label: string }>> {
    // Mock implementation - in real version, query database
    return [
      { value: 'prod_1', label: 'Wireless Headphones' },
      { value: 'prod_2', label: 'Smart Watch' },
      { value: 'prod_3', label: 'Bluetooth Speaker' }
    ]
  }

  private static async storeZapConnection(connection: ZapConnection): Promise<void> {
    console.log('Storing Zap connection:', connection.id)
  }

  private static async updateZapConnection(connection: ZapConnection): Promise<void> {
    console.log('Updating Zap connection:', connection.id)
  }

  private static async getActiveConnections(
    organizationId: string, 
    triggerType: string
  ): Promise<ZapConnection[]> {
    // Mock implementation
    return []
  }

  private static matchesTriggerConfig(eventData: any, config: any): boolean {
    // Check if event data matches the trigger configuration
    return true // Simplified for now
  }

  private static async sendToZapier(connection: ZapConnection, eventData: any): Promise<void> {
    try {
      const webhookUrl = `https://hooks.zapier.com/hooks/catch/${connection.zapId}/`
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })

      if (!response.ok) {
        throw new Error(`Zapier webhook failed: ${response.statusText}`)
      }

      console.log('Event sent to Zapier successfully:', connection.id)
    } catch (error) {
      console.error('Failed to send event to Zapier:', error)
    }
  }
}

// Export webhook endpoint handler for Zapier polling
export async function handleZapierPolling(
  triggerType: string,
  organizationId: string,
  config: any
): Promise<any[]> {
  // Mock implementation - in real version, query database for recent events
  const sampleEvents = []
  
  const trigger = ZapierIntegrationService.TRIGGERS.find(t => t.id === triggerType)
  if (trigger) {
    // Return sample data for Zapier testing
    sampleEvents.push(trigger.sampleData)
  }

  return sampleEvents
} 