'use client'

import { useState } from 'react'
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface CompetitorUrl {
  id: string
  url: string
  platform?: string
  isValid?: boolean
  productId?: string
}

interface ManualPrice {
  id: string
  competitor: string
  price: number
  currency: string
  lastUpdated: Date
}

interface DataQualityIndicator {
  score: number
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'insufficient'
  color: string
  message: string
  recommendations: string[]
}

interface CompetitorDataInputProps {
  onDataChange: (urls: CompetitorUrl[], manualPrices: ManualPrice[]) => void
  initialUrls?: CompetitorUrl[]
  initialManualPrices?: ManualPrice[]
}

export default function CompetitorDataInput({ 
  onDataChange, 
  initialUrls = [], 
  initialManualPrices = [] 
}: CompetitorDataInputProps) {
  const [competitorUrls, setCompetitorUrls] = useState<CompetitorUrl[]>(initialUrls)
  const [manualPrices, setManualPrices] = useState<ManualPrice[]>(initialManualPrices)
  const [newUrl, setNewUrl] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [newManualPrice, setNewManualPrice] = useState({
    competitor: '',
    price: '',
    currency: 'USD'
  })

  // Validate URL and extract platform info
  const validateUrl = (url: string) => {
    if (!url) return { isValid: false }
    
    const platforms = [
      { name: 'Amazon', pattern: /amazon\.com\/dp\/([A-Z0-9]{10})/, id: 'ASIN' },
      { name: 'Walmart', pattern: /walmart\.com\/ip\/[^/]+\/(\d+)/, id: 'Item ID' },
      { name: 'Target', pattern: /target\.com\/p\/[^/]+\/-\/(\d+)/, id: 'TCIN' },
      { name: 'Best Buy', pattern: /bestbuy\.com\/site\/[^/]+\/(\d+)\.p/, id: 'SKU' },
      { name: 'eBay', pattern: /ebay\.com\/itm\/(\d+)/, id: 'Item ID' }
    ]

    for (const platform of platforms) {
      const match = url.match(platform.pattern)
      if (match) {
        return {
          isValid: true,
          platform: platform.name,
          productId: match[1],
          idType: platform.id
        }
      }
    }

    return { isValid: false }
  }

  // Add competitor URL
  const addCompetitorUrl = () => {
    if (!newUrl.trim()) return

    const validation = validateUrl(newUrl)
    const newCompetitorUrl: CompetitorUrl = {
      id: Date.now().toString(),
      url: newUrl.trim(),
      platform: validation.platform,
      isValid: validation.isValid,
      productId: validation.productId
    }

    const updatedUrls = [...competitorUrls, newCompetitorUrl]
    setCompetitorUrls(updatedUrls)
    setNewUrl('')
    onDataChange(updatedUrls, manualPrices)
  }

  // Remove competitor URL
  const removeCompetitorUrl = (id: string) => {
    const updatedUrls = competitorUrls.filter(url => url.id !== id)
    setCompetitorUrls(updatedUrls)
    onDataChange(updatedUrls, manualPrices)
  }

  // Add manual price
  const addManualPrice = () => {
    if (!newManualPrice.competitor || !newManualPrice.price) return

    const newPrice: ManualPrice = {
      id: Date.now().toString(),
      competitor: newManualPrice.competitor.trim(),
      price: parseFloat(newManualPrice.price),
      currency: newManualPrice.currency,
      lastUpdated: new Date()
    }

    const updatedPrices = [...manualPrices, newPrice]
    setManualPrices(updatedPrices)
    setNewManualPrice({ competitor: '', price: '', currency: 'USD' })
    onDataChange(competitorUrls, updatedPrices)
  }

  // Remove manual price
  const removeManualPrice = (id: string) => {
    const updatedPrices = manualPrices.filter(price => price.id !== id)
    setManualPrices(updatedPrices)
    onDataChange(competitorUrls, updatedPrices)
  }

  // Calculate data quality
  const calculateDataQuality = (): DataQualityIndicator => {
    const totalSources = competitorUrls.length + manualPrices.length
    let score = 0

    if (totalSources === 0) {
      return {
        score: 0,
        level: 'insufficient',
        color: 'red',
        message: 'No data sources available',
        recommendations: [
          'Provide competitor product URLs for automated data collection',
          'Manually enter competitor prices as a fallback'
        ]
      }
    }

    // Score based on URL sources (higher weight for valid URLs)
    competitorUrls.forEach(url => {
      if (url.isValid) {
        score += url.platform === 'Amazon' || url.platform === 'Walmart' ? 25 : 15
      } else {
        score += 5
      }
    })

    // Score based on manual prices
    manualPrices.forEach(() => {
      score += 10
    })

    // Cap at 100
    score = Math.min(score, 100)

    let level: DataQualityIndicator['level']
    let color: string
    let message: string
    let recommendations: string[] = []

    if (score >= 80) {
      level = 'excellent'
      color = 'green'
      message = 'High-quality data from reliable sources'
    } else if (score >= 60) {
      level = 'good'
      color = 'blue'
      message = 'Good data quality with minor improvements possible'
      recommendations.push('Consider adding more data sources for better accuracy')
    } else if (score >= 40) {
      level = 'fair'
      color = 'yellow'
      message = 'Fair data quality - results may have some uncertainty'
      recommendations.push('Add more reliable data sources')
    } else if (score >= 20) {
      level = 'poor'
      color = 'orange'
      message = 'Poor data quality - results should be used with caution'
      recommendations.push('Provide competitor URLs for automated collection', 'Manually verify key competitor prices')
    } else {
      level = 'insufficient'
      color = 'red'
      message = 'Insufficient data quality - cannot provide reliable recommendations'
      recommendations.push('Provide competitor product URLs', 'Manually enter competitor prices')
    }

    return { score, level, color, message, recommendations }
  }

  const dataQuality = calculateDataQuality()

  return (
    <div className="space-y-6">
      {/* Data Quality Indicator */}
      <div className={`p-4 rounded-lg border-2 border-${dataQuality.color}-200 bg-${dataQuality.color}-50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {dataQuality.level === 'excellent' || dataQuality.level === 'good' ? (
              <CheckCircleIcon className={`h-6 w-6 text-${dataQuality.color}-600`} />
            ) : (
              <ExclamationTriangleIcon className={`h-6 w-6 text-${dataQuality.color}-600`} />
            )}
            <div>
              <h3 className={`font-semibold text-${dataQuality.color}-800`}>
                Data Quality: {dataQuality.score}/100 ({dataQuality.level})
              </h3>
              <p className={`text-sm text-${dataQuality.color}-700`}>{dataQuality.message}</p>
            </div>
          </div>
        </div>
        
        {dataQuality.recommendations.length > 0 && (
          <div className="mt-3">
            <p className={`text-sm font-medium text-${dataQuality.color}-800 mb-2`}>Recommendations:</p>
            <ul className={`text-sm text-${dataQuality.color}-700 space-y-1`}>
              {dataQuality.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Competitor URLs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Competitor Product URLs</h3>
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showManualInput ? 'Hide' : 'Show'} Manual Input
          </button>
        </div>

        {/* URL Input */}
        <div className="flex space-x-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Paste competitor product URL (Amazon, Walmart, Target, etc.)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addCompetitorUrl()}
          />
          <button
            onClick={addCompetitorUrl}
            disabled={!newUrl.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {/* URL List */}
        {competitorUrls.length > 0 && (
          <div className="space-y-2">
            {competitorUrls.map((url) => (
              <div key={url.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">{url.platform || 'Unknown Platform'}</span>
                    {url.isValid ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 break-all">{url.url}</p>
                  {url.productId && (
                    <p className="text-xs text-gray-500 mt-1">Product ID: {url.productId}</p>
                  )}
                </div>
                <button
                  onClick={() => removeCompetitorUrl(url.id)}
                  className="ml-2 p-1 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Platform Guidance */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Supported Platforms</h4>
              <div className="mt-2 text-sm text-blue-800 space-y-1">
                <p><strong>Amazon:</strong> Copy the product URL from the product page</p>
                <p><strong>Walmart:</strong> Copy the product URL from the product page</p>
                <p><strong>Target:</strong> Copy the product URL from the product page</p>
                <p><strong>Best Buy:</strong> Copy the product URL from the product page</p>
                <p><strong>eBay:</strong> Copy the listing URL (prices may vary significantly)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Price Input */}
      {showManualInput && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Manual Price Entry</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              value={newManualPrice.competitor}
              onChange={(e) => setNewManualPrice({ ...newManualPrice, competitor: e.target.value })}
              placeholder="Competitor name"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={newManualPrice.price}
              onChange={(e) => setNewManualPrice({ ...newManualPrice, price: e.target.value })}
              placeholder="Price"
              step="0.01"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newManualPrice.currency}
              onChange={(e) => setNewManualPrice({ ...newManualPrice, currency: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
            <button
              onClick={addManualPrice}
              disabled={!newManualPrice.competitor || !newManualPrice.price}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Manual Prices List */}
          {manualPrices.length > 0 && (
            <div className="space-y-2">
              {manualPrices.map((price) => (
                <div key={price.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{price.competitor}</span>
                    <span className="ml-2 text-sm text-gray-600">
                      {price.currency} {price.price.toFixed(2)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      (Updated: {price.lastUpdated.toLocaleDateString()})
                    </span>
                  </div>
                  <button
                    onClick={() => removeManualPrice(price.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
