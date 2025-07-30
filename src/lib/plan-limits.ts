// Plan limits and feature management for RevSnap premium pricing tiers

export interface PlanLimits {
  name: string
  price: number
  maxProducts: number
  updateIntervalMinutes: number
  competitorSources: string[]
  features: string[]
  supportLevel: 'email' | 'priority_email' | 'phone' | 'dedicated'
  apiAccess: boolean
  customAlerts: boolean
  dataExport: boolean
  mobileDashboard: boolean
  teamCollaboration: boolean
  whiteLabel: boolean
  slaGuarantee: boolean
  customIntegrations: boolean
  customAIModels: boolean
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    name: 'Starter',
    price: 49,
    maxProducts: 25,
    updateIntervalMinutes: 60, // 1 hour updates
    competitorSources: ['Amazon', 'Best Buy', 'Walmart', 'Target'],
    features: [
      'Real-time competitor tracking',
      'AI-powered market insights',
      'Price change alerts',
      'Advanced analytics dashboard',
      'Priority email support',
      'Data export capabilities',
      'Mobile-responsive dashboard'
    ],
    supportLevel: 'priority_email',
    apiAccess: false,
    customAlerts: false,
    dataExport: true,
    mobileDashboard: true,
    teamCollaboration: false,
    whiteLabel: false,
    slaGuarantee: false,
    customIntegrations: false,
    customAIModels: false
  },
  professional: {
    name: 'Professional',
    price: 149,
    maxProducts: 200,
    updateIntervalMinutes: 15, // 15-minute updates
    competitorSources: [
      'Amazon', 'Best Buy', 'Walmart', 'Target', 
      'Newegg', 'B&H Photo', 'Micro Center', 'Fry\'s Electronics'
    ],
    features: [
      'Premium competitor tracking (8+ sources)',
      'Real-time price updates (15 min intervals)',
      'Advanced AI market intelligence',
      'Custom alert thresholds',
      'API access with higher limits',
      'Priority phone support',
      'Advanced reporting & insights',
      'Team collaboration features'
    ],
    supportLevel: 'phone',
    apiAccess: true,
    customAlerts: true,
    dataExport: true,
    mobileDashboard: true,
    teamCollaboration: true,
    whiteLabel: false,
    slaGuarantee: false,
    customIntegrations: false,
    customAIModels: false
  },
  enterprise: {
    name: 'Enterprise',
    price: 399,
    maxProducts: -1, // Unlimited
    updateIntervalMinutes: 5, // 5-minute updates
    competitorSources: [
      'Amazon', 'Best Buy', 'Walmart', 'Target', 
      'Newegg', 'B&H Photo', 'Micro Center', 'Fry\'s Electronics',
      'Custom Sources', 'API Integrations'
    ],
    features: [
      'Unlimited products',
      'Enterprise-grade competitor tracking',
      'Real-time updates (5 min intervals)',
      'Custom AI models for your industry',
      'Dedicated account manager',
      'Custom integrations & white-label',
      'Advanced team management',
      'Custom reporting & analytics',
      'SLA guarantees'
    ],
    supportLevel: 'dedicated',
    apiAccess: true,
    customAlerts: true,
    dataExport: true,
    mobileDashboard: true,
    teamCollaboration: true,
    whiteLabel: true,
    slaGuarantee: true,
    customIntegrations: true,
    customAIModels: true
  }
}

export class PlanService {
  /**
   * Check if a user can add more products based on their plan
   */
  static canAddProduct(currentProductCount: number, planId: string): boolean {
    const plan = PLAN_LIMITS[planId]
    if (!plan) return false
    
    return plan.maxProducts === -1 || currentProductCount < plan.maxProducts
  }

  /**
   * Get the update interval for a plan
   */
  static getUpdateInterval(planId: string): number {
    const plan = PLAN_LIMITS[planId]
    return plan?.updateIntervalMinutes || 60
  }

  /**
   * Get available competitor sources for a plan
   */
  static getCompetitorSources(planId: string): string[] {
    const plan = PLAN_LIMITS[planId]
    return plan?.competitorSources || []
  }

  /**
   * Check if a feature is available for a plan
   */
  static hasFeature(planId: string, feature: keyof PlanLimits): boolean {
    const plan = PLAN_LIMITS[planId]
    if (!plan) return false
    
    return plan[feature] === true
  }

  /**
   * Get plan limits for display
   */
  static getPlanLimits(planId: string): PlanLimits | null {
    return PLAN_LIMITS[planId] || null
  }

  /**
   * Get all available plans
   */
  static getAllPlans(): PlanLimits[] {
    return Object.values(PLAN_LIMITS)
  }

  /**
   * Validate if an organization can perform an action based on their plan
   */
  static validateAction(
    planId: string, 
    action: 'add_product' | 'update_frequency' | 'api_access' | 'custom_alerts',
    currentCount?: number
  ): { allowed: boolean; reason?: string } {
    const plan = PLAN_LIMITS[planId]
    if (!plan) {
      return { allowed: false, reason: 'Invalid plan' }
    }

    switch (action) {
      case 'add_product':
        if (plan.maxProducts === -1) {
          return { allowed: true }
        }
        if (currentCount && currentCount >= plan.maxProducts) {
          return { 
            allowed: false, 
            reason: `Plan limit reached. Maximum ${plan.maxProducts} products allowed.` 
          }
        }
        return { allowed: true }

      case 'update_frequency':
        return { allowed: true } // All plans support updates

      case 'api_access':
        return { 
          allowed: plan.apiAccess, 
          reason: plan.apiAccess ? undefined : 'API access not available in this plan' 
        }

      case 'custom_alerts':
        return { 
          allowed: plan.customAlerts, 
          reason: plan.customAlerts ? undefined : 'Custom alerts not available in this plan' 
        }

      default:
        return { allowed: false, reason: 'Unknown action' }
    }
  }

  /**
   * Get upgrade recommendations based on current usage
   */
  static getUpgradeRecommendations(
    planId: string,
    productCount: number,
    needsApiAccess?: boolean,
    needsCustomAlerts?: boolean
  ): { recommended: boolean; reason: string; suggestedPlan: string } {
    const currentPlan = PLAN_LIMITS[planId]
    if (!currentPlan) {
      return { recommended: false, reason: 'Invalid plan', suggestedPlan: 'professional' }
    }

    // Check if approaching product limit
    if (currentPlan.maxProducts !== -1 && productCount >= currentPlan.maxProducts * 0.8) {
      const nextPlan = this.getNextPlan(planId)
      return {
        recommended: true,
        reason: `Approaching product limit (${productCount}/${currentPlan.maxProducts})`,
        suggestedPlan: nextPlan
      }
    }

    // Check for feature needs
    if (needsApiAccess && !currentPlan.apiAccess) {
      return {
        recommended: true,
        reason: 'API access required for automation',
        suggestedPlan: 'professional'
      }
    }

    if (needsCustomAlerts && !currentPlan.customAlerts) {
      return {
        recommended: true,
        reason: 'Custom alert thresholds required',
        suggestedPlan: 'professional'
      }
    }

    return { recommended: false, reason: 'Current plan meets needs', suggestedPlan: planId }
  }

  /**
   * Get the next plan in the hierarchy
   */
  private static getNextPlan(currentPlanId: string): string {
    const planOrder = ['starter', 'professional', 'enterprise']
    const currentIndex = planOrder.indexOf(currentPlanId)
    return planOrder[Math.min(currentIndex + 1, planOrder.length - 1)]
  }
}

// Export plan constants for easy access
export const PLAN_IDS = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise'
} as const

export type PlanId = typeof PLAN_IDS[keyof typeof PLAN_IDS] 