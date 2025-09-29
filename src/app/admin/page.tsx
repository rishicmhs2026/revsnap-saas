'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AdminStats {
  totalUsers: number
  totalOrganizations: number
  activeSubscriptions: number
  totalRevenue: number
  monthlyRevenue: number
  userGrowth: number
  subscriptionGrowth: number
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error'
  api: 'healthy' | 'warning' | 'error'
  stripe: 'healthy' | 'warning' | 'error'
  uptime: number
  responseTime: number
}

interface UserActivity {
  id: string
  email: string
  lastLogin: string
  organizationCount: number
  subscriptionStatus: string
  totalProducts: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    // Check if user is admin
    if (session?.user?.email !== 'admin@revsnap.com') {
      router.push('/dashboard')
      return
    }

    loadAdminData()
  }, [status, session, router])

  const loadAdminData = async () => {
    try {
      const [statsRes, healthRes, activityRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/monitoring'),
        fetch('/api/admin/activity')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json()
        setSystemHealth(healthData)
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setUserActivity(activityData.users || [])
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage RevSnap platform and monitor system health
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={loadAdminData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'users', name: 'Users', icon: '👥' },
              { id: 'system', name: 'System Health', icon: '🔧' },
              { id: 'analytics', name: 'Analytics', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">👥</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 text-lg">🏢</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Organizations</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalOrganizations}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 text-lg">💳</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.activeSubscriptions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-600 text-lg">💰</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                      <p className="text-2xl font-semibold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Health */}
            {systemHealth && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      systemHealth.database === 'healthy' ? 'bg-green-400' :
                      systemHealth.database === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">Database</span>
                    <span className="text-sm text-gray-500 capitalize">{systemHealth.database}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      systemHealth.api === 'healthy' ? 'bg-green-400' :
                      systemHealth.api === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">API</span>
                    <span className="text-sm text-gray-500 capitalize">{systemHealth.api}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      systemHealth.stripe === 'healthy' ? 'bg-green-400' :
                      systemHealth.stripe === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">Stripe</span>
                    <span className="text-sm text-gray-500 capitalize">{systemHealth.stripe}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Uptime: {systemHealth.uptime}%</span>
                    <span>Response Time: {systemHealth.responseTime}ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">User Activity</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organizations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userActivity.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.organizationCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.subscriptionStatus === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscriptionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.totalProducts}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Monitoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">CPU Usage</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Memory Usage</span>
                      <span className="text-sm font-medium">2.1GB / 8GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Disk Usage</span>
                      <span className="text-sm font-medium">156GB / 500GB</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">API Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Requests/min</span>
                      <span className="text-sm font-medium">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Error Rate</span>
                      <span className="text-sm font-medium text-green-600">0.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Avg Response</span>
                      <span className="text-sm font-medium">145ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Analytics</h3>
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h4>
              <p className="text-gray-500">
                Detailed analytics and reporting features coming soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
