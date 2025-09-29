'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  oldPrice?: number
  newPrice?: number
  competitor?: string
  acknowledged: boolean
  createdAt: string
}

interface NotificationSystemProps {
  organizationId: string
}

export default function NotificationSystem({ organizationId }: NotificationSystemProps) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<string>('free')

  useEffect(() => {
    if (organizationId && session?.user?.id) {
      loadNotifications()
      checkUserPlan()
    }
  }, [organizationId, session?.user?.id])

  const checkUserPlan = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      if (response.ok) {
        const data = await response.json()
        const activeSub = data.subscriptions?.find((sub: any) => sub.status === 'active')
        if (activeSub) {
          const planId = activeSub.stripePriceId?.includes('starter') ? 'starter' :
                         activeSub.stripePriceId?.includes('professional') ? 'professional' :
                         activeSub.stripePriceId?.includes('enterprise') ? 'enterprise' : 'free'
          setUserPlan(planId)
        }
      }
    } catch (error) {
      console.error('Error checking user plan:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/notifications?organizationId=${organizationId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data || [])
      } else if (response.status === 403) {
        // User doesn't have premium plan
        setNotifications([])
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, acknowledged: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, acknowledged: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleRemoveNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification.id !== id))
      }
    } catch (error) {
      console.error('Error removing notification:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price_change':
        return '💰'
      case 'competitor_discovery':
        return '🔍'
      case 'tracking_update':
        return '📊'
      case 'system':
        return '⚙️'
      default:
        return '📢'
    }
  }

  if (userPlan === 'free') {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🔔</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Real-Time Notifications</h3>
          <p className="text-gray-400 mb-6">
            Get instant alerts when competitor prices change, new products are discovered, and tracking updates occur.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Upgrade to Get Notifications
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.acknowledged).length

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {notifications.length > 0 && unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xl">🔔</span>
            </div>
            <p className="text-gray-400">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-1">
              You&apos;ll see price alerts and tracking updates here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-750 transition-colors ${
                  !notification.acknowledged ? 'bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 text-lg">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          !notification.acknowledged ? 'text-white' : 'text-gray-300'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        {notification.oldPrice && notification.newPrice && (
                          <div className="flex items-center space-x-2 mt-2 text-xs">
                            <span className="text-red-400">${notification.oldPrice}</span>
                            <span className="text-gray-500">→</span>
                            <span className="text-green-400">${notification.newPrice}</span>
                            {notification.competitor && (
                              <span className="text-gray-500">on {notification.competitor}</span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.acknowledged && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveNotification(notification.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}