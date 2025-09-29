'use client'

import { useState, useEffect } from 'react'
import { 
  BoltIcon,
  LinkIcon,
  PlayIcon,
  PauseIcon,
  CogIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface ZapierConnection {
  id: string
  name: string
  triggerType: string
  targetApp: string
  targetAction: string
  isActive: boolean
  lastTriggered?: Date
  triggerCount: number
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  trigger: string
  action: string
  config: any
  popularity: number
}

export default function ZapierIntegration() {
  const [connections, setConnections] = useState<ZapierConnection[]>([])
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [apiKey, setApiKey] = useState<string>('')
  const [showSetup, setShowSetup] = useState(false)
  const [activeTab, setActiveTab] = useState<'connections' | 'templates' | 'setup'>('connections')

  useEffect(() => {
    loadConnections()
    loadTemplates()
    loadApiKey()
  }, [])

  const loadConnections = async () => {
    // Clean state - no fake connections, show empty state
    setConnections([])
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/zapier?action=templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const loadApiKey = async () => {
    // Check if API key exists in localStorage
    const storedKey = localStorage.getItem('zapier_api_key')
    if (storedKey) {
      setApiKey(storedKey)
    }
  }

  const generateApiKey = async () => {
    try {
      const response = await fetch('/api/zapier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_api_key',
          organization_id: 'demo-org'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setApiKey(data.api_key)
        localStorage.setItem('zapier_api_key', data.api_key)
      }
    } catch (error) {
      console.error('Error generating API key:', error)
    }
  }

  const toggleConnection = async (connectionId: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, isActive: !conn.isActive }
          : conn
      )
    )
  }

  const deleteConnection = async (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
  }

  const createFromTemplate = async (template: WorkflowTemplate) => {
    // In real implementation, redirect to Zapier with pre-filled template
    const zapierUrl = `https://zapier.com/apps/revsnap/integrations?template=${template.id}`
    window.open(zapierUrl, '_blank')
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <BoltIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Zapier Integration</h2>
            <p className="text-sm text-gray-600">Connect RevSnap to 5000+ apps</p>
          </div>
        </div>

        <button
          onClick={() => setShowSetup(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Zap</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'connections', label: 'Active Zaps' },
          { id: 'templates', label: 'Templates' },
          { id: 'setup', label: 'Setup' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Connections */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <BoltIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Zaps Connected</h3>
              <p className="text-gray-600 mb-4">
                Connect RevSnap to your favorite apps to automate your workflow
              </p>
              <button
                onClick={() => setActiveTab('templates')}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Browse Templates
              </button>
            </div>
          ) : (
            connections.map(connection => (
              <div key={connection.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${connection.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <h3 className="font-medium text-gray-900">{connection.name}</h3>
                      <p className="text-sm text-gray-600">
                        {connection.triggerType} → {connection.targetApp}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleConnection(connection.id)}
                      className={`p-2 rounded-md ${
                        connection.isActive 
                          ? 'text-orange-600 hover:bg-orange-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {connection.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteConnection(connection.id)}
                      className="p-2 rounded-md text-red-600 hover:bg-red-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className={`font-medium ${connection.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {connection.isActive ? 'Active' : 'Paused'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Triggers</p>
                    <p className="font-medium">{connection.triggerCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Triggered</p>
                    <p className="font-medium">
                      {connection.lastTriggered 
                        ? new Date(connection.lastTriggered).toLocaleString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="text-xs text-gray-500">
                      {template.trigger} → {template.action}
                    </div>
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                    Popular
                  </div>
                </div>
                
                <button
                  onClick={() => createFromTemplate(template)}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors text-sm"
                >
                  Use This Template
                </button>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <BoltIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Custom Workflows</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Need something specific? Create custom Zaps using our triggers and actions.
                </p>
                <a 
                  href="https://zapier.com/apps/revsnap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Browse All RevSnap Integrations →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Zapier Setup</h3>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Step 1: Generate API Key</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Generate an API key to authenticate RevSnap with Zapier
                </p>
                
                {apiKey ? (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-mono text-gray-900">{apiKey}</p>
                    <p className="text-xs text-gray-500 mt-1">Keep this key secure and don&apos;t share it</p>
                  </div>
                ) : (
                  <button
                    onClick={generateApiKey}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Generate API Key
                  </button>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Step 2: Connect in Zapier</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Go to Zapier and search for &quot;RevSnap&quot; to start creating your first Zap
                </p>
                <a
                  href="https://zapier.com/apps/revsnap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                >
                  <LinkIcon className="h-4 w-4" />
                  <span>Open Zapier</span>
                </a>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Available Triggers</h4>
                <p className="text-sm text-gray-600 mb-3">Events in RevSnap that can start your Zaps:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Price Change Detected</li>
                  <li>• Pricing Recommendation Ready</li>
                  <li>• Competitor Out of Stock</li>
                  <li>• Profit Milestone Reached</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Available Actions</h4>
                <p className="text-sm text-gray-600 mb-3">Things Zapier can do in RevSnap:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Add Product to Tracking</li>
                  <li>• Update Product Price</li>
                  <li>• Create Price Alert</li>
                  <li>• Get Pricing Recommendation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 