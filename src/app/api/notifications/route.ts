import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Check if user has premium plan (notifications are premium-only)
    let hasPremiumPlan = false
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: {
          organizationId,
          status: 'active'
        }
      })
      hasPremiumPlan = subscriptions.length > 0
    } catch (error) {
      console.error('Error checking subscriptions:', error)
      // Default to free plan if we can't check
      hasPremiumPlan = false
    }

    if (!hasPremiumPlan) {
      return NextResponse.json({
        success: true,
        data: [],
        unreadCount: 0,
        message: 'Notifications are available for premium plans only'
      })
    }

    // Get recent price alerts as notifications
    let notifications = []
    try {
      const whereClause: any = {
        product: {
          organizationId
        }
      }

      if (unreadOnly) {
        whereClause.acknowledged = false
      }

      const priceAlerts = await prisma.priceAlert.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })

      // Transform price alerts into notification format
      notifications = priceAlerts.map((alert: any) => ({
        id: alert.id,
        type: alert.severity === 'high' ? 'error' : 
              alert.severity === 'medium' ? 'warning' : 'info',
        title: 'Price Alert',
        message: `${alert.product.name}: ${alert.message}`,
        timestamp: alert.createdAt,
        read: alert.acknowledged,
        actionUrl: `/products/${alert.product.id}`,
        actionText: 'View Product'
      }))
    } catch (error) {
      console.error('Error fetching price alerts:', error)
      // Return empty notifications if there's a database error
      notifications = []
    }

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount: notifications.filter((n: any) => !n.read).length
    })

  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAsRead, markAllAsRead, organizationId } = body

    if (markAllAsRead && organizationId) {
      // Mark all notifications as read for the organization
      await prisma.priceAlert.updateMany({
        where: {
          product: {
            organizationId
          },
          acknowledged: false
        },
        data: {
          acknowledged: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      })
    }

    if (notificationId && markAsRead !== undefined) {
      // Mark specific notification as read/unread
      await prisma.priceAlert.update({
        where: {
          id: notificationId
        },
        data: {
          acknowledged: markAsRead
        }
      })

      return NextResponse.json({
        success: true,
        message: `Notification marked as ${markAsRead ? 'read' : 'unread'}`
      })
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })

  } catch (error) {
    console.error('Notifications update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}