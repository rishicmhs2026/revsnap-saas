import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, organizationId } = await request.json()

    if (!priceId || !organizationId) {
      return NextResponse.json({ 
        error: 'Price ID and Organization ID are required' 
      }, { status: 400 })
    }

    // Get user's organization
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        members: {
          some: {
            user: {
              email: session.user.email
            }
          }
        }
      }
    })

    if (!organization) {
      return NextResponse.json({ 
        error: 'Organization not found or access denied' 
      }, { status: 404 })
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        organizationId,
        status: 'active'
      }
    })

    if (existingSubscription) {
      return NextResponse.json({ 
        error: 'Organization already has an active subscription',
        subscriptionId: existingSubscription.id
      }, { status: 400 })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        organizationId,
        userId: session.user.email,
      },
      customer_email: session.user.email,
      subscription_data: {
        metadata: {
          organizationId,
          userId: session.user.email,
        },
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })

  } catch (error) {
    console.error('Stripe checkout session error:', error)
    return NextResponse.json({ 
      error: 'Failed to create checkout session' 
    }, { status: 500 })
  }
}
