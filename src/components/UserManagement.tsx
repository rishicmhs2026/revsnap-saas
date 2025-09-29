'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface UserSession {
  id: string
  sessionToken: string
  expires: string
  userAgent?: string
  ipAddress?: string
}

interface UserStats {
  totalOrganizations: number
  totalProducts: number
  activeSessions: number
  lastLogin: string
  planType: string
  accountAge?: number
  isAdmin?: boolean
  // Professional+ features
  activeTrackingJobs?: number
  alertsThisMonth?: number
  apiKeysGenerated?: number
  dataExportsThisMonth?: number
  // Enterprise features
  totalRevenueSaved?: number
  competitorDataPoints?: number
  automationRunsThisMonth?: number
  teamMembersCount?: number
  averageResponseTime?: number
  systemUptime?: number
  dataAccuracy?: number
  planLimits?: any
  upgradeRecommendations?: any[]
}

export default function UserManagement() {
  const { data: session } = useSession()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      loadUserData()
    }
  }, [session])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      
      // Load user sessions
      const sessionsResponse = await fetch('/api/auth/sessions')
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData.data)
      }

      // Load real user stats from API
      const statsResponse = await fetch('/api/user/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setUserStats(statsData.data)
      } else {
        // Fallback to basic stats if API fails
        setUserStats({
          totalOrganizations: 0,
          totalProducts: 0,
          activeSessions: sessions.length,
          lastLogin: new Date().toISOString(),
          planType: 'free'
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      if (response.ok) {
        // Remove the session from the list
        setSessions(prev => prev.filter(s => s.id !== sessionId))
      }
    } catch (error) {
      console.error('Error revoking session:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isCurrentSession = (sessionToken: string) => {
    // This is a simplified check - in a real app you'd compare with the current session
    return sessionToken === session?.user?.id
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-800 rounded-lg"></div>
        <div className="h-64 bg-gray-800 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Account Management</h2>
        {userStats?.isAdmin && (
          <span className="bg-yellow-600 text-black px-3 py-1 rounded-full text-sm font-medium">
            Admin
          </span>
        )}
      </div>

      {/* User Stats */}
      {userStats && (
        <>
          {/* Basic Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Organizations</h3>
              <div className="text-2xl font-bold text-white">{userStats.totalOrganizations}</div>
              {userStats.planLimits && (
                <div className="text-xs text-gray-500 mt-1">
                  Limit: {userStats.planLimits.maxOrganizations}
                </div>
              )}
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Products</h3>
              <div className="text-2xl font-bold text-white">{userStats.totalProducts}</div>
              {userStats.planLimits && (
                <div className="text-xs text-gray-500 mt-1">
                  Limit: {userStats.planLimits.maxProducts}
                </div>
              )}
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Active Sessions</h3>
              <div className="text-2xl font-bold text-white">{userStats.activeSessions}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Plan Type</h3>
              <div className="text-lg font-bold text-blue-400 capitalize">{userStats.planType}</div>
              {userStats.accountAge && (
                <div className="text-xs text-gray-500 mt-1">
                  {userStats.accountAge} days old
                </div>
              )}
            </div>
          </div>

          {/* Professional+ Features */}
          {(userStats.planType === 'professional' || userStats.planType === 'enterprise') && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Professional Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-700/50">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Active Tracking Jobs</h4>
                  <div className="text-2xl font-bold text-white">{userStats.activeTrackingJobs || 0}</div>
                </div>
                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-6 border border-green-700/50">
                  <h4 className="text-sm font-medium text-green-300 mb-2">Alerts This Month</h4>
                  <div className="text-2xl font-bold text-white">{userStats.alertsThisMonth || 0}</div>
                </div>
                <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg p-6 border border-orange-700/50">
                  <h4 className="text-sm font-medium text-orange-300 mb-2">API Keys</h4>
                  <div className="text-2xl font-bold text-white">{userStats.apiKeysGenerated || 0}</div>
                </div>
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-purple-700/50">
                  <h4 className="text-sm font-medium text-purple-300 mb-2">Data Exports</h4>
                  <div className="text-2xl font-bold text-white">{userStats.dataExportsThisMonth || 0}</div>
                  {userStats.planLimits && (
                    <div className="text-xs text-purple-400 mt-1">
                      / {userStats.planLimits.dataExportsPerMonth} limit
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Enterprise Features */}
                {userStats?.planType === 'enterprise' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Enterprise Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-6 border border-yellow-700/50">
                  <h4 className="text-sm font-medium text-yellow-300 mb-2">Revenue Saved</h4>
                  <div className="text-2xl font-bold text-white">
                    ${(userStats.totalRevenueSaved || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-yellow-400 mt-1">Last 90 days</div>
                </div>
                <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-6 border border-cyan-700/50">
                  <h4 className="text-sm font-medium text-cyan-300 mb-2">Data Points</h4>
                  <div className="text-2xl font-bold text-white">
                    {(userStats.competitorDataPoints || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-cyan-400 mt-1">This month</div>
                </div>
                <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-6 border border-indigo-700/50">
                  <h4 className="text-sm font-medium text-indigo-300 mb-2">Team Members</h4>
                  <div className="text-2xl font-bold text-white">{userStats.teamMembersCount || 0}</div>
                  <div className="text-xs text-indigo-400 mt-1">
                    / {userStats.planLimits?.teamMembers || '∞'} limit
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-lg p-6 border border-emerald-700/50">
                  <h4 className="text-sm font-medium text-emerald-300 mb-2">Response Time</h4>
                  <div className="text-2xl font-bold text-white">{userStats.averageResponseTime || 0}ms</div>
                  <div className="text-xs text-emerald-400 mt-1">Average</div>
                </div>
                <div className="bg-gradient-to-r from-rose-900/30 to-pink-900/30 rounded-lg p-6 border border-rose-700/50">
                  <h4 className="text-sm font-medium text-rose-300 mb-2">System Uptime</h4>
                  <div className="text-2xl font-bold text-white">{userStats.systemUptime || 99.9}%</div>
                  <div className="text-xs text-rose-400 mt-1">Last 30 days</div>
                </div>
                <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-lg p-6 border border-violet-700/50">
                  <h4 className="text-sm font-medium text-violet-300 mb-2">Data Accuracy</h4>
                  <div className="text-2xl font-bold text-white">{userStats.dataAccuracy || 95}%</div>
                  <div className="text-xs text-violet-400 mt-1">Validated data</div>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade Recommendations */}
          {userStats.upgradeRecommendations && userStats.upgradeRecommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
              <div className="space-y-4">
                {userStats.upgradeRecommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      rec.urgency === 'high' ? 'bg-red-900/20 border-red-700/50' :
                      rec.urgency === 'medium' ? 'bg-yellow-900/20 border-yellow-700/50' :
                      'bg-blue-900/20 border-blue-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-white mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-300 mb-3">{rec.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rec.urgency === 'high' ? 'bg-red-600 text-white' :
                        rec.urgency === 'medium' ? 'bg-yellow-600 text-black' :
                        'bg-blue-600 text-white'
                      }`}>
                        {rec.urgency}
                      </span>
                    </div>
                    <Link 
                      href="/pricing"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      {rec.action}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Active Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Active Sessions</h3>
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h4 className="text-sm font-medium text-gray-300">Manage your active sessions</h4>
          </div>
          <div className="divide-y divide-gray-700">
            {sessions.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400">
                No active sessions found
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {isCurrentSession(session.sessionToken) ? (
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        ) : (
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-white">
                          {session.userAgent || 'Unknown Device'}
                          {isCurrentSession(session.sessionToken) && (
                            <span className="ml-2 text-xs text-green-400">(Current)</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          Expires: {formatDate(session.expires)}
                        </div>
                        {session.ipAddress && (
                          <div className="text-xs text-gray-500">
                            IP: {session.ipAddress}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {!isCurrentSession(session.sessionToken) && (
                      <button
                        onClick={() => revokeSession(session.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Export Data Section - Premium Feature */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Data Export</h3>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          {userStats?.planType === 'free' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Export Your Data</h4>
              <p className="text-gray-400 mb-6">
                Export your products, competitor data, and analytics in multiple formats (CSV, JSON, Excel)
              </p>
              <Link 
                href="/pricing"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Upgrade to Export Data
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-gray-300 mb-4">
                Export your data in various formats. You have {userStats?.planLimits?.dataExportsPerMonth - (userStats?.dataExportsThisMonth || 0)} exports remaining this month.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Export Products (CSV)
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Export Analytics (JSON)
                </button>
                {userStats?.planType === 'enterprise' && (
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Full Backup (Excel)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}