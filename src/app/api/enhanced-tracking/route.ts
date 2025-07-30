import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EnhancedTrackingService } from '@/lib/enhanced-tracking'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

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

    // Get tracking configuration for the plan
    const trackingConfig = EnhancedTrackingService.getTrackingConfig(planId)

    // Get active tracking jobs
    const activeJobs = await EnhancedTrackingService.getActiveTrackingJobs(organizationId)

    // Get tracking statistics
    const trackingStats = await EnhancedTrackingService.getTrackingStats(organizationId)

    return NextResponse.json({
      planId,
      trackingConfig,
      activeJobs,
      trackingStats
    })

  } catch (error) {
    console.error('Enhanced tracking API error:', error)
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
    const { organizationId, productId, competitors, action } = body

    if (!organizationId || !productId) {
      return NextResponse.json({ error: 'Organization ID and Product ID required' }, { status: 400 })
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

    switch (action) {
      case 'create_job':
        if (!competitors || !Array.isArray(competitors)) {
          return NextResponse.json({ error: 'Competitors array required' }, { status: 400 })
        }

        // Validate tracking job creation
        const validation = await EnhancedTrackingService.validateTrackingJobCreation(organizationId, planId)
        if (!validation.allowed) {
          return NextResponse.json({ 
            error: validation.reason,
            currentCount: validation.currentCount,
            limit: validation.limit
          }, { status: 403 })
        }

        const trackingJob = await EnhancedTrackingService.createTrackingJob(
          productId,
          competitors,
          planId,
          session.user.email
        )

        return NextResponse.json({
          success: true,
          trackingJob,
          message: 'Tracking job created successfully'
        })

      case 'update_job':
        const { jobId } = body
        if (!jobId) {
          return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
        }

        const updatedJob = await EnhancedTrackingService.updateTrackingJob(
          jobId,
          planId,
          competitors
        )

        return NextResponse.json({
          success: true,
          trackingJob: updatedJob,
          message: 'Tracking job updated successfully'
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Enhanced tracking API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 