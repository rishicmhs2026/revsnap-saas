import Stripe from 'stripe'

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  // Subscription plans
  plans: {
    starter: {
      name: 'Starter',
      priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
      price: 49,
      features: [
        'Up to 25 products',
        'Real-time competitor tracking',
        'AI-powered market insights',
        'Price change alerts',
        'Advanced analytics dashboard',
        'Priority email support',
        'Data export capabilities',
        'Mobile-responsive dashboard'
      ]
    },
    professional: {
      name: 'Professional',
      priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
      price: 149,
      features: [
        'Up to 200 products',
        'Premium competitor tracking (8+ sources)',
        'Real-time price updates (15 min intervals)',
        'Advanced AI market intelligence',
        'Custom alert thresholds',
        'API access with higher limits',
        'Priority phone support',
        'Advanced reporting & insights',
        'Team collaboration features'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
      price: 399,
      features: [
        'Unlimited products',
        'Enterprise-grade competitor tracking',
        'Real-time updates (5 min intervals)',
        'Custom AI models for your industry',
        'Dedicated account manager',
        'Custom integrations & white-label',
        'Advanced team management',
        'Custom reporting & analytics',
        'SLA guarantees'
      ]
    }
  }
}

// Stripe utility functions
export class StripeService {
  // Create a customer
  static async createCustomer(email: string, name?: string) {
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'revsnap-saas'
      }
    })
  }

  // Create a checkout session
  static async createCheckoutSession({
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    metadata = {}
  }: {
    customerId: string
    priceId: string
    successUrl: string
    cancelUrl: string
    metadata?: Record<string, string>
  }) {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })
  }

  // Create a billing portal session
  static async createBillingPortalSession(customerId: string, returnUrl: string) {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
  }

  // Get subscription details
  static async getSubscription(subscriptionId: string) {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'items.data.price']
    })
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    })
  }

  // Reactivate subscription
  static async reactivateSubscription(subscriptionId: string) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
  }

  // Update subscription
  static async updateSubscription(subscriptionId: string, priceId: string) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'create_prorations',
    })
  }

  // Get customer's payment methods
  static async getPaymentMethods(customerId: string) {
    return await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })
  }

  // Create invoice
  static async createInvoice(customerId: string, priceId: string, description?: string) {
    return await stripe.invoices.create({
      customer: customerId,
      collection_method: 'charge_automatically',
      description,
    })
  }

  // Get customer's invoices
  static async getInvoices(customerId: string, limit = 10) {
    return await stripe.invoices.list({
      customer: customerId,
      limit,
      status: 'paid',
    })
  }
}

// Webhook event types
export const STRIPE_WEBHOOK_EVENTS = {
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END: 'customer.subscription.trial_will_end',
} as const

// Subscription status mapping
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
} as const 