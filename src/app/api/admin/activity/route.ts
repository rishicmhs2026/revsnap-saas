import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Ensure Prisma client is available
if (!prisma) {
  throw new Error('Prisma client not initialized')
}

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const skip = (page - 1) * limit

    // Build filter conditions
    const where: any = {}
    if (type) where.type = type
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    // Get real activity data from database
    const [activities, totalCount] = await Promise.all([
      prisma.adminActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.adminActivity.count({ where })
    ])

    // Get activity summary for dashboard
    const activitySummary = await getActivitySummary()

    return NextResponse.json({
      success: true,
      data: {
        activities: activities.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
          timestamp: activity.createdAt.toISOString(),
          user: activity.user ? {
            id: activity.user.id,
            email: activity.user.email,
            name: activity.user.name,
            role: activity.user.role
          } : null,
          organization: activity.organization ? {
            id: activity.organization.id,
            name: activity.organization.name,
            slug: activity.organization.slug
          } : null,
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent,
          severity: activity.severity || 'info'
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        summary: activitySummary
      }
    })

  } catch (error) {
    console.error('Admin activity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin activity' },
      { status: 500 }
    )
  }
}

// POST endpoint to log new admin activity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || (!user.isAdmin && user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, description, metadata, organizationId, severity = 'info' } = body

    if (!type || !description) {
      return NextResponse.json(
        { error: 'Type and description are required' },
        { status: 400 }
      )
    }

    // Get client IP and user agent
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const activity = await prisma.adminActivity.create({
      data: {
        type,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        userId: session.user.id,
        organizationId: organizationId || null,
        ipAddress,
        userAgent,
        severity
      }
    })

    return NextResponse.json({
      success: true,
      data: activity
    })

  } catch (error) {
    console.error('Admin activity logging error:', error)
    return NextResponse.json(
      { error: 'Failed to log admin activity' },
      { status: 500 }
    )
  }
}

// Helper function to get activity summary
async function getActivitySummary() {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalActivities,
      activitiesLast24h,
      activitiesLast7d,
      activitiesLast30d,
      criticalActivities,
      userActivities,
      systemActivities,
      securityActivities
    ] = await Promise.all([
      prisma.adminActivity.count(),
      prisma.adminActivity.count({
        where: { createdAt: { gte: last24Hours } }
      }),
      prisma.adminActivity.count({
        where: { createdAt: { gte: last7Days } }
      }),
      prisma.adminActivity.count({
        where: { createdAt: { gte: last30Days } }
      }),
      prisma.adminActivity.count({
        where: { 
          severity: 'critical',
          createdAt: { gte: last7Days }
        }
      }),
      prisma.adminActivity.count({
        where: { 
          type: { in: ['user_login', 'user_register', 'user_update', 'user_delete'] },
          createdAt: { gte: last7Days }
        }
      }),
      prisma.adminActivity.count({
        where: { 
          type: { in: ['system_start', 'system_error', 'system_maintenance'] },
          createdAt: { gte: last7Days }
        }
      }),
      prisma.adminActivity.count({
        where: { 
          type: { in: ['security_breach', 'failed_login', 'suspicious_activity'] },
          createdAt: { gte: last7Days }
        }
      })
    ])

    return {
      total: totalActivities,
      last24Hours: activitiesLast24h,
      last7Days: activitiesLast7d,
      last30Days: activitiesLast30d,
      breakdown: {
        critical: criticalActivities,
        user: userActivities,
        system: systemActivities,
        security: securityActivities
      },
      trends: {
        dailyAverage: Math.round(activitiesLast7d / 7),
        weeklyGrowth: activitiesLast7d > 0 ? 
          ((activitiesLast7d - (activitiesLast30d - activitiesLast7d)) / (activitiesLast30d - activitiesLast7d) * 100) : 0
      }
    }
  } catch (error) {
    console.error('Error getting activity summary:', error)
    return {
      total: 0,
      last24Hours: 0,
      last7Days: 0,
      last30Days: 0,
      breakdown: { critical: 0, user: 0, system: 0, security: 0 },
      trends: { dailyAverage: 0, weeklyGrowth: 0 }
    }
  }
} 