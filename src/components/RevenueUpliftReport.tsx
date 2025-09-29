'use client'

import { useState } from 'react'
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface PricingAnalysis {
  productName: string
  currentPrice: number
  cost: number
  currentMargin: number
  recommendedPrice: number
  projectedMargin: number
  priceChange: number
  priceChangePercent: number
  revenueImpact: number
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

interface AnalysisResults {
  summary: {
    totalProducts: number
    totalCurrentRevenue: number
    totalProjectedRevenue: number
    revenueUplift: number
    revenueUpliftPercent: number
    avgMarginImprovement: number
    highConfidenceRecommendations: number
  }
  recommendations: PricingAnalysis[]
  topOpportunities: PricingAnalysis[]
  riskProducts: PricingAnalysis[]
}

interface RevenueUpliftReportProps {
  results: AnalysisResults
  onExportPDF: () => void
}

export default function RevenueUpliftReport({ results, onExportPDF }: RevenueUpliftReportProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'recommendations' | 'opportunities' | 'risks'>('overview')
  const [companyName, setCompanyName] = useState('Demo Company')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-400 bg-green-900/20 border-green-700'
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700'
      case 'low': return 'text-red-400 bg-red-900/20 border-red-700'
      default: return 'text-gray-400 bg-gray-900/20 border-gray-700'
    }
  }

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <CheckCircleIcon className="h-4 w-4" />
      case 'medium': return <InformationCircleIcon className="h-4 w-4" />
      case 'low': return <ExclamationTriangleIcon className="h-4 w-4" />
      default: return <InformationCircleIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Revenue Uplift Report</h2>
          <p className="text-gray-400">AI-powered pricing optimization analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company Name"
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={onExportPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-yellow-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-yellow-600 transition-all"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Revenue Uplift</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(results.summary.revenueUplift)}</p>
              <p className="text-green-400 text-sm">+{results.summary.revenueUpliftPercent.toFixed(1)}%</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Margin Improvement</p>
              <p className="text-2xl font-bold text-white">+{results.summary.avgMarginImprovement.toFixed(1)}%</p>
              <p className="text-blue-400 text-sm">Average across products</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">High Confidence</p>
              <p className="text-2xl font-bold text-white">{results.summary.highConfidenceRecommendations}</p>
              <p className="text-purple-400 text-sm">Recommendations</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium">Total Products</p>
              <p className="text-2xl font-bold text-white">{results.summary.totalProducts}</p>
              <p className="text-yellow-400 text-sm">Analyzed</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', count: results.summary.totalProducts },
            { id: 'recommendations', label: 'All Recommendations', count: results.recommendations.length },
            { id: 'opportunities', label: 'Top Opportunities', count: results.topOpportunities.length },
            { id: 'risks', label: 'Risk Products', count: results.riskProducts.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-700 text-gray-300 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Revenue Projection Chart */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Projection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Revenue</span>
                    <span className="text-white font-medium">{formatCurrency(results.summary.totalCurrentRevenue)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gray-600 h-3 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Projected Revenue</span>
                    <span className="text-green-400 font-medium">{formatCurrency(results.summary.totalProjectedRevenue)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full" 
                      style={{ width: `${Math.min(100, (results.summary.totalProjectedRevenue / results.summary.totalCurrentRevenue) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">
                      <strong>{results.summary.highConfidenceRecommendations} products</strong> have high-confidence pricing recommendations
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                    <span className="text-gray-300">
                      Average margin improvement of <strong>+{results.summary.avgMarginImprovement.toFixed(1)}%</strong> across all products
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CurrencyDollarIcon className="h-5 w-5 text-purple-400 mt-0.5" />
                    <span className="text-gray-300">
                      Potential revenue uplift of <strong>{formatCurrency(results.summary.revenueUplift)}</strong> annually
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Implementation Priority</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">High Priority</span>
                    <span className="text-green-400 font-medium">{results.topOpportunities.length} products</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Medium Priority</span>
                    <span className="text-yellow-400 font-medium">
                      {results.recommendations.filter(r => r.confidence === 'medium').length} products
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Review Required</span>
                    <span className="text-red-400 font-medium">{results.riskProducts.length} products</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'recommendations' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">All Pricing Recommendations</h3>
              <p className="text-gray-400 text-sm mt-1">Complete analysis of all {results.recommendations.length} products</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Recommended</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Impact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {results.recommendations.map((rec, index) => (
                    <tr key={index} className="hover:bg-gray-800/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{rec.productName}</div>
                        <div className="text-xs text-gray-400">{rec.reasoning}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatCurrency(rec.currentPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                        {formatCurrency(rec.recommendedPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          rec.priceChangePercent > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {rec.priceChangePercent > 0 ? '+' : ''}{rec.priceChangePercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          rec.revenueImpact > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {rec.revenueImpact > 0 ? '+' : ''}{formatCurrency(rec.revenueImpact)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getConfidenceColor(rec.confidence)}`}>
                          {getConfidenceIcon(rec.confidence)}
                          <span className="ml-1 capitalize">{rec.confidence}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'opportunities' && (
          <div className="space-y-4">
            {results.topOpportunities.map((opp, index) => (
              <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl font-bold text-purple-400">#{index + 1}</span>
                      <h3 className="text-lg font-semibold text-white">{opp.productName}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getConfidenceColor(opp.confidence)}`}>
                        {getConfidenceIcon(opp.confidence)}
                        <span className="ml-1 capitalize">{opp.confidence}</span>
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{opp.reasoning}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Current Price</p>
                        <p className="text-sm font-medium text-white">{formatCurrency(opp.currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Recommended</p>
                        <p className="text-sm font-medium text-green-400">{formatCurrency(opp.recommendedPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Price Change</p>
                        <p className="text-sm font-medium text-yellow-400">+{opp.priceChangePercent.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Revenue Impact</p>
                        <p className="text-sm font-medium text-purple-400">+{formatCurrency(opp.revenueImpact)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'risks' && (
          <div className="space-y-4">
            {results.riskProducts.length > 0 ? (
              results.riskProducts.map((risk, index) => (
                <div key={index} className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{risk.productName}</h3>
                      <p className="text-gray-400 text-sm mb-4">{risk.reasoning}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Current Price</p>
                          <p className="text-sm font-medium text-white">{formatCurrency(risk.currentPrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Recommended</p>
                          <p className="text-sm font-medium text-red-400">{formatCurrency(risk.recommendedPrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Price Change</p>
                          <p className="text-sm font-medium text-red-400">{risk.priceChangePercent.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Revenue Impact</p>
                          <p className="text-sm font-medium text-red-400">{formatCurrency(risk.revenueImpact)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Risk Products</h3>
                <p className="text-gray-400">All pricing recommendations are positive or neutral.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
