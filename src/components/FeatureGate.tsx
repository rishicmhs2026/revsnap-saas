'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LockClosedIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

interface FeatureGateProps {
  feature: string
  organizationId: string | null
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  className?: string
}

interface PlanValidation {
  planId: string
  planName: string
  limits: any
  features: Array<{
    feature: string
    allowed: boolean
    reason?: string
    upgradePrompt?: string
  }>
  canPerformAction: (action: string) => boolean
  getUpgradePrompt: (feature: string) => string | null
}

export default function FeatureGate({ 
  feature, 
  organizationId, 
  children, 
  fallback, 
  showUpgradePrompt = true,
  className = ''
}: FeatureGateProps) {
  const [validation, setValidation] = useState<PlanValidation | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!organizationId) {
      setValidation(null)
      setLoading(false)
      return
    }

    const loadValidation = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/plan-limits?organizationId=${organizationId}&action=${feature}`)
        if (response.ok) {
          const data = await response.json()
          
          // Create validation object
          const planValidation: PlanValidation = {
            planId: data.planId || 'free',
            planName: data.planName || 'Free',
            limits: data.limits,
            features: [],
            canPerformAction: (action: string) => {
              return data.validation?.allowed || false
            },
            getUpgradePrompt: (feature: string) => {
              return data.validation?.reason || null
            }
          }
          
          setValidation(planValidation)
        }
      } catch (error) {
        console.error('Error loading plan validation:', error)
        setValidation(null)
      } finally {
        setLoading(false)
      }
    }

    loadValidation()
  }, [organizationId, feature])

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    )
  }

  // If no validation or feature not allowed
  if (!validation || !validation.canPerformAction(feature)) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (!showUpgradePrompt) {
      return null
    }

    return (
      <div className={`relative ${className}`}>
        {/* Blurred content */}
        <div className="filter blur-sm pointer-events-none opacity-50">
          {children}
        </div>
        
        {/* Overlay with upgrade prompt */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <LockClosedIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Locked
            </h3>
            <p className="text-gray-600 mb-4 max-w-sm">
              {validation?.getUpgradePrompt(feature) || 'This feature requires a paid plan to access.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/pricing')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <ArrowUpIcon className="h-4 w-4" />
                Upgrade Plan
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Feature is allowed, show content
  return <>{children}</>
}

// Specific feature gate components for common use cases
export function EnterpriseFeatureGate({ organizationId, children, fallback }: {
  organizationId: string | null
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <FeatureGate 
      feature="enterprise_analytics" 
      organizationId={organizationId}
      fallback={fallback}
    >
      {children}
    </FeatureGate>
  )
}

export function ProfessionalFeatureGate({ organizationId, children, fallback }: {
  organizationId: string | null
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <FeatureGate 
      feature="api_access" 
      organizationId={organizationId}
      fallback={fallback}
    >
      {children}
    </FeatureGate>
  )
}

export function StarterFeatureGate({ organizationId, children, fallback }: {
  organizationId: string | null
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <FeatureGate 
      feature="advanced_tracking" 
      organizationId={organizationId}
      fallback={fallback}
    >
      {children}
    </FeatureGate>
  )
}
