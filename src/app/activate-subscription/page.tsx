'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Organization {
  id: string
  name: string
}

export default function ActivateSubscriptionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    organizationId: '',
    planId: 'enterprise',
    couponCode: '',
    notes: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    loadOrganizations()
  }, [status, router])

  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.data || [])
        if (data.data.length > 0) {
          setFormData(prev => ({ ...prev, organizationId: data.data[0].id }))
        }
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/subscriptions/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`🎉 Success! Your ${data.data.planName} subscription has been activated! You can now access all enterprise features.`)
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error activating subscription:', error)
      setMessage('❌ Failed to activate subscription. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-dark)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-3xl">🎫</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Activate Your Subscription
            </h1>
            <p className="text-gray-300 text-lg">
              Enter your coupon code or purchase details to activate your RevSnap subscription
            </p>
          </div>

          {/* Activation Form */}
          <div className="card">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Organization
                  </label>
                  <select
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Choose your organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plan Type
                  </label>
                  <select
                    value={formData.planId}
                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="starter">Starter Plan ($49/month)</option>
                    <option value="professional">Professional Plan ($149/month)</option>
                    <option value="enterprise">Enterprise Plan ($399/month)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Coupon Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                    className="input"
                    placeholder="Enter your coupon code if applicable"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Any additional information about your purchase..."
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-lg ${
                    message.includes('🎉') 
                      ? 'bg-green-900/50 border border-green-700 text-green-300' 
                      : 'bg-red-900/50 border border-red-700 text-red-300'
                  }`}>
                    {message}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary flex-1"
                  >
                    {isLoading ? 'Activating...' : '🚀 Activate Subscription'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Need Help?
              </h3>
              <p className="text-gray-300 mb-4">
                If you're having trouble activating your subscription, please contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/contact')}
                  className="btn btn-ghost"
                >
                  📧 Contact Support
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="btn btn-ghost"
                >
                  💳 View Pricing Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
