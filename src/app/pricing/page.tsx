'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
// import { STRIPE_CONFIG } from '@/lib/stripe' // Unused import

interface Plan {
  id: string
  name: string
  price: number
  features: string[]
  popular?: boolean
  badge?: string
  description?: string
}

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  // const [selectedPlan, setSelectedPlan] = useState<string>('') // Unused variables
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
    let organizationId = selectedOrg

    // If no organization is selected, create a default one
    if (!organizationId) {
      try {
        const defaultOrgName = `${session?.user?.name || 'My Company'}'s Organization`
        const defaultSlug = `${session?.user?.name?.toLowerCase().replace(/\s+/g, '-') || 'my-company'}-org`
        
        const orgResponse = await fetch('/api/organizations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: defaultOrgName,
            slug: defaultSlug,
            description: 'Default organization',
            industry: 'E-commerce',
            size: 'Small'
          }),
        })

        if (orgResponse.ok) {
          const orgData = await orgResponse.json()
          organizationId = orgData.data.id
          setSelectedOrg(organizationId)
          // Reload organizations to update the list
          loadOrganizations()
        } else {
          alert('Please create an organization first')
          return
        }
      } catch (error) {
        console.error('Error creating organization:', error)
        alert('Failed to create organization')
        return
      }
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          planId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Stripe checkout or dashboard in test mode
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
      description: 'Perfect for growing DTC brands',
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
      description: 'Best for scaling businesses',
      popular: true,
      badge: 'Most Popular',
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
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 399,
      description: 'For large-scale operations',
      badge: 'Premium',
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-dark)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading pricing options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="main-container">
      {/* Navigation */}
      <nav className="nav-container">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <span className="font-semibold text-white">RevSnap</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => router.push('/dashboard')} className="nav-link">
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="trust-badge">
            🔥 Professional pricing intelligence for growing DTC brands
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Choose your growth plan
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Get real-time competitor intelligence and optimize your pricing strategy. 
            <span className="text-white font-medium"> Join 500+ DTC brands increasing profits by 15-40%</span>
          </p>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-1 mb-8">
            <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                            <span className="ml-2 text-gray-400 text-sm">Trusted by growing brands</span>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400 mb-12">
            <div className="flex items-center">
              <span className="text-green-400 mr-1">🚀</span>
              <span>Real-time tracking</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-400 mr-1">🛡️</span>
              <span>No setup fees</span>
            </div>
            <div className="flex items-center">
              <span className="text-purple-400 mr-1">⏰</span>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Organization Selector */}
          {organizations.length > 0 ? (
            <div className="mb-12">
              <label htmlFor="organization" className="block text-sm font-medium text-gray-300 mb-2">
                Select Organization
              </label>
              <select
                id="organization"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="input max-w-xs mx-auto"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mb-12">
              <div className="text-center text-gray-400 text-sm">
                <span className="text-blue-400 mr-2">ℹ️</span>
                A default organization will be created when you subscribe
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card relative ${
                plan.popular ? 'border-blue-600 shadow-lg' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="badge badge-info bg-blue-600 text-white px-3 py-1">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400 text-sm ml-1">/month</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Billed monthly • Cancel anytime
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="text-green-400 mr-2 mt-0.5">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                  className={`btn w-full ${
                    plan.popular
                      ? 'btn-primary text-lg font-bold py-3 transform hover:scale-105 transition-all shadow-lg'
                      : 'btn-secondary'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Processing...
                    </div>
                  ) : plan.popular ? (
                    '🚀 Get Started (Most Popular)'
                  ) : (
                    'Get Started'
                  )}
                </button>

                <div className="text-center mt-3">
                  <p className="text-xs text-gray-500">
                    Billed monthly • Cancel anytime
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Why DTC brands choose RevSnap
              </h2>
              <p className="text-lg text-gray-300">
                Everything you need to optimize pricing and increase profits
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-900 rounded-lg flex items-center justify-center border border-blue-800">
                  <span className="text-xl">📈</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Proven results</h3>
                <p className="text-gray-300 text-sm">
                  Data-driven pricing optimization for maximum profitability
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-900 rounded-lg flex items-center justify-center border border-green-800">
                  <span className="text-xl">⚡</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Quick setup</h3>
                <p className="text-gray-300 text-sm">
                  Get started in under 30 seconds with our CSV optimizer
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-900 rounded-lg flex items-center justify-center border border-purple-800">
                  <span className="text-xl">🛡️</span>
                </div>
                <h3 className="font-semibold text-white mb-2">100% legal</h3>
                <p className="text-gray-300 text-sm">
                  Fully compliant data collection and privacy protection
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently asked questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-semibold text-white mb-2">
                  Can I change my plan later?
                </h3>
                <p className="text-gray-300 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes are prorated and take effect immediately.
                </p>
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-white mb-2">
                  How does billing work?
                </h3>
                <p className="text-gray-300 text-sm">
                  All plans are billed monthly. You can upgrade, downgrade, or cancel anytime from your dashboard.
                </p>
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-300 text-sm">
                  We accept all major credit cards, debit cards, and digital wallets through our secure Stripe integration.
                </p>
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-white mb-2">
                  How quickly will I see results?
                </h3>
                <p className="text-gray-300 text-sm">
                  Most customers see pricing optimization opportunities within the first day and revenue improvements within 1-2 weeks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-black py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to increase your profits?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join 500+ successful DTC brands using RevSnap to optimize pricing and boost revenue. Choose your plan above to get started.
          </p>
          <button
            onClick={() => router.push('/demo')}
            className="btn btn-primary btn-lg"
          >
            ⚡ View Demo
          </button>
          <p className="text-sm text-gray-400 mt-4">
            No setup fees • Cancel anytime • Dedicated support
          </p>
        </div>
      </section>
    </div>
  )
} 