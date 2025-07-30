'use client'

import { useState } from 'react'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  CalculatorIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface PricingData {
  currentPrice: number
  suggestedPrice: number
  cost: number
  demand: number
  competitorPrice: number
  profitMargin: number
  revenue: number
  profit: number
}

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function DemoPage() {
  const [pricingData, setPricingData] = useState<PricingData>({
    currentPrice: 100,
    suggestedPrice: 120,
    cost: 60,
    demand: 1000,
    competitorPrice: 110,
    profitMargin: 40,
    revenue: 100000,
    profit: 40000
  })

  const [formData, setFormData] = useState({
    productName: '',
    currentPrice: 100,
    cost: 60,
    demand: 1000,
    competitorPrice: 110,
    industry: 'retail'
  })

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Calculate new pricing data
    const newCost = field === 'cost' ? value : formData.cost
    const newDemand = field === 'demand' ? value : formData.demand
    const newCompetitorPrice = field === 'competitorPrice' ? value : formData.competitorPrice
    const newCurrentPrice = field === 'currentPrice' ? value : formData.currentPrice
    
    // Simple pricing optimization algorithm
    const suggestedPrice = Math.max(
      newCost * 1.5, // Minimum 50% markup
      newCompetitorPrice * 0.95, // 5% below competitor
      newCurrentPrice * 1.1 // 10% increase if profitable
    )
    
    const revenue = suggestedPrice * newDemand
    const profit = (suggestedPrice - newCost) * newDemand
    const profitMargin = ((suggestedPrice - newCost) / suggestedPrice) * 100

    setPricingData({
      currentPrice: newCurrentPrice,
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      cost: newCost,
      demand: newDemand,
      competitorPrice: newCompetitorPrice,
      profitMargin: Math.round(profitMargin * 100) / 100,
      revenue: Math.round(revenue),
      profit: Math.round(profit)
    })
  }

  const profitData = [
    { name: 'Current', profit: (pricingData.currentPrice - pricingData.cost) * pricingData.demand },
    { name: 'Optimized', profit: pricingData.profit }
  ]

  const marginData = [
    { name: 'Cost', value: pricingData.cost, color: '#FF6B6B' },
    { name: 'Profit', value: pricingData.suggestedPrice - pricingData.cost, color: '#4ECDC4' }
  ]

  const demandData = Array.from({ length: 12 }, (_, i) => ({
    month: `Month ${i + 1}`,
    demand: Math.round(pricingData.demand * (0.8 + Math.random() * 0.4))
  }))

  return (
    <div className="min-h-screen" style={{backgroundColor: '#111827', minHeight: '100vh'}}>
      {/* Header */}
      <div className="backdrop-blur-md shadow-sm border-b border-gray-700 sticky top-0" style={{backgroundColor: 'rgba(31, 41, 55, 0.8)'}}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.875rem', letterSpacing: '0.1em', color: 'white'}}>RevSnap Demo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Demo Mode</span>
              <button className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-all duration-200">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pricing Calculator */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <span className="text-white text-2xl mr-2">🧮</span>
                <h2 className="text-xl font-semibold text-white" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.25rem', letterSpacing: '0.1em', color: 'white'}}>Pricing Calculator</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{backgroundColor: '#374151', color: 'white'}}
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>
                    Current Price ($)
                  </label>
                  <input
                    type="number"
                    value={formData.currentPrice}
                    onChange={(e) => handleInputChange('currentPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{backgroundColor: '#374151', color: 'white'}}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>
                    Cost per Unit ($)
                  </label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{backgroundColor: '#374151', color: 'white'}}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>
                    Monthly Demand
                  </label>
                  <input
                    type="number"
                    value={formData.demand}
                    onChange={(e) => handleInputChange('demand', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{backgroundColor: '#374151', color: 'white'}}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>
                    Competitor Price ($)
                  </label>
                  <input
                    type="number"
                    value={formData.competitorPrice}
                    onChange={(e) => handleInputChange('competitorPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{backgroundColor: '#374151', color: 'white'}}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>
                    Industry
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{backgroundColor: '#374151', color: 'white'}}
                  >
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="services">Services</option>
                    <option value="technology">Technology</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
                <div className="flex items-center">
                  <span className="text-white text-2xl mr-3">💰</span>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>Suggested Price</p>
                    <p className="text-2xl font-bold text-white" style={{fontSize: '1.5rem', color: 'white'}}>${pricingData.suggestedPrice}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
                <div className="flex items-center">
                  <span className="text-white text-2xl mr-3">📈</span>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>Profit Margin</p>
                    <p className="text-2xl font-bold text-white" style={{fontSize: '1.5rem', color: 'white'}}>{pricingData.profitMargin}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
                <div className="flex items-center">
                  <span className="text-white text-2xl mr-3">📊</span>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>Monthly Revenue</p>
                    <p className="text-2xl font-bold text-white" style={{fontSize: '1.5rem', color: 'white'}}>${pricingData.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
                <div className="flex items-center">
                  <span className="text-white text-2xl mr-3">💡</span>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>Monthly Profit</p>
                    <p className="text-2xl font-bold text-white" style={{fontSize: '1.5rem', color: 'white'}}>${pricingData.profit.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profit Comparison */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.125rem', letterSpacing: '0.1em', color: 'white'}}>Profit Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Profit']} />
                    <Bar dataKey="profit" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.125rem', letterSpacing: '0.1em', color: 'white'}}>Price Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={marginData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {marginData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Demand Forecast */}
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.125rem', letterSpacing: '0.1em', color: 'white'}}>Demand Forecast</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={demandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Demand']} />
                  <Line type="monotone" dataKey="demand" stroke="#4F46E5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  </div>
                  <p className="ml-3 text-sm text-blue-800">
                    <strong>Price Increase:</strong> Consider raising your price to ${pricingData.suggestedPrice} to maximize profitability while staying competitive.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  </div>
                  <p className="ml-3 text-sm text-blue-800">
                    <strong>Market Position:</strong> Your suggested price is ${(pricingData.suggestedPrice - pricingData.competitorPrice).toFixed(2)} below competitor pricing, maintaining competitive advantage.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  </div>
                  <p className="ml-3 text-sm text-blue-800">
                    <strong>Profit Impact:</strong> This pricing strategy could increase your monthly profit by ${(pricingData.profit - (pricingData.currentPrice - pricingData.cost) * pricingData.demand).toLocaleString()}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 