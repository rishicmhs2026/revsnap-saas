'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  LockClosedIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface KPI {
  name: string
  value: number
  change: number
  unit: string
  trend: 'up' | 'down' | 'stable'
}

interface SecurityMetric {
  category: string
  score: number
  status: 'excellent' | 'good' | 'needs-attention' | 'critical'
  findings: string[]
}

interface Insight {
  id: string
  title: string
  type: 'opportunity' | 'risk' | 'trend' | 'performance'
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  impact: 'low' | 'medium' | 'high'
  recommendations: string[]
}

export default function EnterpriseFeaturesDashboard() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'security' | 'compliance' | 'reports'>('analytics')
  const [kpis, setKpis] = useState<KPI[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    
    // Clean state - no fake data, show N/A or empty states
    setKpis([
      { name: 'Revenue', value: 0, change: 0, unit: 'USD', trend: 'stable' },
      { name: 'Gross Margin', value: 0, change: 0, unit: '%', trend: 'stable' },
      { name: 'Market Share', value: 0, change: 0, unit: '%', trend: 'stable' },
      { name: 'CAC', value: 0, change: 0, unit: 'USD', trend: 'stable' }
    ])

    setInsights([])

    setSecurityMetrics([])

    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'good': return 'text-blue-600 bg-blue-50'
      case 'needs-attention': return 'text-yellow-600 bg-yellow-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatNumber = (value: number, unit: string) => {
    // Show N/A for zero/empty values
    if (value === 0) {
      return 'N/A'
    }
    
    if (unit === 'USD' && value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (unit === 'USD' && value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    } else if (unit === 'USD') {
      return `$${value}`
    } else if (unit === '%') {
      return `${value}%`
    }
    return `${value}${unit}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Enterprise Dashboard</h2>
            <p className="text-sm text-gray-600">Advanced analytics and enterprise features</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            Enterprise Plan
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'analytics', label: 'Advanced Analytics', icon: ChartBarIcon },
          { id: 'security', label: 'Security', icon: ShieldCheckIcon },
          { id: 'compliance', label: 'Compliance', icon: LockClosedIcon },
          { id: 'reports', label: 'Custom Reports', icon: DocumentChartBarIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">{kpi.name}</h3>
                  <ArrowTrendingUpIcon 
                    className={`h-4 w-4 ${
                      kpi.trend === 'up' ? 'text-green-500' : 
                      kpi.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                    }`} 
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(kpi.value, kpi.unit)}
                  </p>
                  <p className={`text-xs ${
                    kpi.change === 0 ? 'text-gray-400' : kpi.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.change === 0 ? 'No change' : `${kpi.change > 0 ? '+' : ''}${formatNumber(kpi.change, kpi.unit)} vs last period`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Insights */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI-Powered Insights</h3>
            <div className="space-y-4">
              {insights.map(insight => (
                <div key={insight.id} className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-white bg-opacity-70">
                        {insight.type}
                      </span>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {insight.priority} priority
                    </span>
                  </div>
                  <p className="text-sm mb-3">{insight.description}</p>
                  <div>
                    <p className="text-xs font-medium mb-2">Recommendations:</p>
                    <ul className="text-xs space-y-1">
                      {insight.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start space-x-1">
                          <span>•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Intelligence */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Market Intelligence</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">N/A</p>
                <p className="text-sm text-gray-600">Total Market Size</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">N/A</p>
                <p className="text-sm text-gray-600">Market Growth Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">N/A</p>
                <p className="text-sm text-gray-600">Your Market Share</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Security Score */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Security Health Score</h3>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">91</p>
                <p className="text-sm text-gray-600">out of 100</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '91%' }}></div>
            </div>
          </div>

          {/* Security Metrics */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Categories</h3>
            <div className="space-y-4">
              {securityMetrics.map((metric, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{metric.category}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{metric.score}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                        {metric.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.score >= 90 ? 'bg-green-500' : 
                        metric.score >= 80 ? 'bg-blue-500' : 
                        metric.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metric.score}%` }}
                    ></div>
                  </div>
                  <div className="space-y-1">
                    {metric.findings.map((finding, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        {finding.startsWith('✓') ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                        <span className="text-gray-600">{finding.replace(/^[✓⚠]\s/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vulnerability Assessment */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Vulnerability Assessment</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">2</p>
                <p className="text-sm text-gray-600">Total Vulnerabilities</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">0</p>
                <p className="text-sm text-gray-600">Critical</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">1</p>
                <p className="text-sm text-gray-600">Medium</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">1</p>
                <p className="text-sm text-gray-600">Low</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {/* Compliance Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'SOC 2 Type II', status: 'Compliant', score: 98, lastAudit: '2024-01-15' },
              { name: 'GDPR', status: 'Compliant', score: 95, lastAudit: '2024-01-10' },
              { name: 'CCPA', status: 'Partial', score: 87, lastAudit: '2024-01-08' }
            ].map((compliance, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{compliance.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    compliance.status === 'Compliant' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {compliance.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Score</span>
                    <span className="font-medium">{compliance.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${compliance.score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Last Audit</span>
                    <span>{compliance.lastAudit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Data Retention Policies */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Data Retention Policies</h3>
            <div className="space-y-3">
              {[
                { type: 'User Data', retention: '3 years', method: 'Anonymize', status: 'Active' },
                { type: 'Audit Logs', retention: '7 years', method: 'Hard Delete', status: 'Active' },
                { type: 'Payment Data', retention: '7 years', method: 'Secure Archive', status: 'Active' }
              ].map((policy, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{policy.type}</p>
                    <p className="text-sm text-gray-600">Retained for {policy.retention}, then {policy.method.toLowerCase()}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    {policy.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Executive Summary', description: 'High-level business metrics and insights', icon: DocumentChartBarIcon },
              { name: 'Financial Report', description: 'Revenue, margins, and profitability analysis', icon: ChartBarIcon },
              { name: 'Security Report', description: 'Security posture and compliance status', icon: ShieldCheckIcon }
            ].map((report, index) => (
              <button 
                key={index}
                className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <report.icon className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">{report.name}</h3>
                <p className="text-sm text-gray-600">{report.description}</p>
              </button>
            ))}
          </div>

          {/* Scheduled Reports */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Scheduled Reports</h3>
            <div className="space-y-3">
              {[
                { name: 'Weekly Executive Summary', schedule: 'Every Monday 9:00 AM', recipients: 3, lastSent: '2 days ago' },
                { name: 'Monthly Financial Report', schedule: 'First Monday of month', recipients: 5, lastSent: '1 week ago' },
                { name: 'Quarterly Security Report', schedule: 'End of quarter', recipients: 2, lastSent: '1 month ago' }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{report.name}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{report.schedule}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <UserGroupIcon className="h-4 w-4" />
                        <span>{report.recipients} recipients</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Last sent</p>
                    <p className="text-sm font-medium">{report.lastSent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 