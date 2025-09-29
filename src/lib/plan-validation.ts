// Comprehensive plan validation and feature gating system

import { PlanService, PLAN_LIMITS, PlanLimits } from './plan-limits'

export interface FeatureGate {
  feature: string
  requiredPlan: string
  allowed: boolean
  reason?: string
  upgradePrompt?: string
}

export interface PlanValidationResult {
  planId: string
  planName: string
  limits: PlanLimits | null
  features: FeatureGate[]
  canPerformAction: (action: string, currentCount?: number) => boolean
  getUpgradePrompt: (feature: string) => string | null
}

export class PlanValidationService {
  /**
   * Get comprehensive plan validation for an organization
   */
  static async getPlanValidation(organizationId: string): Promise<PlanValidationResult | null> {
    try {
      // Get user's subscription
      const subscriptionResponse = await fetch(`/api/subscriptions?organizationId=${organizationId}`)
      if (!subscriptionResponse.ok) {
        return null
      }

      const subscriptionData = await subscriptionResponse.json()
      const activeSubscription = subscriptionData.data?.find((sub: any) => sub.status === 'active')

      if (!activeSubscription) {
        return this.getFreePlanValidation()
      }

      // Determine plan from Stripe price ID
      const planId = activeSubscription.stripePriceId?.includes('starter') ? 'starter' :
                     activeSubscription.stripePriceId?.includes('professional') ? 'professional' :
                     activeSubscription.stripePriceId?.includes('enterprise') ? 'enterprise' : 'free'

      return this.createValidationResult(planId)
    } catch (error) {
      console.error('Error getting plan validation:', error)
      return this.getFreePlanValidation()
    }
  }

  /**
   * Create validation result for a specific plan
   */
  private static createValidationResult(planId: string): PlanValidationResult {
    const limits = PlanService.getPlanLimits(planId)
    const features = this.getAllFeatureGates(planId)

    return {
      planId,
      planName: limits?.name || 'Unknown',
      limits,
      features,
      canPerformAction: (action: string, currentCount?: number) => {
        return this.canPerformAction(planId, action, currentCount)
      },
      getUpgradePrompt: (feature: string) => {
        return this.getUpgradePrompt(planId, feature)
      }
    }
  }

  /**
   * Get free plan validation (fallback)
   */
  private static getFreePlanValidation(): PlanValidationResult {
    return this.createValidationResult('free')
  }

  /**
   * Check if user can perform a specific action
   */
  private static canPerformAction(planId: string, action: string, currentCount?: number): boolean {
    switch (action) {
      case 'add_product':
        if (currentCount !== undefined) {
          const validation = PlanService.validateAction(planId, 'add_product', currentCount)
          return validation.allowed
        }
        return true

      case 'api_access':
        return PlanService.hasFeature(planId, 'apiAccess')

      case 'custom_alerts':
        return PlanService.hasFeature(planId, 'customAlerts')

      case 'data_export':
        return PlanService.hasFeature(planId, 'dataExport')

      case 'team_collaboration':
        return PlanService.hasFeature(planId, 'teamCollaboration')

      case 'white_label':
        return PlanService.hasFeature(planId, 'whiteLabel')

      case 'custom_integrations':
        return PlanService.hasFeature(planId, 'customIntegrations')

      case 'custom_ai_models':
        return PlanService.hasFeature(planId, 'customAIModels')

      case 'enterprise_analytics':
        return planId === 'enterprise'

      case 'advanced_tracking':
        return planId !== 'free'

      case 'premium_support':
        return planId !== 'free'

      default:
        return false
    }
  }

  /**
   * Get upgrade prompt for a specific feature
   */
  private static getUpgradePrompt(planId: string, feature: string): string | null {
    const featureRequirements = {
      'api_access': { minPlan: 'professional', planName: 'Professional' },
      'custom_alerts': { minPlan: 'professional', planName: 'Professional' },
      'team_collaboration': { minPlan: 'professional', planName: 'Professional' },
      'white_label': { minPlan: 'enterprise', planName: 'Enterprise' },
      'custom_integrations': { minPlan: 'enterprise', planName: 'Enterprise' },
      'custom_ai_models': { minPlan: 'enterprise', planName: 'Enterprise' },
      'enterprise_analytics': { minPlan: 'enterprise', planName: 'Enterprise' },
      'advanced_tracking': { minPlan: 'starter', planName: 'Starter' },
      'premium_support': { minPlan: 'starter', planName: 'Starter' }
    }

    const requirement = featureRequirements[feature as keyof typeof featureRequirements]
    if (!requirement) return null

    const planOrder = ['free', 'starter', 'professional', 'enterprise']
    const currentIndex = planOrder.indexOf(planId)
    const requiredIndex = planOrder.indexOf(requirement.minPlan)

    if (currentIndex >= requiredIndex) return null

    return `This feature requires a ${requirement.planName} plan or higher. Upgrade to unlock this functionality.`
  }

  /**
   * Get all feature gates for a plan
   */
  private static getAllFeatureGates(planId: string): FeatureGate[] {
    const features = [
      { feature: 'add_product', requiredPlan: 'free' },
      { feature: 'basic_tracking', requiredPlan: 'free' },
      { feature: 'advanced_tracking', requiredPlan: 'starter' },
      { feature: 'api_access', requiredPlan: 'professional' },
      { feature: 'custom_alerts', requiredPlan: 'professional' },
      { feature: 'team_collaboration', requiredPlan: 'professional' },
      { feature: 'data_export', requiredPlan: 'starter' },
      { feature: 'white_label', requiredPlan: 'enterprise' },
      { feature: 'custom_integrations', requiredPlan: 'enterprise' },
      { feature: 'custom_ai_models', requiredPlan: 'enterprise' },
      { feature: 'enterprise_analytics', requiredPlan: 'enterprise' },
      { feature: 'dedicated_support', requiredPlan: 'enterprise' },
      { feature: 'sla_guarantee', requiredPlan: 'enterprise' }
    ]

    return features.map(f => ({
      feature: f.feature,
      requiredPlan: f.requiredPlan,
      allowed: this.canPerformAction(planId, f.feature),
      reason: !this.canPerformAction(planId, f.feature) ? 
        `Requires ${f.requiredPlan} plan or higher` : undefined,
      upgradePrompt: this.getUpgradePrompt(planId, f.feature) || undefined
    }))
  }

  /**
   * Get feature-specific limits for display
   */
  static getFeatureLimits(planId: string): {
    maxProducts: number | string
    updateInterval: string
    competitorSources: string[]
    supportLevel: string
    features: string[]
  } {
    const limits = PlanService.getPlanLimits(planId)
    if (!limits) {
      return {
        maxProducts: 0,
        updateInterval: 'N/A',
        competitorSources: [],
        supportLevel: 'None',
        features: []
      }
    }

    return {
      maxProducts: limits.maxProducts === -1 ? 'Unlimited' : limits.maxProducts,
      updateInterval: limits.updateIntervalMinutes === 1440 ? 'Daily' :
                     limits.updateIntervalMinutes === 60 ? 'Hourly' :
                     limits.updateIntervalMinutes === 15 ? 'Every 15 minutes' :
                     limits.updateIntervalMinutes === 5 ? 'Every 5 minutes' : 'N/A',
      competitorSources: limits.competitorSources,
      supportLevel: limits.supportLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      features: limits.features
    }
  }

  /**
   * Check if plan has enterprise features
   */
  static isEnterprisePlan(planId: string): boolean {
    return planId === 'enterprise'
  }

  /**
   * Check if plan has professional features
   */
  static isProfessionalOrHigher(planId: string): boolean {
    return ['professional', 'enterprise'].includes(planId)
  }

  /**
   * Check if plan has starter features
   */
  static isStarterOrHigher(planId: string): boolean {
    return ['starter', 'professional', 'enterprise'].includes(planId)
  }
}

// Note: React hooks would be in a separate file for client-side components
