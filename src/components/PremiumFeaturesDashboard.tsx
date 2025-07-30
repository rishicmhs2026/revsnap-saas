'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  ChartBarIcon, 
  ClockIcon, 
  CogIcon, 
  KeyIcon, 
  BellIcon, 
  ArrowDownTrayIcon,
  UsersIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface PlanLimits {
  name: string
  price: number
  maxProducts: number
  updateIntervalMinutes: number
  competitorSources: string[]
  features: string[]
  supportLevel: string
  apiAccess: boolean
  customAlerts: boolean
  dataExport: boolean
  mobileDashboard: boolean
  teamCollaboration: boolean
  whiteLabel: boolean
  slaGuarantee: boolean
  customIntegrations: boolean
  customAIModels: boolean
}

interface TrackingStats {
  totalJobs: number
  activeJobs: number
  jobsByPlan: Record<string, number>
  averageUpdateInterval: number
  lastUpdateTime?: string
}

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  isActive: boolean
  lastUsed?: string
  createdAt: string
}

export default function PremiumFeaturesDashboard() {
  const { data: session } = useSession()
  const [selectedOrg, setSelectedOrg] = useState('')
  const [organizations, setOrganizations] = useState([])
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null)
  const [trackingStats, setTrackingStats] = useState<TrackingStats | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (session?.user?.email) {
      loadOrganizations()
    }
  }, [session])

  useEffect(() => {
    if (selectedOrg) {
      loadPlanData()
      loadTrackingStats()
      loadApiKeys()
    }
  }, [selectedOrg])

  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      const data = await response.json()
      setOrganizations(data.organizations || [])
      if (data.organizations?.length > 0) {
        setSelectedOrg(data.organizations[0].id)
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  }

  const loadPlanData = async () => {
    try {
      const response = await fetch(`/api/plan-limits?organizationId=${selectedOrg}&action=add_product`)
      const data = await response.json()
      if (data.limits) {
        setPlanLimits(data.limits)
      }
    } catch (error) {
      console.error('Error loading plan data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTrackingStats = async () => {
    try {
      const response = await fetch(`/api/enhanced-tracking?organizationId=${selectedOrg}`)
      const data = await response.json()
      if (data.trackingStats) {
        setTrackingStats(data.trackingStats)
      }
    } catch (error) {
      console.error('Error loading tracking stats:', error)
    }
  }

  const loadApiKeys = async () => {
    try {
      const response = await fetch(`/api/enhanced-api?action=api_keys&organizationId=${selectedOrg}`)
      const data = await response.json()
      if (data.apiKeys) {
        setApiKeys(data.apiKeys)
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    }
  }

  const generateApiKey = async () => {
    const name = prompt('Enter a name for your API key:')
    if (!name) return

    try {
      const response = await fetch('/api/enhanced-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_api_key',
          organizationId: selectedOrg,
          name
        })
      })
      const data = await response.json()
      if (data.success) {
        loadApiKeys()
        alert(`API key generated successfully!\nKey: ${data.apiKey.key}`)
      } else {
        alert(data.error || 'Failed to generate API key')
      }
    } catch (error) {
      console.error('Error generating API key:', error)
      alert('Failed to generate API key')
    }
  }

  const exportData = async (dataType: string, format: string) => {
    try {
      const response = await fetch('/api/enhanced-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export_data',
          organizationId: selectedOrg,
          dataType,
          format
        })
      })
      const data = await response.json()
      if (data.success) {
        // In a real implementation, you'd download the file
        alert(`Data exported successfully as ${data.exportResult.filename}`)
      } else {
        alert(data.error || 'Failed to export data')
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Premium Features Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your premium features and track usage across all plans
          </p>
        </div>

        {/* Organization Selector */}
        <div className="mb-6">
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
            Select Organization
          </label>
          <select
            id="organization"
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {organizations.map((org: any) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        {/* Plan Overview */}
        {planLimits && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{planLimits.name} Plan</h2>
              <span className="text-2xl font-bold text-blue-600">${planLimits.price}/month</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {planLimits.maxProducts === -1 ? '∞' : planLimits.maxProducts}
                </div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {planLimits.updateIntervalMinutes}m
                </div>
                <div className="text-sm text-gray-600">Update Interval</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {planLimits.competitorSources.length}
                </div>
                <div className="text-sm text-gray-600">Competitor Sources</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'tracking', name: 'Tracking', icon: ClockIcon },
              { id: 'api', name: 'API Access', icon: KeyIcon },
              { id: 'features', name: 'Features', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tracking Overview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Tracking Overview
                </h3>
                {trackingStats && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Jobs:</span>
                      <span className="font-semibold">{trackingStats.activeJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Jobs:</span>
                      <span className="font-semibold">{trackingStats.totalJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Update Interval:</span>
                      <span className="font-semibold">{trackingStats.averageUpdateInterval}m</span>
                    </div>
                    {trackingStats.lastUpdateTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Update:</span>
                        <span className="font-semibold">
                          {new Date(trackingStats.lastUpdateTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* API Overview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <KeyIcon className="h-5 w-5 mr-2" />
                  API Access
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active API Keys:</span>
                    <span className="font-semibold">{apiKeys.filter(k => k.isActive).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Access:</span>
                    <span className={`font-semibold ${planLimits?.apiAccess ? 'text-green-600' : 'text-red-600'}`}>
                      {planLimits?.apiAccess ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <button
                    onClick={generateApiKey}
                    disabled={!planLimits?.apiAccess}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate API Key
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Configuration</h3>
              {planLimits && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Available Competitor Sources</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {planLimits.competitorSources.map((source) => (
                        <div key={source} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Update Frequency</h4>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">
                        Every {planLimits.updateIntervalMinutes} minutes
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              {/* API Keys */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                  <button
                    onClick={generateApiKey}
                    disabled={!planLimits?.apiAccess}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate New Key
                  </button>
                </div>
                
                {apiKeys.length > 0 ? (
                  <div className="space-y-4">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="border border-gray-200 rounded-md p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{key.name}</h4>
                            <p className="text-sm text-gray-600">
                              Created: {new Date(key.createdAt).toLocaleDateString()}
                            </p>
                            {key.lastUsed && (
                              <p className="text-sm text-gray-600">
                                Last used: {new Date(key.lastUsed).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              key.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {key.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No API keys generated yet.</p>
                )}
              </div>

              {/* Rate Limits */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <div className="text-2xl font-bold text-blue-600">
                      {planLimits?.apiAccess ? '100' : '0'}
                    </div>
                    <div className="text-sm text-gray-600">Requests per minute</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <div className="text-2xl font-bold text-blue-600">
                      {planLimits?.apiAccess ? '5,000' : '0'}
                    </div>
                    <div className="text-sm text-gray-600">Requests per hour</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <div className="text-2xl font-bold text-blue-600">
                      {planLimits?.apiAccess ? '50,000' : '0'}
                    </div>
                    <div className="text-sm text-gray-600">Requests per day</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Features */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Features</h3>
                <div className="space-y-3">
                  {planLimits && [
                    { feature: 'apiAccess', name: 'API Access', icon: KeyIcon },
                    { feature: 'customAlerts', name: 'Custom Alerts', icon: BellIcon },
                    { feature: 'dataExport', name: 'Data Export', icon: ArrowDownTrayIcon },
                    { feature: 'mobileDashboard', name: 'Mobile Dashboard', icon: GlobeAltIcon },
                    { feature: 'teamCollaboration', name: 'Team Collaboration', icon: UsersIcon },
                    { feature: 'whiteLabel', name: 'White Label', icon: ShieldCheckIcon },
                    { feature: 'slaGuarantee', name: 'SLA Guarantee', icon: CpuChipIcon },
                    { feature: 'customIntegrations', name: 'Custom Integrations', icon: CogIcon },
                    { feature: 'customAIModels', name: 'Custom AI Models', icon: CpuChipIcon }
                  ].map(({ feature, name, icon: Icon }) => (
                    <div key={feature} className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${planLimits[feature as keyof PlanLimits] ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={`text-sm ${planLimits[feature as keyof PlanLimits] ? 'text-gray-900' : 'text-gray-400'}`}>
                        {name}
                      </span>
                      {planLimits[feature as keyof PlanLimits] && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Available
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Export */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
                {planLimits?.dataExport ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Export your data in various formats for analysis and reporting.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { type: 'products', label: 'Products' },
                        { type: 'competitors', label: 'Competitors' },
                        { type: 'analytics', label: 'Analytics' },
                        { type: 'all', label: 'All Data' }
                      ].map(({ type, label }) => (
                        <div key={type} className="space-y-2">
                          <h4 className="font-medium text-gray-900">{label}</h4>
                          <div className="space-y-1">
                            {['json', 'csv', 'excel'].map((format) => (
                              <button
                                key={format}
                                onClick={() => exportData(type, format)}
                                className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1"
                              >
                                Export as {format.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ArrowDownTrayIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Data export not available in your current plan.</p>
                    <p className="text-sm text-gray-400 mt-2">Upgrade to Professional or Enterprise to enable data export.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 