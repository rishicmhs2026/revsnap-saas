import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { RealCompetitorTracker } from '@/lib/real-competitor-scraper'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const action = searchParams.get('action')

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const tracker = RealCompetitorTracker.getInstance()

    switch (action) {
      case 'stats':
        const stats = await tracker.getTrackingStats(organizationId)
        return NextResponse.json({ success: true, stats })

      case 'jobs':
        const jobs = tracker.getActiveJobs(organizationId)
        return NextResponse.json({ success: true, jobs })

      case 'sources':
        // Get plan to determine available sources
        const subscription = await prisma.subscription.findFirst({
          where: { organizationId, status: 'active' },
          orderBy: { createdAt: 'desc' }
        })

        const planId = subscription?.stripePriceId?.includes('starter') ? 'starter' :
                       subscription?.stripePriceId?.includes('professional') ? 'professional' :
                       subscription?.stripePriceId?.includes('enterprise') ? 'enterprise' : 'starter'

        const { PlanService } = await import('@/lib/plan-limits')
        const availableSources = PlanService.getCompetitorSources(planId)

        return NextResponse.json({ 
          success: true, 
          sources: availableSources,
          planId 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Real tracking GET error:', error)
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
    const { action, organizationId, productId, urls } = body

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Get user's plan
    const subscription = await prisma.subscription.findFirst({
      where: { organizationId, status: 'active' },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 403 })
    }

    const planId = subscription.stripePriceId?.includes('starter') ? 'starter' :
                   subscription.stripePriceId?.includes('professional') ? 'professional' :
                   subscription.stripePriceId?.includes('enterprise') ? 'enterprise' : 'starter'

    const tracker = RealCompetitorTracker.getInstance()

    switch (action) {
      case 'start_tracking':
        if (!productId || !urls || !Array.isArray(urls)) {
          return NextResponse.json({ error: 'Product ID and URLs required' }, { status: 400 })
        }

        const result = await tracker.startTracking(productId, organizationId, urls, planId)
        return NextResponse.json(result)

      case 'stop_tracking':
        if (!productId) {
          return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        }

        await tracker.stopTracking(productId)
        return NextResponse.json({ success: true, message: 'Tracking stopped' })

      case 'update_plan':
        await tracker.updateJobsForPlan(organizationId, planId)
        return NextResponse.json({ success: true, message: 'Jobs updated for new plan' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Real tracking POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 