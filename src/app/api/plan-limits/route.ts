import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PlanService } from '@/lib/plan-limits'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const action = searchParams.get('action') as 'add_product' | 'update_frequency' | 'api_access' | 'custom_alerts'

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Get user's subscription to determine plan
    const subscription = await prisma.subscription.findFirst({
      where: { 
        organizationId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Determine plan from Stripe price ID
    const planId = subscription.stripePriceId?.includes('starter') ? 'starter' :
                   subscription.stripePriceId?.includes('professional') ? 'professional' :
                   subscription.stripePriceId?.includes('enterprise') ? 'enterprise' : 'starter'

    // Get current product count if checking add_product action
    let currentCount: number | undefined
    if (action === 'add_product') {
      currentCount = await prisma.product.count({
        where: { organizationId }
      })
    }

    // Validate action
    const validation = PlanService.validateAction(planId, action, currentCount)

    // Get plan limits for display
    const planLimits = PlanService.getPlanLimits(planId)

    return NextResponse.json({
      planId,
      planName: planLimits?.name,
      validation,
      limits: planLimits ? {
        maxProducts: planLimits.maxProducts,
        updateIntervalMinutes: planLimits.updateIntervalMinutes,
        competitorSources: planLimits.competitorSources,
        features: planLimits.features
      } : null
    })

  } catch (error) {
    console.error('Plan limits API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { organizationId, productCount, needsApiAccess, needsCustomAlerts } = body

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Get user's subscription to determine plan
    const subscription = await prisma.subscription.findFirst({
      where: { 
        organizationId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Determine plan from Stripe price ID
    const planId = subscription.stripePriceId?.includes('starter') ? 'starter' :
                   subscription.stripePriceId?.includes('professional') ? 'professional' :
                   subscription.stripePriceId?.includes('enterprise') ? 'enterprise' : 'starter'

    // Get upgrade recommendations
    const recommendations = PlanService.getUpgradeRecommendations(
      planId,
      productCount || 0,
      needsApiAccess,
      needsCustomAlerts
    )

    return NextResponse.json({
      currentPlan: planId,
      recommendations
    })

  } catch (error) {
    console.error('Plan recommendations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 