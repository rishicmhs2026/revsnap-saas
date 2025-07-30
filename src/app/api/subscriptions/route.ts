import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StripeService, STRIPE_CONFIG } from '@/lib/stripe'

// Get user's subscriptions
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
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Get subscriptions for the organization
    const subscriptions = await prisma.subscription.findMany({
      where: {
        organizationId,
        userId: session.user.id
      },
      include: {
        organization: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: subscriptions
    })

  } catch (error) {
    console.error('Subscriptions GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

// Create a new subscription checkout session
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
    const { organizationId, planId, successUrl, cancelUrl } = body

    if (!organizationId || !planId) {
      return NextResponse.json(
        { error: 'Organization ID and plan ID are required' },
        { status: 400 }
      )
    }

    // Get organization
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

    // Get plan details
    const plan = STRIPE_CONFIG.plans[planId as keyof typeof STRIPE_CONFIG.plans]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let stripeCustomerId = organization.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await StripeService.createCustomer(
        session.user.email!,
        session.user.name || undefined
      )
      
      stripeCustomerId = customer.id

      // Update organization with Stripe customer ID
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId }
      })
    }

    // Create checkout session
    const checkoutSession = await StripeService.createCheckoutSession({
      customerId: stripeCustomerId,
      priceId: plan.priceId,
      successUrl: successUrl || `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancelUrl: cancelUrl || `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        organizationId,
        planId,
        userId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url
      }
    })

  } catch (error) {
    console.error('Subscription POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
} 