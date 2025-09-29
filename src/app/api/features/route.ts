import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PlanService } from '@/lib/plan-limits'
import { RealCompetitorTracker } from '@/lib/real-competitor-scraper'
import { TeamCollaborationService } from '@/lib/team-collaboration'
import { CustomAIModelService } from '@/lib/custom-ai-models'
import { WhiteLabelService } from '@/lib/white-label'
import { AlertDeliveryService } from '@/lib/alert-delivery'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId') || 'starter'
    const detailed = searchParams.get('detailed') === 'true'

    // Get plan limits
    const limits = PlanService.getPlanLimits(planId)

    if (detailed) {
            // Get detailed feature availability and limits
      const detailedFeatures = {
        plan: planId,
        limits,
        capabilities: {
          competitorTracking: {
            available: (limits?.competitorSources?.length || 0) > 0,
            sources: PlanService.getCompetitorSources(planId),
            updateInterval: limits?.updateIntervalMinutes || 0,
            stats: planId !== 'starter' ? await RealCompetitorTracker.getInstance().getTrackingStats('demo-org') : null
          },
          teamCollaboration: {
            available: TeamCollaborationService.isAvailable(planId),
            limits: TeamCollaborationService.getTeamLimits(planId)
          },
          customAIModels: {
            available: CustomAIModelService.isAvailable(planId),
            limits: CustomAIModelService.getModelLimits(planId),
            templates: planId === 'enterprise' ? Object.keys(await import('@/lib/custom-ai-models').then(m => m.AI_MODEL_TEMPLATES)) : []
          },
          whiteLabel: {
            available: WhiteLabelService.isAvailable(planId),
            capabilities: WhiteLabelService.getCapabilities(planId),
            themes: planId === 'enterprise' ? Object.keys(await import('@/lib/white-label').then(m => m.WHITE_LABEL_THEMES)) : []
          },
          customAlerts: {
            available: AlertDeliveryService.isAvailable(planId),
            limits: AlertDeliveryService.getAlertLimits(planId),
            templates: planId !== 'starter' ? Object.keys(await import('@/lib/alert-delivery').then(m => m.ALERT_TEMPLATES)) : []
          }
        }
      }

      return NextResponse.json({ success: true, data: detailedFeatures })
    }

    // Simple feature list
    return NextResponse.json({ 
      success: true, 
      data: { 
        plan: planId, 
        features: limits?.features || [],
        limits: {
          products: limits?.maxProducts,
          apiAccess: limits?.apiAccess,
          competitorSources: limits?.competitorSources?.length || 0,
          updateInterval: limits?.updateIntervalMinutes
        }
      } 
    })

  } catch (error) {
    console.error('Features API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 