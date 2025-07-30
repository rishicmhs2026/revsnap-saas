'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  CreditCardIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Subscription {
  id: string
  status: string
  stripeSubscriptionId: string
  stripePriceId: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  organization: {
    id: string
    name: string
  }
}

export default function BillingManagement() {
  const { data: session } = useSession()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const [organizations, setOrganizations] = useState<any[]>([])

  useEffect(() => {
    if (session?.user?.id) {
      loadOrganizations()
    }
  }, [session])

  useEffect(() => {
    if (selectedOrg) {
      loadSubscriptions()
    }
  }, [selectedOrg])

  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.data)
        if (data.data.length > 0) {
          setSelectedOrg(data.data[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  }

  const loadSubscriptions = async () => {
    if (!selectedOrg) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/subscriptions?organizationId=${selectedOrg}`)
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.data)
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBillingPortal = async () => {
    if (!selectedOrg) return

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: selectedOrg,
          returnUrl: window.location.href,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.data.url
      } else {
        alert('Failed to access billing portal')
      }
    } catch (error) {
      console.error('Error accessing billing portal:', error)
      alert('Failed to access billing portal')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'canceled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'past_due':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'canceled':
        return 'Canceled'
      case 'past_due':
        return 'Past Due'
      case 'trialing':
        return 'Trial'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Billing & Subscription</h2>
        <button
          onClick={() => window.location.href = '/pricing'}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Upgrade Plan
        </button>
      </div>

      {/* Organization Selector */}
      {organizations.length > 0 && (
        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
            Select Organization
          </label>
          <select
            id="organization"
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Subscription Details */}
      {subscriptions.length > 0 ? (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {subscription.organization.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Subscription ID: {subscription.stripeSubscriptionId}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(subscription.status)}
                  <span className="text-sm font-medium text-gray-900">
                    {getStatusText(subscription.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Current Period</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <CreditCardIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Price ID</p>
                    <p className="text-sm font-medium text-gray-900">
                      {subscription.stripePriceId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 text-gray-400">
                    {subscription.cancelAtPeriodEnd ? (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Auto-Renew</p>
                    <p className="text-sm font-medium text-gray-900">
                      {subscription.cancelAtPeriodEnd ? 'Will Cancel' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleBillingPortal}
                  className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Manage Billing
                </button>
                {subscription.status === 'active' && (
                  <button
                    onClick={() => window.location.href = '/pricing'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Change Plan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Subscriptions
          </h3>
          <p className="text-gray-600 mb-4">
            Get started with a subscription to unlock all features.
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Plans
          </button>
        </div>
      )}

      {/* Billing Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method</span>
            <span className="text-gray-900">Manage in billing portal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Billing Address</span>
            <span className="text-gray-900">Update in billing portal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax Information</span>
            <span className="text-gray-900">Available in billing portal</span>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleBillingPortal}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Access Billing Portal →
          </button>
        </div>
      </div>
    </div>
  )
} 