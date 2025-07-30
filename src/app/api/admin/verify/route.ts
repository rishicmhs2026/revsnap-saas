import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email } = body

    // Get user details
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is admin
    const isAdmin = user.isAdmin || user.role === 'admin' || user.role === 'super_admin'

    // Log admin access attempt
    console.log(`Admin access attempt: ${email} - User: ${user.email} - Is Admin: ${isAdmin} - IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        isAdmin: true,
        role: user.role,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Admin verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify admin status' },
      { status: 500 }
    )
  }
} 