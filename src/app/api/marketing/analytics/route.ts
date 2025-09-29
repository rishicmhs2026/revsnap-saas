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
    const timeframe = searchParams.get('timeframe') || '30d'

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get marketing analytics data
    const [
      totalUsers,
      activeUsers,
      newUsers,
      userEngagement,
      featureUsage,
      conversionMetrics
    ] = await Promise.all([
      // Total users in organization
      prisma.user.count({
        where: {
          organizations: {
            some: {
              organizationId
            }
          }
        }
      }),

      // Active users (logged in within timeframe)
      prisma.user.count({
        where: {
          organizations: {
            some: {
              organizationId
            }
          },
          lastLoginAt: {
            gte: startDate
          }
        }
      }),

      // New users (created within timeframe)
      prisma.user.count({
        where: {
          organizations: {
            some: {
              organizationId
            }
          },
          createdAt: {
            gte: startDate
          }
        }
      }),

      // User engagement metrics
      prisma.user.findMany({
        where: {
          organizations: {
            some: {
              organizationId
            }
          },
          lastLoginAt: {
            gte: startDate
          }
        },
        select: {
          id: true,
          lastLoginAt: true,
          createdAt: true
        }
      }),

      // Feature usage analytics
      prisma.product.count({
        where: {
          organizationId,
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Conversion metrics (subscription data)
      prisma.subscription.findMany({
        where: {
          organizationId,
          createdAt: {
            gte: startDate
          }
        },
        select: {
          status: true,
          stripePriceId: true,
          createdAt: true
        }
      })
    ])

    // Calculate engagement metrics
    const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    const retentionRate = totalUsers > 0 ? ((totalUsers - newUsers) / totalUsers) * 100 : 0

    // Calculate conversion metrics
    const activeSubscriptions = conversionMetrics.filter((sub: any) => sub.status === 'active').length
    const conversionRate = totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0

    // Calculate plan distribution
    const planDistribution = conversionMetrics.reduce((acc: Record<string, number>, sub: any) => {
      const plan = sub.stripePriceId?.includes('starter') ? 'starter' :
                   sub.stripePriceId?.includes('professional') ? 'professional' :
                   sub.stripePriceId?.includes('enterprise') ? 'enterprise' : 'free'
      acc[plan] = (acc[plan] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate daily active users
    const dailyActiveUsers = userEngagement.reduce((acc: Record<string, number>, user: any) => {
      const date = user.lastLoginAt?.toISOString().split('T')[0]
      if (date) {
        acc[date] = (acc[date] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      timeframe,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      metrics: {
        totalUsers,
        activeUsers,
        newUsers,
        engagementRate: Math.round(engagementRate * 100) / 100,
        retentionRate: Math.round(retentionRate * 100) / 100,
        conversionRate: Math.round(conversionRate * 100) / 100,
        activeSubscriptions,
        featureUsage: {
          productsAdded: featureUsage,
          trackingJobsActive: 0, // Would need to query tracking jobs
          apiCallsMade: 0 // Would need to track API usage
        }
      },
      planDistribution,
      dailyActiveUsers: Object.entries(dailyActiveUsers)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
      trends: {
        userGrowth: newUsers,
        engagementTrend: engagementRate,
        conversionTrend: conversionRate
      }
    })

  } catch (error) {
    console.error('Marketing analytics error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch marketing analytics' 
    }, { status: 500 })
  }
}
