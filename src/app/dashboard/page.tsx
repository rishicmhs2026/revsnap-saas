'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ROIDashboard from '@/components/ROIDashboard'
import WorkflowHabits from '@/components/WorkflowHabits'
import ShopifyIntegration from '@/components/ShopifyIntegration'
import ZapierIntegration from '@/components/ZapierIntegration'
import EnterpriseFeaturesDashboard from '@/components/EnterpriseFeaturesDashboard'
import NotificationSystem from '@/components/NotificationSystem'
import FeatureGate, { EnterpriseFeatureGate, ProfessionalFeatureGate, StarterFeatureGate } from '@/components/FeatureGate'

interface Product {
  id: string
  name: string
  description?: string
  yourPrice?: number
  currency: string
  isActive: boolean
  competitorData: any[]
  priceAlerts: any[]
}

interface Analytics {
  totalProducts: number
  activeTrackingJobs: number
  totalAlerts: number
  unreadAlerts: number
  highSeverityAlerts: number
  averagePriceChange: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [, setAnalytics] = useState<Analytics | null>(null)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<string>('free') // Track user's subscription plan

  // Helper function to get product limits based on plan
  const getProductLimit = (plan: string): number => {
    switch (plan) {
      case 'starter': return 25
      case 'professional': return 200
      case 'enterprise': return Infinity
      case 'free':
      default: return 2
    }
  }

  // Helper function to display product count with limit
  const getProductLimitDisplay = (): string => {
    const limit = getProductLimit(userPlan)
    if (limit === Infinity) {
      return ` (${products.length})`
    }
    return ` (${products.length}/${limit})`
  }

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Load organizations
      const orgResponse = await fetch('/api/organizations')
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrganizations(orgData.data)
        if (orgData.data.length > 0 && !selectedOrg) {
          setSelectedOrg(orgData.data[0].id)
        }
      }

      if (selectedOrg) {
        // Load products
        const productsResponse = await fetch(`/api/products?organizationId=${selectedOrg}`)
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData.data)
        }

        // Load analytics
        const analyticsResponse = await fetch(`/api/analytics?organizationId=${selectedOrg}`)
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAnalytics(analyticsData.data)
        }

        // Check user's subscription plan
        try {
          const subscriptionResponse = await fetch(`/api/subscriptions?organizationId=${selectedOrg}`)
          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json()
            if (subscriptionData.data && subscriptionData.data.length > 0) {
              const activeSubscription = subscriptionData.data.find((sub: any) => sub.status === 'active')
              if (activeSubscription) {
                // Determine plan from Stripe price ID
                const planId = activeSubscription.stripePriceId?.includes('starter') ? 'starter' :
                             activeSubscription.stripePriceId?.includes('professional') ? 'professional' :
                             activeSubscription.stripePriceId?.includes('enterprise') ? 'enterprise' : 'free'
                setUserPlan(planId)
              } else {
                setUserPlan('free') // No active subscription
              }
            } else {
              setUserPlan('free') // No subscriptions
            }
          } else {
            setUserPlan('free') // API error or no subscription
          }
        } catch {
          console.log('No subscription found, user is on free plan')
          setUserPlan('free')
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedOrg])

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    // Check for success parameters from subscription purchase
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const testMode = urlParams.get('test_mode')
    const plan = urlParams.get('plan')

    if (success === 'true' && testMode === 'true' && plan) {
      // Handle test mode subscription creation
      handleTestModeSubscription(plan)
    }

    loadDashboardData()
  }, [status, selectedOrg, loadDashboardData, router])

  const handleTestModeSubscription = async (planId: string) => {
    try {
      const response = await fetch('/api/subscriptions/test-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          organizationId: selectedOrg || organizations[0]?.id
        }),
      })

      if (response.ok) {
        // Show success message
        alert(`🎉 Successfully activated ${planId} plan! Your subscription is now active.`)
        // Reload dashboard data to reflect the new subscription
        loadDashboardData()
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname)
      } else {
        const error = await response.json()
        console.error('Failed to create test subscription:', error)
      }
    } catch (error) {
      console.error('Error creating test subscription:', error)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getLatestPrice = (product: Product) => {
    if (product.competitorData.length === 0) return null
    return product.competitorData[0]
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-dark)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="main-container">
      {/* Header */}
      <header className="nav-container">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome back, {session?.user?.name || 'User'}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Organization Selector */}
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="input text-sm"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>

              {/* Notifications - Premium Feature */}
              {selectedOrg && <NotificationSystem organizationId={selectedOrg} />}

              {/* Quick Action Buttons */}
              <button
                onClick={() => router.push('/pricing-optimizer')}
                className="btn btn-secondary"
              >
                ⚡ CSV Optimizer
              </button>
              
              <button
                onClick={() => {
                  // Check plan limits
                  const limit = getProductLimit(userPlan)
                  if (products.length >= limit) {
                    const planName = userPlan.charAt(0).toUpperCase() + userPlan.slice(1)
                    alert(`${planName} plan is limited to ${limit === Infinity ? 'unlimited' : limit} products. ${limit !== Infinity ? 'Upgrade to add more products.' : 'You have reached your current limit.'}`)
                    if (limit !== Infinity) {
                      router.push('/pricing')
                    }
                    return
                  }
                  router.push('/products/new')
                }}
                className={`btn ${
                  products.length >= getProductLimit(userPlan)
                    ? 'btn-gray cursor-not-allowed' 
                    : 'btn-primary'
                }`}
                disabled={products.length >= getProductLimit(userPlan)}
              >
                ➕ Add Product{getProductLimitDisplay()}
              </button>

              {/* Profile Menu */}
              <div className="flex items-center space-x-2">
                {/* Plan Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  userPlan === 'enterprise' ? 'bg-purple-600 text-white' :
                  userPlan === 'professional' ? 'bg-blue-600 text-white' :
                  userPlan === 'starter' ? 'bg-green-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {userPlan === 'free' ? 'Free Plan' : 
                   userPlan.charAt(0).toUpperCase() + userPlan.slice(1) + ' Plan'}
                </div>
                
                <button
                  onClick={() => router.push('/billing')}
                  className="btn btn-ghost btn-sm"
                >
                  💳 Billing
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="btn btn-ghost btn-sm"
                >
                  👤 Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        {/* Welcome Banner */}
        <div className="mb-8">
          <div className="card bg-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-white">Welcome to RevSnap! 🚀</h2>
                <p className="text-blue-100 mb-4 text-sm">
                  Track competitors, optimize pricing, and increase your profit margins by 15-40%
                </p>
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/pricing"
                    className="btn btn-primary bg-white text-blue-600 hover:bg-gray-100 btn-sm"
                  >
                    Upgrade Plan
                  </Link>
                  <Link 
                    href="/pricing"
                    className="btn btn-ghost border-white text-white hover:bg-white hover:text-blue-600 btn-sm"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Cards - Clean Empty State */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="stats-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                  <span className="text-lg">📦</span>
                </div>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-400 truncate">Total Products</dt>
                <dd className="text-lg font-semibold text-white">{products.length}</dd>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center shadow-lg">
                  <span className="text-lg">▶️</span>
                </div>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-400 truncate">Active Tracking</dt>
                <dd className="text-lg font-semibold text-white">{products.filter(p => p.isActive).length}</dd>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-700 flex items-center justify-center shadow-lg">
                  <span className="text-lg">⚠️</span>
                </div>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-400 truncate">Price Alerts</dt>
                <dd className="text-lg font-semibold text-white">
                  {products.reduce((acc, p) => acc + p.priceAlerts.length, 0)}
                </dd>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
                  <span className="text-lg">📈</span>
                </div>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-400 truncate">Monitored Sites</dt>
                <dd className="text-lg font-semibold text-white">
                  {products.reduce((acc, p) => acc + p.competitorData.length, 0)}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* ROI Dashboard */}
        <div className="mb-8">
          <ROIDashboard />
        </div>

        {/* Workflow Habits */}
        <div className="mb-8">
          <WorkflowHabits />
        </div>

        {/* Integrations Row - Only for paid plans */}
        <StarterFeatureGate organizationId={selectedOrg}>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ShopifyIntegration />
            <ZapierIntegration />
          </div>
        </StarterFeatureGate>

        {/* Enterprise Features Dashboard - Only for Enterprise subscribers */}
        <EnterpriseFeatureGate organizationId={selectedOrg}>
          <div className="mb-8">
            <EnterpriseFeaturesDashboard />
          </div>
        </EnterpriseFeatureGate>

        {/* Free Plan - Strong Upgrade Prompt */}
        {userPlan === 'free' && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-2xl p-8 border border-red-700/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Premium Features Locked
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                  <strong>To access competitor tracking, AI insights, and analytics, you need a paid plan.</strong> Free accounts can only add up to 2 products for evaluation purposes.
                </p>
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6">
                  <h4 className="text-white font-semibold mb-2">🚫 What's restricted on the free plan:</h4>
                  <ul className="text-gray-300 text-left space-y-1">
                    <li>• Real-time competitor price tracking</li>
                    <li>• AI-powered pricing recommendations</li>
                    <li>• Advanced analytics dashboard</li>
                    <li>• Bulk product uploads</li>
                    <li>• API access and integrations</li>
                  </ul>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => router.push('/pricing')}
                    className="btn-primary text-lg py-3 px-8"
                  >
                    🔓 Unlock Features - Starting $49/mo
                  </button>
                  <button
                    onClick={() => router.push('/demo')}
                    className="btn-secondary text-lg py-3 px-8"
                  >
                    📊 View Demo
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  No setup fees • Cancel anytime • Dedicated support
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Your Products</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Track competitor prices and get real-time alerts
                </p>
              </div>
              <button
                onClick={() => {
                  // Check plan limits
                  const limit = getProductLimit(userPlan)
                  if (products.length >= limit) {
                    const planName = userPlan.charAt(0).toUpperCase() + userPlan.slice(1)
                    alert(`${planName} plan is limited to ${limit === Infinity ? 'unlimited' : limit} products. ${limit !== Infinity ? 'Upgrade to add more products.' : 'You have reached your current limit.'}`)
                    if (limit !== Infinity) {
                      router.push('/pricing')
                    }
                    return
                  }
                  router.push('/products/new')
                }}
                className={`btn btn-sm ${
                  products.length >= getProductLimit(userPlan)
                    ? 'btn-gray cursor-not-allowed' 
                    : 'btn-primary'
                }`}
                disabled={products.length >= getProductLimit(userPlan)}
              >
                ➕ Add Product{getProductLimitDisplay()}
              </button>
            </div>
          </div>
          
          {products.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {products.map((product) => {
                const latestPrice = getLatestPrice(product)
                return (
                  <div key={product.id} className="p-6 hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-blue-900 flex items-center justify-center border border-blue-800">
                            <span className="text-lg">📦</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="font-medium text-white">{product.name}</p>
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              product.isActive 
                                ? 'badge-success' 
                                : 'badge-neutral'
                            }`}>
                              {product.isActive ? '✅ Active' : '⏸️ Inactive'}
                            </span>
                          </div>
                          {product.description && (
                            <p className="text-sm text-gray-400 mt-1">{product.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          {product.yourPrice && (
                            <>
                              <div className="text-xs text-gray-400">Your Price</div>
                              <div className="font-medium text-white">
                                {formatCurrency(product.yourPrice, product.currency)}
                              </div>
                            </>
                          )}
                          {latestPrice && (
                            <div className="text-xs text-gray-400 mt-1">
                              Latest: {formatCurrency(latestPrice.currentPrice, latestPrice.currency)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="btn btn-ghost btn-sm"
                          >
                            👁️ View
                          </Link>
                          <Link
                            href={`/products/${product.id}/tracking`}
                            className="btn btn-secondary btn-sm"
                          >
                            ▶️ Track
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No products yet</h3>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm">
                Get started by adding your first product to begin tracking competitor prices and optimizing your pricing strategy.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/products/new')}
                  className="btn btn-primary"
                >
                  ➕ Add Your First Product
                </button>
                <button
                  onClick={() => router.push('/pricing-optimizer')}
                  className="btn btn-secondary"
                >
                  ⚡ Try CSV Optimizer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 