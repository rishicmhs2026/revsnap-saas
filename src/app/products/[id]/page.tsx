'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description?: string
  sku?: string
  category?: string
  brand?: string
  image?: string
  url?: string
  yourPrice?: number
  currency: string
  isActive: boolean
  organization: any
  competitorData: any[]
  priceAlerts: any[]
  trackingJobs: any[]
}

interface Analytics {
  priceHistory: any[]
  alerts: any[]
  trackingStats: any[]
  totalAlerts: number
  highSeverityAlerts: number
  averagePriceChange: number
}

export default function ProductDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    loadProductData()
  }, [status, params.id])

  const loadProductData = async () => {
    try {
      setIsLoading(true)

      // Load product details
      const productResponse = await fetch(`/api/products/${params.id}`)
      if (productResponse.ok) {
        const productData = await productResponse.json()
        setProduct(productData.data)
      } else {
        setError('Product not found')
      }

      // Load analytics
      const analyticsResponse = await fetch(`/api/analytics?productId=${params.id}`)
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData.data)
      }
    } catch (error) {
      console.error('Error loading product data:', error)
      setError('Failed to load product data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getLatestPrice = (competitorData: any[]) => {
    if (competitorData.length === 0) return null
    return competitorData[0]
  }

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600'
    if (change < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return '↗️'
    if (change < 0) return '↘️'
    return '→'
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-600">
                  {product.organization?.name} • {product.category || 'Uncategorized'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
              <Link
                href={`/products/${product.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'competitors', name: 'Competitors' },
              { id: 'alerts', name: 'Price Alerts' },
              { id: 'analytics', name: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Details */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.name}</dd>
                  </div>
                  {product.sku && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">SKU</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.sku}</dd>
                    </div>
                  )}
                  {product.brand && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Brand</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.brand}</dd>
                    </div>
                  )}
                  {product.category && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.category}</dd>
                    </div>
                  )}
                  {product.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.description}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Pricing Summary */}
            <div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
                <div className="space-y-4">
                  {product.yourPrice && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Your Price</dt>
                      <dd className="mt-1 text-2xl font-bold text-gray-900">
                        {formatCurrency(product.yourPrice, product.currency)}
                      </dd>
                    </div>
                  )}
                  {analytics && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Avg Price Change</dt>
                      <dd className={`mt-1 text-lg font-medium ${getPriceChangeColor(analytics.averagePriceChange)}`}>
                        {analytics.averagePriceChange > 0 ? '+' : ''}{analytics.averagePriceChange.toFixed(2)}%
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'competitors' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Competitor Prices</h3>
              {product.competitorData.length > 0 ? (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Competitor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Change
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {product.competitorData.map((data) => (
                        <tr key={data.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{data.competitor}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(data.currentPrice, data.currency)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${getPriceChangeColor(data.priceChange || 0)}`}>
                              {getPriceChangeIcon(data.priceChange || 0)} {data.priceChange ? Math.abs(data.priceChange).toFixed(2) : '0'}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(data.lastUpdated).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <a
                              href={data.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No competitor data</h3>
                  <p className="mt-1 text-sm text-gray-500">Start tracking competitors to see their prices.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Price Alerts</h3>
              {product.priceAlerts.length > 0 ? (
                <div className="space-y-4">
                  {product.priceAlerts.map((alert) => (
                    <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{alert.competitor}</h4>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(alert.oldPrice)} → {formatCurrency(alert.newPrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {alert.severity}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(alert.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
                  <p className="mt-1 text-sm text-gray-500">No price alerts for this product.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Price History</h3>
              {analytics.priceHistory.length > 0 ? (
                <div className="space-y-2">
                  {analytics.priceHistory.slice(0, 10).map((price, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        {new Date(price.lastUpdated).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(price.currentPrice, price.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No price history available.</p>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Alerts</dt>
                  <dd className="mt-1 text-2xl font-bold text-gray-900">{analytics.totalAlerts}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">High Severity Alerts</dt>
                  <dd className="mt-1 text-2xl font-bold text-red-600">{analytics.highSeverityAlerts}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Average Price Change</dt>
                  <dd className={`mt-1 text-2xl font-bold ${getPriceChangeColor(analytics.averagePriceChange)}`}>
                    {analytics.averagePriceChange > 0 ? '+' : ''}{analytics.averagePriceChange.toFixed(2)}%
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 