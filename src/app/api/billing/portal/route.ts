import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StripeService } from '@/lib/stripe'

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
    const { organizationId, returnUrl } = body

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Get organization
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        userId: session.user.id
      }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    if (!organization.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found for this organization' },
        { status: 404 }
      )
    }

    // Create billing portal session
    const portalSession = await StripeService.createBillingPortalSession(
      organization.stripeCustomerId,
      returnUrl || `${process.env.NEXTAUTH_URL}/dashboard`
    )

    return NextResponse.json({
      success: true,
      data: {
        url: portalSession.url
      }
    })

  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
} 