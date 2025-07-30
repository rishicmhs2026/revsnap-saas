import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify admin access
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || (!user.isAdmin && user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    // Get recent activity from various sources
    const [
      recentUsers,
      recentSubscriptions,
      recentPriceAlerts
    ] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }),
      prisma.subscription.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          organization: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.priceAlert.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          competitor: true,
          productName: true,
          timestamp: true,
          product: {
            select: {
              organization: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    ])

    // Combine and format activity
    const activity = [
      ...recentUsers.map((user: any) => ({
        id: `user-${user.id}`,
        type: 'user',
        description: `New user registered: ${user.name || user.email}`,
        timestamp: user.createdAt.toISOString(),
        user: user.name || user.email
      })),
      ...recentSubscriptions.map((sub: any) => ({
        id: `sub-${sub.id}`,
        type: 'subscription',
        description: `Subscription ${sub.status}: ${sub.organization.name}`,
        timestamp: sub.createdAt.toISOString(),
        user: sub.organization.name
      })),
      ...recentPriceAlerts.map((alert: any) => ({
        id: `alert-${alert.id}`,
        type: 'alert',
        description: `Price alert: ${alert.productName} from ${alert.competitor}`,
        timestamp: alert.timestamp.toISOString(),
        user: alert.product.organization.name
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: activity
    })

  } catch (error) {
    console.error('Admin activity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin activity' },
      { status: 500 }
    )
  }
} 