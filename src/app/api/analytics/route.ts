import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { databaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Skip database operations during build
    if (process.env.VERCEL_ENV === 'preview' && !process.env.DATABASE_URL) {
      return NextResponse.json({ message: 'Database not configured for build' }, { status: 503 })
    }
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const productId = searchParams.get('productId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!organizationId && !productId) {
      return NextResponse.json(
        { error: 'Either organizationId or productId is required' },
        { status: 400 }
      )
    }

    let analytics

    if (productId) {
      analytics = await databaseService.getProductAnalytics(productId, days)
    } else {
      analytics = await databaseService.getOrganizationAnalytics(organizationId!, days)
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
} 