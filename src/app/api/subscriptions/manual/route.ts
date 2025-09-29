import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { STRIPE_CONFIG } from '@/lib/stripe'

// Manually create a subscription (for admin use or coupon purchases)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId, organizationId, stripeSubscriptionId, stripeCustomerId, notes } = body

    if (!planId || !organizationId) {
      return NextResponse.json(
        { error: 'Plan ID and Organization ID are required' },
        { status: 400 }
      )
    }

    // Validate plan exists
    const plan = STRIPE_CONFIG.plans[planId as keyof typeof STRIPE_CONFIG.plans]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Get organization and verify ownership
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        userId: session.user.id
      }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active subscription for this organization
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        status: 'active'
      }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'User already has an active subscription for this organization' },
        { status: 400 }
      )
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        organizationId,
        userId: session.user.id,
        stripeCustomerId: stripeCustomerId || organization.stripeCustomerId || `manual_customer_${organizationId}`,
        stripeSubscriptionId: stripeSubscriptionId || `manual_sub_${Date.now()}_${organizationId}`,
        stripePriceId: plan.priceId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false
      }
    })

    // Log admin activity if this is a manual creation
    if (notes || !stripeSubscriptionId) {
      await prisma.adminActivity.create({
        data: {
          type: 'subscription_change',
          description: `Manual subscription created: ${plan.name} plan for organization ${organization.name}`,
          metadata: JSON.stringify({
            planId,
            organizationId,
            subscriptionId: subscription.id,
            notes: notes || 'Manual subscription creation'
          }),
          severity: 'info',
          userId: session.user.id,
          organizationId: organizationId
        }
      })
    }

    console.log(`Manual subscription created: ${subscription.id} for plan: ${planId}`)

    return NextResponse.json({
      success: true,
      data: {
        subscription,
        message: `Successfully created ${plan.name} subscription`
      }
    })

  } catch (error) {
    console.error('Manual subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create manual subscription' },
      { status: 500 }
    )
  }
}
