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

    // Get system statistics
    const [
      totalUsers,
      totalOrganizations,
      totalSubscriptions,
      activeSubscriptions,
      totalProducts,
      totalPriceAlerts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.subscription.count(),
      prisma.subscription.count({
        where: { status: 'active' }
      }),
      prisma.product.count(),
      prisma.priceAlert.count()
    ])

    // Calculate revenue (mock data for now - in production you'd calculate from Stripe)
    const totalRevenue = activeSubscriptions * 99 // Assuming average $99/month
    const monthlyRevenue = activeSubscriptions * 99

    const stats = {
      totalUsers,
      totalOrganizations,
      totalSubscriptions,
      activeSubscriptions,
      totalProducts,
      totalPriceAlerts,
      totalRevenue,
      monthlyRevenue,
      systemHealth: 'healthy',
      uptime: '99.9%'
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
} 