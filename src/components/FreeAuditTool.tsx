'use client'

import { useState } from 'react'
import { 
  MagnifyingGlassIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface AuditResults {
  overallScore: number
  pricingHealth: 'excellent' | 'good' | 'needs-attention' | 'critical'
  estimatedMissedRevenue: number
  competitiveGaps: number
  optimizationOpportunities: number
  insights: {
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    type: 'opportunity' | 'risk' | 'insight'
  }[]
  recommendations: {
    action: string
    potentialLift: number
    difficulty: 'easy' | 'medium' | 'hard'
  }[]
}

export default function FreeAuditTool() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    shopifyStore: '',
    email: '',
    productCount: '',
    averagePrice: '',
    monthlyRevenue: '',
    mainCategory: ''
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AuditResults | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const runAudit = async () => {
    setIsAnalyzing(true)
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate realistic audit results
    const productCount = parseInt(formData.productCount) || 25
    const avgPrice = parseFloat(formData.averagePrice) || 50
    const monthlyRevenue = parseFloat(formData.monthlyRevenue) || 25000
    
    const missedRevenue = monthlyRevenue * (0.15 + Math.random() * 0.25) // 15-40% potential
    const score = 65 + Math.random() * 25 // 65-90 score
    
    const auditResults: AuditResults = {
      overallScore: Math.round(score),
      pricingHealth: score > 85 ? 'excellent' : score > 75 ? 'good' : score > 60 ? 'needs-attention' : 'critical',
      estimatedMissedRevenue: Math.round(missedRevenue),
      competitiveGaps: Math.floor(productCount * (0.3 + Math.random() * 0.4)),
      optimizationOpportunities: Math.floor(productCount * (0.2 + Math.random() * 0.5)),
      insights: [
        {
          title: "Price positioning below market average",
          description: `${Math.floor(productCount * 0.6)} products are priced 8-15% below competitors, missing potential revenue`,
          impact: 'high',
          type: 'opportunity'
        },
        {
          title: "Seasonal pricing opportunities",
          description: "Holiday season approaching - historical data shows 12-18% price elasticity for your category",
          impact: 'high',
          type: 'insight'
        },
        {
          title: "Competitor price movements detected",
          description: "3 main competitors raised prices 5-8% in the last 30 days",
          impact: 'medium',
          type: 'opportunity'
        },
        {
          title: "Bundle pricing optimization",
          description: "Cross-sell analysis reveals $2,400 monthly opportunity in product bundling",
          impact: 'medium',
          type: 'opportunity'
        },
        {
          title: "Price sensitivity risk",
          description: `${Math.floor(productCount * 0.2)} products showing high price sensitivity in your niche`,
          impact: 'medium',
          type: 'risk'
        }
      ],
      recommendations: [
        { action: "Implement dynamic pricing for top 10 products", potentialLift: 18, difficulty: 'easy' },
        { action: "Optimize bundle pricing strategy", potentialLift: 12, difficulty: 'medium' },
        { action: "Adjust pricing for seasonal demand", potentialLift: 15, difficulty: 'easy' },
        { action: "Monitor competitor price changes daily", potentialLift: 8, difficulty: 'easy' }
      ]
    }
    
    setResults(auditResults)
    setIsAnalyzing(false)
    setStep(4)
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'needs-attention': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'medium': return <ChartBarIcon className="h-5 w-5 text-yellow-500" />
      case 'low': return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      default: return null
    }
  }

  if (isAnalyzing) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Store</h3>
          <p className="text-gray-600">Our AI is examining your pricing strategy...</p>
        </div>
        
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
            Scanning product catalog structure
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
            Analyzing competitor pricing patterns
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
            Calculating optimization opportunities
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
            Generating personalized recommendations
          </div>
        </div>
      </div>
    )
  }

  if (results) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Score */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your Free Pricing Audit Results
          </h2>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">{results.overallScore}/100</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(results.pricingHealth)}`}>
                {results.pricingHealth.replace('-', ' ').toUpperCase()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${results.estimatedMissedRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Estimated monthly opportunity</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <CurrencyDollarIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <div className="text-2xl font-bold text-gray-900">{results.competitiveGaps}</div>
            <div className="text-sm text-gray-600">Competitive gaps found</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <ChartBarIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <div className="text-2xl font-bold text-gray-900">{results.optimizationOpportunities}</div>
            <div className="text-sm text-gray-600">Optimization opportunities</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <ShoppingBagIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((results.estimatedMissedRevenue / parseFloat(formData.monthlyRevenue || '25000')) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Potential revenue lift</div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Key Insights</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {results.insights.slice(0, 4).map((insight, index) => (
              <div key={index} className="p-6 flex items-start space-x-4">
                {getImpactIcon(insight.impact)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  insight.type === 'opportunity' ? 'bg-green-100 text-green-800' :
                  insight.type === 'risk' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {insight.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Wins */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Quick Win Recommendations</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {results.recommendations.map((rec, index) => (
              <div key={index} className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{rec.action}</h4>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-green-600 font-medium">+{rec.potentialLift}% potential lift</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      rec.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {rec.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Unlock This Revenue?</h3>
          <p className="text-lg mb-6 opacity-90">
            Get the complete analysis and start optimizing your pricing today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Free Shopify Store Pricing Audit
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Get a personalized analysis of your pricing strategy in under 3 minutes
        </p>
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span>Free analysis</span>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span>Instant results</span>
          </div>
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-white rounded-xl shadow-lg border p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Step 1: Store Information</h2>
              <p className="text-gray-600">Tell us about your Shopify store</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shopify Store URL
                </label>
                <input
                  type="url"
                  placeholder="https://yourstore.shopify.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.shopifyStore}
                  onChange={(e) => handleInputChange('shopifyStore', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Category
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.mainCategory}
                  onChange={(e) => handleInputChange('mainCategory', e.target.value)}
                >
                  <option value="">Select your main category</option>
                  <option value="electronics">Electronics & Gadgets</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="home">Home & Garden</option>
                  <option value="beauty">Beauty & Personal Care</option>
                  <option value="fitness">Fitness & Sports</option>
                  <option value="toys">Toys & Games</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Step 2: Product Details</h2>
              <p className="text-gray-600">Help us understand your catalog</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Products (SKUs)
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.productCount}
                  onChange={(e) => handleInputChange('productCount', e.target.value)}
                >
                  <option value="">Select range</option>
                  <option value="10">10-25 SKUs</option>
                  <option value="35">25-50 SKUs</option>
                  <option value="75">50-100 SKUs</option>
                  <option value="150">100+ SKUs</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Product Price
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.averagePrice}
                  onChange={(e) => handleInputChange('averagePrice', e.target.value)}
                >
                  <option value="">Select range</option>
                  <option value="25">$10-$50</option>
                  <option value="75">$50-$100</option>
                  <option value="150">$100-$200</option>
                  <option value="300">$200+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Revenue
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.monthlyRevenue}
                  onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
                >
                  <option value="">Select range</option>
                  <option value="15000">$10K-$25K</option>
                  <option value="40000">$25K-$50K</option>
                  <option value="75000">$50K-$100K</option>
                  <option value="150000">$100K+</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Ready to Analyze!</h2>
              <p className="text-gray-600 mb-6">
                We&apos;ll analyze your store&apos;s pricing strategy and identify opportunities for revenue optimization
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What you&apos;ll get:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-sm">Competitive pricing analysis</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-sm">Revenue optimization opportunities</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-sm">Margin improvement recommendations</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-sm">Actionable next steps</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={runAudit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center"
            >
              <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
              Run Free Audit
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              step === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            disabled={step === 1}
          >
            Previous
          </button>
          
          {step < 3 && (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              disabled={
                (step === 1 && (!formData.shopifyStore || !formData.email || !formData.mainCategory)) ||
                (step === 2 && (!formData.productCount || !formData.averagePrice || !formData.monthlyRevenue))
              }
            >
              Next
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 