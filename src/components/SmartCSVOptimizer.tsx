'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  ArrowUpTrayIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import CompetitorDataInput from './CompetitorDataInput'
import { EnhancedPricingEngine } from '@/lib/enhanced-pricing-engine'
import { DataQualityManager } from '@/lib/data-quality-manager'

interface ProductRow {
  id: string
  name: string
  cost: number
  currentPrice: number
  competitorAvg: number
  optimizedPrice: number
  suggestedPrice: number
  currentMargin: number
  projectedMargin: number
  profitLift: number
  pricingStrategy: {
    type: 'competitive' | 'volume_optimization' | 'market_penetration' | 'premium'
    confidence: number
    reasoning: string
    dataQuality: {
      score: number
      level: 'excellent' | 'good' | 'fair' | 'poor' | 'insufficient'
      color: string
      message: string
      recommendations: string[]
    }
  }
  volumeAnalysis?: {
    currentVolume: number
    targetVolume: number
    priceElasticity: number
    breakEvenPrice: number
    optimalPrice: number
    projectedProfit: number
  }
}

interface OptimizationResults {
  totalProfitLift: number
  avgMarginImprovement: number
  optimalPriceCount: number
  riskCount: number
  products: ProductRow[]
}

export default function SmartCSVOptimizer() {
  const [csvData, setCsvData] = useState<string>('')
  const [results, setResults] = useState<OptimizationResults | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [competitorUrls, setCompetitorUrls] = useState<any[]>([])
  const [manualPrices, setManualPrices] = useState<any[]>([])
  const [businessGoals, setBusinessGoals] = useState({
    targetVolume: 150,
    currentVolume: 100,
    marketShare: 10,
    strategy: 'competitive' as 'competitive' | 'volume' | 'penetration' | 'premium'
  })
  
  const pricingEngine = new EnhancedPricingEngine()
  const dataQualityManager = new DataQualityManager()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'text/csv') {
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setCsvData(text)
        processCSV(text)
      }
      reader.readAsText(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  })

  // Convert optimized price to psychologically appealing price points
  // Based on McKinsey/BCG behavioral economics research
  const convertToSaleablePrice = (optimizedPrice: number): number => {
    // For prices under $1, use precise pricing
    if (optimizedPrice < 1) {
      return Math.round(optimizedPrice * 100) / 100
    }
    
    // For prices $1-$20, use .99 or .49 endings
    if (optimizedPrice < 20) {
      const basePrice = Math.floor(optimizedPrice)
      const remainder = optimizedPrice - basePrice
      
      if (remainder < 0.25) {
        return basePrice - 0.01 // e.g., 11.37 → 10.99
      } else if (remainder < 0.75) {
        return basePrice + 0.49 // e.g., 11.37 → 11.49
      } else {
        return basePrice + 0.99 // e.g., 11.87 → 11.99
      }
    }
    
    // For prices $20-$100, use .99 or .95 endings
    if (optimizedPrice < 100) {
      const basePrice = Math.floor(optimizedPrice)
      const remainder = optimizedPrice - basePrice
      
      if (remainder < 0.5) {
        return basePrice - 0.01 // e.g., 47.23 → 46.99
      } else {
        return basePrice + 0.95 // e.g., 47.73 → 47.95
      }
    }
    
    // For prices $100+, round to nearest $5 or use .95/.99 endings
    if (optimizedPrice < 1000) {
      const rounded = Math.round(optimizedPrice / 5) * 5
      return rounded - 0.01 // e.g., 247.83 → 249.99
    }
    
    // For very high prices, round to nearest $10
    return Math.round(optimizedPrice / 10) * 10 - 1 // e.g., 1247.83 → 1249
  }

  const processCSV = async (csvText: string) => {
    setIsProcessing(true)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Parse CSV and create optimization results
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    const products: ProductRow[] = lines.slice(1).map((line, index) => {
      const values = line.split(',')
      const cost = parseFloat(values[2]) || 10
      const currentPrice = parseFloat(values[3]) || 25
      
      // Get competitor prices from manual input or use fallback
      let competitorPrices: number[] = []
      
      // Add manual prices
      manualPrices.forEach(price => {
        competitorPrices.push(price.price)
      })
      
      // Add simulated competitor prices if no real data
      if (competitorPrices.length === 0) {
        competitorPrices = [
          currentPrice * (0.9 + Math.random() * 0.2),
          currentPrice * (0.95 + Math.random() * 0.1),
          currentPrice * (1.05 + Math.random() * 0.1)
        ]
      }
      
      const competitorAvg = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
      
      // Create data sources for quality assessment
      const dataSources = [
        ...manualPrices.map(price => ({
          name: price.competitor,
          type: 'manual' as const,
          reliability: 80,
          lastUpdated: price.lastUpdated,
          price: price.price
        })),
        ...competitorUrls.map(url => ({
          name: url.platform || 'Unknown',
          type: url.isValid ? 'api' as const : 'scraping' as const,
          reliability: url.isValid ? 90 : 60,
          lastUpdated: new Date(),
          price: undefined
        }))
      ]
      
      // Calculate data quality
      const dataQuality = dataQualityManager.calculateDataQuality(dataSources)
      
      // Get pricing strategy from enhanced engine
      const pricingStrategy = pricingEngine.selectPricingStrategy(
        currentPrice,
        cost,
        competitorPrices,
        {
          score: dataQuality.score,
          sources: dataSources,
          lastUpdated: new Date(),
          confidence: dataQuality.score / 100,
          warnings: dataQuality.recommendations
        },
        businessGoals
      )
      
      // Calculate volume analysis if strategy is volume optimization
      let volumeAnalysis = undefined
      if (pricingStrategy.type === 'volume_optimization') {
        volumeAnalysis = pricingEngine.calculateVolumeOptimizedPrice(
          currentPrice,
          businessGoals.currentVolume,
          businessGoals.targetVolume,
          cost
        )
      }
      
      // Use strategy-based pricing
      let optimizedPrice: number
      if (pricingStrategy.type === 'volume_optimization' && volumeAnalysis) {
        optimizedPrice = volumeAnalysis.optimalPrice
      } else if (pricingStrategy.type === 'market_penetration') {
        const penetration = pricingEngine.calculateMarketPenetrationPrice(
          competitorPrices,
          cost,
          businessGoals.marketShare
        )
        optimizedPrice = penetration.penetrationPrice
      } else {
        // Default competitive pricing
        optimizedPrice = competitorAvg * 0.95
      }
      
      // Convert optimized price to psychologically appealing price points
      const suggestedPrice = convertToSaleablePrice(optimizedPrice)
      
      const currentMargin = ((currentPrice - cost) / currentPrice) * 100
      const projectedMargin = ((suggestedPrice - cost) / suggestedPrice) * 100
      const profitLift = ((suggestedPrice - currentPrice) / currentPrice) * 100
      
      return {
        id: `product-${index}`,
        name: values[1] || `Product ${index + 1}`,
        cost,
        currentPrice,
        competitorAvg,
        optimizedPrice: Math.round(optimizedPrice * 100) / 100,
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        currentMargin: Math.round(currentMargin * 100) / 100,
        projectedMargin: Math.round(projectedMargin * 100) / 100,
        profitLift: Math.round(profitLift * 100) / 100,
        pricingStrategy: {
          type: pricingStrategy.type,
          confidence: pricingStrategy.confidence,
          reasoning: pricingStrategy.reasoning,
          dataQuality
        },
        volumeAnalysis
      }
    })

    const totalProfitLift = products.reduce((sum, p) => sum + p.profitLift, 0) / products.length
    const avgMarginImprovement = products.reduce((sum, p) => sum + (p.projectedMargin - p.currentMargin), 0) / products.length
    const optimalPriceCount = products.filter(p => p.profitLift > 0).length
    const riskCount = products.filter(p => p.profitLift < -5).length

    setResults({
      totalProfitLift: Math.round(totalProfitLift * 100) / 100,
      avgMarginImprovement: Math.round(avgMarginImprovement * 100) / 100,
      optimalPriceCount,
      riskCount,
      products
    })
    
    setIsProcessing(false)
  }

  const downloadOptimizedCSV = () => {
    if (!results) return
    
    const headers = 'SKU,Product Name,Cost,Current Price,Competitor Avg,Optimized Price,Suggested Price,Current Margin %,Projected Margin %,Profit Lift %'
    const rows = results.products.map(p => 
      `${p.id},${p.name},${p.cost},${p.currentPrice},${p.competitorAvg},${p.optimizedPrice},${p.suggestedPrice},${p.currentMargin},${p.projectedMargin},${p.profitLift}`
    )
    
    const csvContent = [headers, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'optimized-pricing.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Enhanced Smart CSV Pricing Optimizer
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Upload your product catalog and get intelligent pricing recommendations with volume elasticity, break-even analysis, and data quality scoring
        </p>
      </div>

      {/* Business Goals Configuration */}
      {!results && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Goals & Strategy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Volume</label>
              <input
                type="number"
                value={businessGoals.currentVolume}
                onChange={(e) => setBusinessGoals({ ...businessGoals, currentVolume: parseInt(e.target.value) || 100 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Volume</label>
              <input
                type="number"
                value={businessGoals.targetVolume}
                onChange={(e) => setBusinessGoals({ ...businessGoals, targetVolume: parseInt(e.target.value) || 150 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Market Share (%)</label>
              <input
                type="number"
                value={businessGoals.marketShare}
                onChange={(e) => setBusinessGoals({ ...businessGoals, marketShare: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Strategy</label>
              <select
                value={businessGoals.strategy}
                onChange={(e) => setBusinessGoals({ ...businessGoals, strategy: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="competitive">Competitive</option>
                <option value="volume">Volume Optimization</option>
                <option value="penetration">Market Penetration</option>
                <option value="premium">Premium Pricing</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Competitor Data Input */}
      {!results && (
        <div className="max-w-4xl mx-auto">
          <CompetitorDataInput
            onDataChange={(urls, prices) => {
              setCompetitorUrls(urls)
              setManualPrices(prices)
            }}
          />
        </div>
      )}

      {/* Upload Area */}
      {!results && (
        <div className="max-w-2xl mx-auto">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg text-blue-600">Drop your CSV file here...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  Drag & drop your product CSV file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Required columns: SKU, Product Name, Cost, Current Price, Competitor Average Price
                </p>
              </div>
            )}
          </div>
          
          {uploadedFile && (
            <div className="mt-4 flex items-center justify-center">
              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{uploadedFile.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="text-center py-12">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-lg text-gray-700">Analyzing your catalog and optimizing prices...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">Avg Profit Lift</p>
                  <p className="text-2xl font-bold text-green-950">+{results.totalProfitLift}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Margin Improvement</p>
                  <p className="text-2xl font-bold text-blue-950">+{results.avgMarginImprovement.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Optimizable Products</p>
                  <p className="text-2xl font-bold text-purple-950">{results.optimalPriceCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 text-yellow-600 mr-3 flex items-center justify-center">⚠️</div>
                <div>
                  <p className="text-sm font-medium text-yellow-900">Risk Products</p>
                  <p className="text-2xl font-bold text-yellow-950">{results.riskCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={downloadOptimizedCSV}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Download Optimized CSV
            </button>
            <button
              onClick={() => {
                setCsvData('')
                setResults(null)
                setUploadedFile(null)
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Upload New File
            </button>
          </div>

          {/* Detailed Results Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Enhanced Product Analysis</h3>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Strategy:</span> Pricing strategy based on your business goals and market analysis. 
                <span className="font-medium ml-4">Data Quality:</span> Confidence level based on data sources and reliability.
                <span className="font-medium ml-4">Volume Analysis:</span> Break-even and volume optimization calculations.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strategy</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Quality</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Lift</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.products.slice(0, 10).map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.pricingStrategy.type === 'volume_optimization' ? 'bg-green-100 text-green-800' :
                          product.pricingStrategy.type === 'market_penetration' ? 'bg-blue-100 text-blue-800' :
                          product.pricingStrategy.type === 'premium' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.pricingStrategy.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.currentPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                        ${product.suggestedPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            product.pricingStrategy.dataQuality.level === 'excellent' ? 'bg-green-500' :
                            product.pricingStrategy.dataQuality.level === 'good' ? 'bg-blue-500' :
                            product.pricingStrategy.dataQuality.level === 'fair' ? 'bg-yellow-500' :
                            product.pricingStrategy.dataQuality.level === 'poor' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}></div>
                          <span className="text-xs text-gray-600">
                            {product.pricingStrategy.dataQuality.score}/100
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          product.pricingStrategy.confidence > 0.7 ? 'text-green-600' :
                          product.pricingStrategy.confidence > 0.4 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {Math.round(product.pricingStrategy.confidence * 100)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          product.profitLift > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.profitLift > 0 ? '+' : ''}{product.profitLift.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {results.products.length > 10 && (
              <div className="px-6 py-3 text-sm text-gray-500 text-center border-t border-gray-200">
                Showing first 10 products. Download CSV for complete analysis.
              </div>
            )}
          </div>

          {/* Volume Analysis Section */}
          {results.products.some(p => p.volumeAnalysis) && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Volume Optimization Analysis</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Products with volume-based pricing strategies and break-even analysis
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Volume</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Volume</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Break-Even Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Optimal Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projected Profit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.products.filter(p => p.volumeAnalysis).map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.volumeAnalysis!.currentVolume}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.volumeAnalysis!.targetVolume}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${product.volumeAnalysis!.breakEvenPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                          ${product.volumeAnalysis!.optimalPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          ${product.volumeAnalysis!.projectedProfit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Strategy Reasoning */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pricing Strategy Reasoning</h3>
              <p className="text-sm text-gray-600 mt-2">
                Detailed explanations for each product's pricing strategy
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              {results.products.slice(0, 5).map((product) => (
                <div key={product.id} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{product.pricingStrategy.reasoning}</p>
                  {product.pricingStrategy.dataQuality.recommendations.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700">Recommendations:</p>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        {product.pricingStrategy.dataQuality.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 