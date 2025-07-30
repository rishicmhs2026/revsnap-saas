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

    // Return mock activity for now to avoid build issues
    const activity = [
      {
        id: 'user-1',
        type: 'user',
        description: 'New user registered: admin@revsnap.com',
        timestamp: new Date().toISOString(),
        user: 'admin@revsnap.com'
      },
      {
        id: 'sub-1',
        type: 'subscription',
        description: 'Subscription active: Demo Organization',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        user: 'Demo Organization'
      }
    ]

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