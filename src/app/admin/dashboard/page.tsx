'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  UsersIcon, 
  CreditCardIcon, 
  ChartBarIcon, 
  CogIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface AdminStats {
  totalUsers: number
  totalOrganizations: number
  totalSubscriptions: number
  activeSubscriptions: number
  totalRevenue: number
  monthlyRevenue: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
  user: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/admin/login')
      return
    }

    // Verify admin access
    verifyAdminAccess()
    loadAdminData()
  }, [session, status, router])

  const verifyAdminAccess = async () => {
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session?.user?.email }),
      })

      if (!response.ok) {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Admin verification failed:', error)
      router.push('/admin/login')
    }
  }

  const loadAdminData = async () => {
    setIsLoading(true)
    try {
      // Load admin stats
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data)
      }

      // Load recent activity
      const activityResponse = await fetch('/api/admin/activity')
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData.data)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Back to App
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CogIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Organizations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrganizations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CreditCardIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UsersIcon className="h-6 w-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-600">View and manage user accounts</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/subscriptions')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CreditCardIcon className="h-6 w-6 text-green-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Subscriptions</p>
                  <p className="text-sm text-gray-600">Manage billing and subscriptions</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/analytics')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChartBarIcon className="h-6 w-6 text-purple-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-sm text-gray-600">View detailed analytics</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {activity.type === 'subscription' && (
                          <CreditCardIcon className="h-5 w-5 text-green-600" />
                        )}
                        {activity.type === 'user' && (
                          <UsersIcon className="h-5 w-5 text-blue-600" />
                        )}
                        {activity.type === 'error' && (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-600">by {activity.user}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 