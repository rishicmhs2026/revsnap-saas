'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdvancedAnalytics from '@/components/AdvancedAnalytics'
import { CompetitorData, PriceAlert } from '@/lib/competitor-tracking'
import { AIInsight, PricePrediction, MarketTrend } from '@/lib/ai-analytics'
import { RealTimeData } from '@/lib/realtime-data-service'

interface Product {
  id: string
  name: string
  description?: string
  yourPrice?: number
  currency: string
  isActive: boolean
}

export default function CompetitorTrackingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [yourPrice, setYourPrice] = useState<number>(0)
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([])
  const [isTracking, setIsTracking] = useState(false)
  const [trackingJobId, setTrackingJobId] = useState<string | null>(null)
  
  const [currentPrices, setCurrentPrices] = useState<CompetitorData[]>([])
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([])
  const [marketInsights, setMarketInsights] = useState<AIInsight[]>([])
  const [pricePredictions, setPricePredictions] = useState<PricePrediction[]>([])
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([])
  const [competitiveIntelligence, setCompetitiveIntelligence] = useState<any>(null)
  
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')
  const [wsError, setWsError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const availableCompetitors = [
    'Amazon',
    'Best Buy', 
    'Walmart',
    'Target',
    'Newegg',
    'B&H Photo',
    'Micro Center',
    'Fry\'s Electronics'
  ]

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    loadProducts()
  }, [status])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data)
        if (data.data.length > 0) {
          setSelectedProduct(data.data[0].id)
          setYourPrice(data.data[0].yourPrice || 0)
        }
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const startTracking = useCallback(async () => {
    if (!selectedProduct || selectedCompetitors.length === 0 || yourPrice <= 0) {
      alert('Please select a product, competitors, and enter your price')
      return
    }

    try {
      setIsLoading(true)
      setWsError(null)

      const response = await fetch('/api/competitor-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct,
          competitors: selectedCompetitors,
          yourPrice,
          startTracking: true,
          intervalMinutes: 15
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start tracking')
      }

      const result = await response.json()
      if (result.success) {
        setIsTracking(true)
        setTrackingJobId(result.data.trackingJobId)
        setConnectionStatus('connected')
        
        // Update with initial data
        if (result.data.currentPrices) {
          setCurrentPrices(result.data.currentPrices)
        }
        if (result.data.alerts) {
          setPriceAlerts(result.data.alerts)
        }
        if (result.data.competitiveIntelligence) {
          setCompetitiveIntelligence(result.data.competitiveIntelligence)
        }
        if (result.data.marketAnalysis) {
          setMarketInsights(result.data.marketAnalysis.recommendations || [])
        }
        
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error starting tracking:', error)
      setWsError(error instanceof Error ? error.message : 'Unknown error')
      setConnectionStatus('error')
    } finally {
      setIsLoading(false)
    }
  }, [selectedProduct, selectedCompetitors, yourPrice])

  const stopTracking = useCallback(async () => {
    if (!trackingJobId) return

    try {
      const response = await fetch('/api/competitor-tracking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct,
          action: 'stop_tracking',
          data: { trackingJobId }
        })
      })

      if (response.ok) {
        setIsTracking(false)
        setTrackingJobId(null)
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('Error stopping tracking:', error)
    }
  }, [trackingJobId, selectedProduct])

  const fetchCurrentData = useCallback(async () => {
    if (!selectedProduct) return

    try {
      const response = await fetch(`/api/competitor-tracking?productId=${selectedProduct}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCurrentPrices(result.data.currentPrices || [])
          setPriceAlerts(result.data.priceAlerts || [])
          setMarketInsights(result.data.marketInsights || [])
          setPricePredictions(result.data.pricePredictions || [])
          setMarketTrends(result.data.marketTrends || [])
          setCompetitiveIntelligence(result.data.competitiveIntelligence)
          setLastUpdate(new Date())
        }
      }
    } catch (error) {
      console.error('Error fetching current data:', error)
    }
  }, [selectedProduct])

  // Poll for updates when tracking is active
  useEffect(() => {
    if (!isTracking) return

    const interval = setInterval(fetchCurrentData, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [isTracking, fetchCurrentData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-Time Competitor Tracking</h1>
          <p className="text-gray-600">Monitor competitor prices with AI-powered market intelligence</p>
        </div>

        {/* Setup Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tracking Setup</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value)
                  const product = products.find(p => p.id === e.target.value)
                  if (product) {
                    setYourPrice(product.yourPrice || 0)
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Price</label>
              <input
                type="number"
                value={yourPrice}
                onChange={(e) => setYourPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Competitors</label>
              <select
                multiple
                value={selectedCompetitors}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  setSelectedCompetitors(values)
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {availableCompetitors.map(competitor => (
                  <option key={competitor} value={competitor}>
                    {competitor}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={isTracking ? stopTracking : startTracking}
                disabled={isLoading || !selectedProduct || selectedCompetitors.length === 0 || yourPrice <= 0}
                className={`w-full px-4 py-2 rounded-md font-medium ${
                  isTracking
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Starting...' : isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </button>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'error' ? 'bg-red-500' :
                'bg-gray-400'
              }`}></div>
              <span className="text-sm text-gray-600">
                Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </span>
            </div>
            
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            
            {wsError && (
              <span className="text-sm text-red-600">
                Error: {wsError}
              </span>
            )}
          </div>
        </div>

        {/* Real-Time Data Display */}
        {selectedProduct && (
          <div className="space-y-8">
            {/* Current Prices */}
            {currentPrices.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Prices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentPrices.map((price, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{price.competitor}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          price.priceChange && price.priceChange > 0 
                            ? 'text-green-600 bg-green-100' 
                            : price.priceChange && price.priceChange < 0 
                            ? 'text-red-600 bg-red-100'
                            : 'text-gray-600 bg-gray-100'
                        }`}>
                          {price.priceChange ? formatPercentage(price.priceChangePercent || 0) : 'No change'}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(price.currentPrice)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last updated: {new Date(price.lastUpdated).toLocaleTimeString()}
                      </div>
                      {price.availability !== undefined && (
                        <div className="text-sm text-gray-500">
                          {price.availability ? 'In Stock' : 'Out of Stock'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Analytics */}
            {selectedProduct && (
              <AdvancedAnalytics
                productId={selectedProduct}
                yourPrice={yourPrice}
                competitors={selectedCompetitors}
              />
            )}

            {/* Price Alerts */}
            {priceAlerts.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Alerts</h2>
                <div className="space-y-3">
                  {priceAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{alert.competitor}</div>
                        <div className="text-sm text-gray-600">{alert.productName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {formatCurrency(alert.oldPrice)} → {formatCurrency(alert.newPrice)}
                        </div>
                        <div className={`text-sm font-medium ${
                          alert.changePercent > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatPercentage(alert.changePercent)}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Insights */}
            {marketInsights.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Market Insights</h2>
                <div className="space-y-4">
                  {marketInsights.map((insight, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{insight.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                          {insight.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      <div className="text-sm text-gray-500">
                        Confidence: {(insight.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive Intelligence Summary */}
            {competitiveIntelligence && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Competitive Intelligence</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">Risk Level</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        competitiveIntelligence.riskLevel === 'high' ? 'bg-red-500' :
                        competitiveIntelligence.riskLevel === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}>
                        {competitiveIntelligence.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Market Position</span>
                        <span className="text-sm font-medium">{competitiveIntelligence.marketPosition?.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Percentile</span>
                        <span className="text-sm font-medium">{competitiveIntelligence.marketPosition?.percentile?.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Summary</div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {competitiveIntelligence.summary}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 