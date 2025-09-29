'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingBagIcon,
  CogIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

interface ShopifyStore {
  id: string
  shopDomain: string
  isActive: boolean
  lastSync: Date
  syncedProducts: number
  settings: {
    autoSync: boolean
    autoPriceUpdate: boolean
    priceUpdateThreshold: number
  }
}

interface PricingRecommendation {
  variantId: string
  productName: string
  currentPrice: number
  recommendedPrice: number
  confidence: number
  reasoning: string
  expectedImpact: {
    revenueChange: number
    marginChange: number
  }
}

export default function ShopifyIntegration() {
  const [stores, setStores] = useState<ShopifyStore[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [recommendations, setRecommendations] = useState<PricingRecommendation[]>([])
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'settings'>('overview')

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const response = await fetch('/api/shopify?action=stores&organizationId=demo-org')
      if (response.ok) {
        const data = await response.json()
        setStores(data.stores || [])
      }
    } catch (error) {
      console.error('Error loading stores:', error)
    }
  }

  const connectStore = async (shopDomain: string, accessToken: string) => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          organizationId: 'demo-org',
          shopDomain,
          accessToken
        })
      })

      const result = await response.json()
      if (result.success) {
        setShowConnectModal(false)
        await loadStores()
      } else {
        alert(result.error || 'Failed to connect store')
      }
    } catch (error) {
      console.error('Error connecting store:', error)
      alert('Failed to connect store')
    } finally {
      setIsConnecting(false)
    }
  }

  const syncStore = async (storeId: string) => {
    try {
      const response = await fetch('/api/shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          organizationId: 'demo-org',
          storeId
        })
      })

      const result = await response.json()
      if (result.success) {
        alert(`Synced ${result.synced} products successfully`)
        await loadStores()
      } else {
        alert('Sync failed')
      }
    } catch (error) {
      console.error('Error syncing store:', error)
      alert('Sync failed')
    }
  }

  const loadRecommendations = async (storeId: string) => {
    try {
      const response = await fetch(`/api/shopify?action=pricing-recommendations&storeId=${storeId}`)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <ShoppingBagIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Shopify Integration</h2>
            <p className="text-sm text-gray-600">Sync products and automate pricing</p>
          </div>
        </div>

        {stores.length === 0 && (
          <button
            onClick={() => setShowConnectModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <ShoppingBagIcon className="h-4 w-4" />
            <span>Connect Store</span>
          </button>
        )}
      </div>

      {stores.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Shopify Store</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Automatically sync your products and get AI-powered pricing recommendations to increase profits.
          </p>
          <button
            onClick={() => setShowConnectModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Get Started
          </button>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 p-4 rounded-lg">
              <BoltIcon className="h-6 w-6 text-green-600 mb-2 mx-auto" />
              <h4 className="font-medium text-green-900">Auto Sync</h4>
              <p className="text-green-700">Products sync automatically every hour</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600 mb-2 mx-auto" />
              <h4 className="font-medium text-blue-900">Smart Pricing</h4>
              <p className="text-blue-700">AI suggests optimal prices based on competitors</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600 mb-2 mx-auto" />
              <h4 className="font-medium text-purple-900">Profit Boost</h4>
              <p className="text-purple-700">Average 15-25% profit increase</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'recommendations', label: 'Pricing Recommendations' },
              { id: 'settings', label: 'Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {stores.map(store => (
                <div key={store.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${store.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <h3 className="font-medium text-gray-900">{store.shopDomain}</h3>
                        <p className="text-sm text-gray-600">
                          {store.syncedProducts} products • Last sync: {new Date(store.lastSync).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => syncStore(store.id)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                        <span>Sync</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStore(store.id)
                          setActiveTab('recommendations')
                          loadRecommendations(store.id)
                        }}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <ChartBarIcon className="h-4 w-4" />
                        <span>Optimize</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Auto Sync</p>
                      <p className="font-medium">{store.settings.autoSync ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Auto Pricing</p>
                      <p className="font-medium">{store.settings.autoPriceUpdate ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Price Threshold</p>
                      <p className="font-medium">{store.settings.priceUpdateThreshold}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Select a store to see pricing recommendations</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Pricing Recommendations ({recommendations.length})
                    </h3>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Apply All Recommended
                    </button>
                  </div>

                  <div className="space-y-3">
                    {recommendations.map(rec => (
                      <div key={rec.variantId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{rec.productName}</h4>
                          <div className={`px-2 py-1 text-xs rounded-full ${
                            rec.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                            rec.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(rec.confidence * 100)}% confidence
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-500">Current Price</p>
                            <p className="font-medium">${rec.currentPrice}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Recommended</p>
                            <p className="font-medium text-green-600">${rec.recommendedPrice}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Revenue Impact</p>
                            <p className={`font-medium ${rec.expectedImpact.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {rec.expectedImpact.revenueChange >= 0 ? '+' : ''}${rec.expectedImpact.revenueChange.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Margin Change</p>
                            <p className={`font-medium ${rec.expectedImpact.marginChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {rec.expectedImpact.marginChange >= 0 ? '+' : ''}{rec.expectedImpact.marginChange.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{rec.reasoning}</p>

                        <div className="flex items-center justify-between">
                          <button className="text-sm text-gray-500 hover:text-gray-700">
                            View Details
                          </button>
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                              Ignore
                            </button>
                            <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Integration Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Automatic Product Sync</h4>
                    <p className="text-sm text-gray-600">Sync new products from Shopify hourly</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-green-600" />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Automatic Price Updates</h4>
                    <p className="text-sm text-gray-600">Apply pricing recommendations automatically</p>
                  </div>
                  <input type="checkbox" className="rounded text-green-600" />
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Price Change Threshold</h4>
                  <p className="text-sm text-gray-600 mb-3">Maximum price change allowed for automatic updates</p>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      defaultValue="5"
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">5%</span>
                  </div>
                </div>
              </div>

              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Save Settings
              </button>
            </div>
          )}
        </>
      )}

      {/* Connect Store Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect Shopify Store</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Domain
                </label>
                <input
                  type="text"
                  placeholder="your-shop.myshopify.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token
                </label>
                <input
                  type="password"
                  placeholder="shppa_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Create a private app in your Shopify admin to get an access token
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => connectStore('demo-shop', 'demo-token')}
                disabled={isConnecting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect Store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 