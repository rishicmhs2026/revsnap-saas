'use client'

import { useState, useEffect } from 'react'
import { AIInsight, PricePrediction, MarketTrend, CompetitiveIntelligence } from '@/lib/ai-analytics'
import { RealTimeData } from '@/lib/realtime-data-service'

interface AdvancedAnalyticsProps {
  productId: string
  yourPrice?: number
  competitors: string[]
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension: number
  }[]
}

export default function AdvancedAnalytics({ productId, yourPrice, competitors }: AdvancedAnalyticsProps) {
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d')
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'market_share' | 'trends'>('price')

  useEffect(() => {
    loadRealTimeData()
  }, [productId])

  const loadRealTimeData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/competitor-tracking?productId=${productId}`)
      if (!response.ok) {
        throw new Error('Failed to load analytics data')
      }

      const result = await response.json()
      if (result.success) {
        setRealTimeData(result.data)
      } else {
        throw new Error(result.error || 'Failed to load data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

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

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const generatePriceChartData = (): ChartData => {
    if (!realTimeData?.currentPrices) {
      return { labels: [], datasets: [] }
    }

    const labels = realTimeData.currentPrices.map(p => p.competitor)
    const prices = realTimeData.currentPrices.map(p => p.currentPrice)
    
    const datasets = [
      {
        label: 'Current Prices',
        data: prices,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]

    if (yourPrice) {
      datasets.push({
        label: 'Your Price',
        data: Array(prices.length).fill(yourPrice),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0
      })
    }

    return { labels, datasets }
  }

  const generateTrendChartData = (): ChartData => {
    if (!realTimeData?.marketTrends) {
      return { labels: [], datasets: [] }
    }

    const labels = realTimeData.marketTrends.map(t => t.type)
    const strengths = realTimeData.marketTrends.map(t => t.strength * 100)

    return {
      labels,
      datasets: [{
        label: 'Trend Strength',
        data: strengths,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4
      }]
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error Loading Analytics</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={loadRealTimeData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!realTimeData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-600">
          No analytics data available
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Advanced Market Analytics</h2>
          <div className="flex space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="price">Price Analysis</option>
              <option value="market_share">Market Share</option>
              <option value="trends">Market Trends</option>
            </select>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Data Quality</div>
            <div className="text-2xl font-bold text-blue-900">
              {(realTimeData.performanceMetrics.dataQuality * 100).toFixed(0)}%
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Response Time</div>
            <div className="text-2xl font-bold text-green-900">
              {realTimeData.performanceMetrics.responseTime}ms
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Active Sources</div>
            <div className="text-2xl font-bold text-purple-900">
              {realTimeData.currentPrices.length}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Last Update</div>
            <div className="text-sm font-bold text-orange-900">
              {new Date(realTimeData.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Intelligence */}
      {realTimeData.competitiveIntelligence && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Competitive Intelligence</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Risk Level</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getRiskLevelColor(realTimeData.competitiveIntelligence.riskLevel)}`}>
                  {realTimeData.competitiveIntelligence.riskLevel.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Market Position</span>
                  <span className="text-sm font-medium">{realTimeData.competitiveIntelligence.marketPosition.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Percentile</span>
                  <span className="text-sm font-medium">{realTimeData.competitiveIntelligence.marketPosition.percentile.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Strength</span>
                  <span className="text-sm font-medium">{(realTimeData.competitiveIntelligence.marketPosition.strength * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-2">Summary</div>
              <p className="text-sm text-gray-800 leading-relaxed">
                {realTimeData.competitiveIntelligence.summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Price Analysis Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Price Analysis</h3>
        
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 mb-2">Price Chart</div>
            <div className="text-sm text-gray-400">
              {realTimeData.currentPrices.length} competitors tracked
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {realTimeData.currentPrices.map((price, index) => (
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
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      {realTimeData.marketInsights.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Market Insights</h3>
          
          <div className="space-y-4">
            {realTimeData.marketInsights.map((insight, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                    {insight.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Confidence:</span>
                    <span className="ml-2 font-medium">{(insight.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Revenue Impact:</span>
                    <span className={`ml-2 font-medium ${insight.impact.revenue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(insight.impact.revenue * 100)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Market Share:</span>
                    <span className={`ml-2 font-medium ${insight.impact.marketShare > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(insight.impact.marketShare * 100)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Predictions */}
      {realTimeData.pricePredictions.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Price Predictions ({selectedTimeframe})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {realTimeData.pricePredictions
              .filter(p => p.timeframe === selectedTimeframe)
              .map((prediction, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{prediction.competitor}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      prediction.trend === 'up' ? 'text-green-600 bg-green-100' :
                      prediction.trend === 'down' ? 'text-red-600 bg-red-100' :
                      'text-gray-600 bg-gray-100'
                    }`}>
                      {prediction.trend.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(prediction.predictedPrice)}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    Confidence: {(prediction.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">
                    {prediction.factors.join(', ')}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Market Trends */}
      {realTimeData.marketTrends.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Trends</h3>
          
          <div className="space-y-4">
            {realTimeData.marketTrends.map((trend, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{trend.type.charAt(0).toUpperCase() + trend.type.slice(1)} Trend</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trend.direction === 'up' ? 'text-green-600 bg-green-100' :
                    trend.direction === 'down' ? 'text-red-600 bg-red-100' :
                    'text-gray-600 bg-gray-100'
                  }`}>
                    {trend.direction.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{trend.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Strength:</span>
                    <span className="ml-2 font-medium">{(trend.strength * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium">{trend.duration} days</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Confidence:</span>
                    <span className="ml-2 font-medium">{(trend.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Affected:</span>
                    <span className="ml-2 font-medium">{trend.affectedCompetitors.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Alerts */}
      {realTimeData.priceAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Price Alerts</h3>
          
          <div className="space-y-3">
            {realTimeData.priceAlerts.map((alert, index) => (
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
    </div>
  )
} 