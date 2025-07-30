'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { STRIPE_CONFIG } from '@/lib/stripe'

interface Plan {
  id: string
  name: string
  price: number
  features: string[]
  popular?: boolean
}

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string>('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Load user's organizations
    loadOrganizations()
  }, [session, status, router])

  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.data)
        if (data.data.length > 0) {
          setSelectedOrg(data.data[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!selectedOrg) {
      alert('Please select an organization')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: selectedOrg,
          planId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Stripe checkout
        window.location.href = data.data.url
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create subscription')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Failed to create subscription')
    } finally {
      setIsLoading(false)
    }
  }

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
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
    {
      id: 'professional',
      name: 'Professional',
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
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
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
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get real-time competitor intelligence and optimize your pricing strategy
          </p>
        </div>

        {/* Organization Selector */}
        {organizations.length > 0 && (
          <div className="mb-8 text-center">
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
              Select Organization
            </label>
            <select
              id="organization"
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="block w-full max-w-xs mx-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading || !selectedOrg}
                  className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Processing...' : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                We offer a 14-day free trial on all plans. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and digital wallets through Stripe.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Need help choosing the right plan?
          </p>
          <button
            onClick={() => router.push('/contact')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact our sales team
          </button>
        </div>
      </div>
    </div>
  )
} 