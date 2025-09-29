import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.email || session.user.email !== 'admin@revsnap.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get comprehensive admin statistics
    const [
      totalUsers,
      totalOrganizations,
      activeSubscriptions,
      totalRevenue,
      monthlyRevenue,
      userGrowth,
      subscriptionGrowth
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total organizations
      prisma.organization.count(),
      
      // Active subscriptions
      prisma.subscription.count({
        where: { status: 'active' }
      }),
      
      // Total revenue (sum of all subscription amounts)
      prisma.subscription.aggregate({
        where: { status: 'active' },
        _sum: { amount: true }
      }),
      
      // Monthly revenue (current month)
      prisma.subscription.aggregate({
        where: {
          status: 'active',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true }
      }),
      
      // User growth (last 30 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Subscription growth (last 30 days)
      prisma.subscription.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Get plan distribution
    const planDistribution = await prisma.subscription.groupBy({
      by: ['stripePriceId'],
      where: { status: 'active' },
      _count: { id: true }
    })

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        lastLoginAt: true
      }
    })

    // Get top organizations by product count
    const topOrganizations = await prisma.organization.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            products: true,
            members: true
          }
        }
      }
    })

    return NextResponse.json({
      totalUsers,
      totalOrganizations,
      activeSubscriptions,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      userGrowth,
      subscriptionGrowth,
      planDistribution: planDistribution.map((p: any) => ({
        plan: p.stripePriceId?.includes('starter') ? 'starter' :
              p.stripePriceId?.includes('professional') ? 'professional' :
              p.stripePriceId?.includes('enterprise') ? 'enterprise' : 'unknown',
        count: p._count.id
      })),
      recentUsers,
      topOrganizations: topOrganizations.map((org: any) => ({
        id: org.id,
        name: org.name,
        productCount: org._count.products,
        memberCount: org._count.members,
        createdAt: org.createdAt
      })),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch admin statistics' 
    }, { status: 500 })
  }
}
