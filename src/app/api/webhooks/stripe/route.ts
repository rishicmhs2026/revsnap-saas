import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, STRIPE_WEBHOOK_EVENTS, SUBSCRIPTION_STATUS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      )
    }

    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Received webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED:
        await handlePaymentSucceeded(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    const { organizationId, planId, userId } = subscription.metadata

    if (!organizationId || !planId || !userId) {
      console.error('Missing metadata in subscription:', subscription.id)
      return
    }

    // Create or update subscription in database
    await prisma.subscription.upsert({
      where: {
        stripeSubscriptionId: subscription.id
      },
      update: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date()
      },
      create: {
        organizationId,
        userId,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    })

    console.log(`Subscription created: ${subscription.id}`)
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscription.id
      },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date()
      }
    })

    console.log(`Subscription updated: ${subscription.id}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscription.id
      },
      data: {
        status: SUBSCRIPTION_STATUS.CANCELED,
        updatedAt: new Date()
      }
    })

    console.log(`Subscription deleted: ${subscription.id}`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    if (invoice.subscription) {
      await prisma.subscription.updateMany({
        where: {
          stripeSubscriptionId: invoice.subscription as string
        },
        data: {
          status: SUBSCRIPTION_STATUS.ACTIVE,
          updatedAt: new Date()
        }
      })
    }

    console.log(`Payment succeeded for invoice: ${invoice.id}`)
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    if (invoice.subscription) {
      await prisma.subscription.updateMany({
        where: {
          stripeSubscriptionId: invoice.subscription as string
        },
        data: {
          status: SUBSCRIPTION_STATUS.PAST_DUE,
          updatedAt: new Date()
        }
      })
    }

    console.log(`Payment failed for invoice: ${invoice.id}`)
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
} 