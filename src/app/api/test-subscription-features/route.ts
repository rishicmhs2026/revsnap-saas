import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PlanService } from '@/lib/plan-limits'
import { prisma } from '@/lib/prisma'

// Test endpoint to verify subscription features are properly gated
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findFirst({
      where: { 
        organizationId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: {
          planId: 'free',
          planName: 'Free',
          features: {
            add_product: { allowed: true, limit: 2 },
            advanced_tracking: { allowed: false, reason: 'Requires paid plan' },
            api_access: { allowed: false, reason: 'Requires Professional plan' },
            custom_alerts: { allowed: false, reason: 'Requires Professional plan' },
            team_collaboration: { allowed: false, reason: 'Requires Professional plan' },
            enterprise_analytics: { allowed: false, reason: 'Requires Enterprise plan' },
            white_label: { allowed: false, reason: 'Requires Enterprise plan' },
            custom_integrations: { allowed: false, reason: 'Requires Enterprise plan' },
            custom_ai_models: { allowed: false, reason: 'Requires Enterprise plan' }
          }
        }
      })
    }

    // Determine plan from Stripe price ID
    const planId = subscription.stripePriceId?.includes('starter') ? 'starter' :
                   subscription.stripePriceId?.includes('professional') ? 'professional' :
                   subscription.stripePriceId?.includes('enterprise') ? 'enterprise' : 'free'

    const plan = PlanService.getPlanLimits(planId)
    
    // Test all features
    const features = {
      add_product: {
        allowed: true,
        limit: plan?.maxProducts === -1 ? 'unlimited' : plan?.maxProducts || 0
      },
      advanced_tracking: {
        allowed: PlanService.validateAction(planId, 'advanced_tracking').allowed,
        reason: PlanService.validateAction(planId, 'advanced_tracking').reason
      },
      api_access: {
        allowed: PlanService.validateAction(planId, 'api_access').allowed,
        reason: PlanService.validateAction(planId, 'api_access').reason
      },
      custom_alerts: {
        allowed: PlanService.validateAction(planId, 'custom_alerts').allowed,
        reason: PlanService.validateAction(planId, 'custom_alerts').reason
      },
      team_collaboration: {
        allowed: PlanService.validateAction(planId, 'team_collaboration').allowed,
        reason: PlanService.validateAction(planId, 'team_collaboration').reason
      },
      enterprise_analytics: {
        allowed: PlanService.validateAction(planId, 'enterprise_analytics').allowed,
        reason: PlanService.validateAction(planId, 'enterprise_analytics').reason
      },
      white_label: {
        allowed: PlanService.validateAction(planId, 'white_label').allowed,
        reason: PlanService.validateAction(planId, 'white_label').reason
      },
      custom_integrations: {
        allowed: PlanService.validateAction(planId, 'custom_integrations').allowed,
        reason: PlanService.validateAction(planId, 'custom_integrations').reason
      },
      custom_ai_models: {
        allowed: PlanService.validateAction(planId, 'custom_ai_models').allowed,
        reason: PlanService.validateAction(planId, 'custom_ai_models').reason
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        planId,
        planName: plan?.name || 'Unknown',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          stripePriceId: subscription.stripePriceId,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd
        },
        planLimits: plan ? {
          maxProducts: plan.maxProducts,
          updateIntervalMinutes: plan.updateIntervalMinutes,
          competitorSources: plan.competitorSources,
          features: plan.features,
          supportLevel: plan.supportLevel,
          apiAccess: plan.apiAccess,
          customAlerts: plan.customAlerts,
          dataExport: plan.dataExport,
          mobileDashboard: plan.mobileDashboard,
          teamCollaboration: plan.teamCollaboration,
          whiteLabel: plan.whiteLabel,
          slaGuarantee: plan.slaGuarantee,
          customIntegrations: plan.customIntegrations,
          customAIModels: plan.customAIModels
        } : null,
        features
      }
    })

  } catch (error) {
    console.error('Subscription features test error:', error)
    return NextResponse.json(
      { error: 'Failed to test subscription features' },
      { status: 500 }
    )
  }
}
