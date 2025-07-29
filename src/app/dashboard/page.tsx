'use client'

import { useState } from 'react'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  PlusIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'

interface Product {
  id: string
  name: string
  currentPrice: number
  suggestedPrice: number
  cost: number
  demand: number
  profitMargin: number
  revenue: number
  profit: number
  status: 'active' | 'inactive'
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Premium Widget',
      currentPrice: 100,
      suggestedPrice: 120,
      cost: 60,
      demand: 1000,
      profitMargin: 40,
      revenue: 100000,
      profit: 40000,
      status: 'active'
    },
    {
      id: '2',
      name: 'Standard Widget',
      currentPrice: 80,
      suggestedPrice: 95,
      cost: 50,
      demand: 1500,
      profitMargin: 42,
      revenue: 120000,
      profit: 50000,
      status: 'active'
    }
  ])

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    currentPrice: 0,
    cost: 0,
    demand: 0
  })

  const totalRevenue = products.reduce((sum, product) => sum + product.revenue, 0)
  const totalProfit = products.reduce((sum, product) => sum + product.profit, 0)
  const avgProfitMargin = products.reduce((sum, product) => sum + product.profitMargin, 0) / products.length

  const revenueData = [
    { month: 'Jan', revenue: 95000 },
    { month: 'Feb', revenue: 105000 },
    { month: 'Mar', revenue: 98000 },
    { month: 'Apr', revenue: 112000 },
    { month: 'May', revenue: 108000 },
    { month: 'Jun', revenue: 120000 }
  ]

  const profitData = [
    { month: 'Jan', profit: 38000 },
    { month: 'Feb', profit: 42000 },
    { month: 'Mar', profit: 39000 },
    { month: 'Apr', profit: 45000 },
    { month: 'May', profit: 43000 },
    { month: 'Jun', profit: 50000 }
  ]

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.currentPrice && newProduct.cost && newProduct.demand) {
      const suggestedPrice = Math.max(
        newProduct.cost * 1.5,
        newProduct.currentPrice * 1.1
      )
      const revenue = suggestedPrice * newProduct.demand
      const profit = (suggestedPrice - newProduct.cost) * newProduct.demand
      const profitMargin = ((suggestedPrice - newProduct.cost) / suggestedPrice) * 100

      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        currentPrice: newProduct.currentPrice,
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        cost: newProduct.cost,
        demand: newProduct.demand,
        profitMargin: Math.round(profitMargin * 100) / 100,
        revenue: Math.round(revenue),
        profit: Math.round(profit),
        status: 'active'
      }

      setProducts([...products, product])
      setNewProduct({ name: '', currentPrice: 0, cost: 0, demand: 0 })
      setShowAddProduct(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">ProfitPulse Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <CogIcon className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <UserCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900">${totalProfit.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avg Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">{avgProfitMargin.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <ShoppingBagIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.status === 'active').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Profit']} />
                <Area type="monotone" dataKey="profit" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Products</h3>
              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggested Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit Margin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.currentPrice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.suggestedPrice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.profitMargin}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.revenue.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.profit.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Product</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Price ($)
                    </label>
                    <input
                      type="number"
                      value={newProduct.currentPrice}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, currentPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost per Unit ($)
                    </label>
                    <input
                      type="number"
                      value={newProduct.cost}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Demand
                    </label>
                    <input
                      type="number"
                      value={newProduct.demand}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, demand: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddProduct(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddProduct}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Add Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 