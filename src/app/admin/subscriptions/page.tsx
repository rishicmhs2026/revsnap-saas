'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Subscription {
  id: string
  status: string
  stripeSubscriptionId: string
  stripePriceId: string
  currentPeriodStart: string
  currentPeriodEnd: string
  organization: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
    email: string
  }
}

interface Organization {
  id: string
  name: string
  userId: string
}

export default function AdminSubscriptionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    organizationId: '',
    planId: 'starter',
    stripeSubscriptionId: '',
    stripeCustomerId: '',
    notes: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    // Check if user is admin
    if (session?.user?.role !== 'admin' && session?.user?.role !== 'super_admin') {
      router.push('/dashboard')
      return
    }

    loadData()
  }, [status, session, router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Load subscriptions
      const subsResponse = await fetch('/api/admin/subscriptions')
      if (subsResponse.ok) {
        const subsData = await subsResponse.json()
        setSubscriptions(subsData.data || [])
      }

      // Load organizations
      const orgsResponse = await fetch('/api/admin/organizations')
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json()
        setOrganizations(orgsData.data || [])
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/subscriptions/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Subscription created successfully!')
        setShowCreateForm(false)
        setFormData({
          organizationId: '',
          planId: 'starter',
          stripeSubscriptionId: '',
          stripeCustomerId: '',
          notes: ''
        })
        loadData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Failed to create subscription')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Subscription Management</h1>
            <p className="text-gray-400 mt-2">Manage user subscriptions and manually create new ones</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            {showCreateForm ? 'Cancel' : '+ Create Subscription'}
          </button>
        </div>

        {/* Create Subscription Form */}
        {showCreateForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create Manual Subscription</h2>
            <form onSubmit={handleCreateSubscription} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Organization</label>
                  <select
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} (User ID: {org.userId})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Plan</label>
                  <select
                    value={formData.planId}
                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="starter">Starter ($49/month)</option>
                    <option value="professional">Professional ($149/month)</option>
                    <option value="enterprise">Enterprise ($399/month)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stripe Subscription ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.stripeSubscriptionId}
                    onChange={(e) => setFormData({ ...formData, stripeSubscriptionId: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="sub_..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Stripe Customer ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.stripeCustomerId}
                    onChange={(e) => setFormData({ ...formData, stripeCustomerId: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="cus_..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="e.g., Coupon purchase, Manual activation, etc."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg"
                >
                  Create Subscription
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subscriptions List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">All Subscriptions</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Stripe ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {sub.organization?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {sub.user?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {sub.user?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {sub.stripePriceId?.includes('starter') ? 'Starter' :
                         sub.stripePriceId?.includes('professional') ? 'Professional' :
                         sub.stripePriceId?.includes('enterprise') ? 'Enterprise' : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sub.status === 'active' ? 'bg-green-100 text-green-800' :
                        sub.status === 'canceled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(sub.currentPeriodStart).toLocaleDateString()} - {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                      {sub.stripeSubscriptionId || 'Manual'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
