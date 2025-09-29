import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { databaseService } from '@/lib/database'
import { PlanService } from '@/lib/plan-limits'
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

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const products = await databaseService.getOrganizationProducts(organizationId)

    return NextResponse.json({
      success: true,
      data: products
    })

  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

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
    const {
      name,
      description,
      sku,
      category,
      brand,
      image,
      url,
      yourPrice,
      currency,
      organizationId
    } = body

    if (!name || !organizationId) {
      return NextResponse.json(
        { error: 'Name and organization ID are required' },
        { status: 400 }
      )
    }

    // Check plan limits before creating product
    const subscription = await prisma.subscription.findFirst({
      where: { 
        organizationId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    })

    // Determine plan from Stripe price ID or default to free
    let planId = 'free'
    if (subscription?.stripePriceId) {
      planId = subscription.stripePriceId.includes('starter') ? 'starter' :
               subscription.stripePriceId.includes('professional') ? 'professional' :
               subscription.stripePriceId.includes('enterprise') ? 'enterprise' : 'free'
    }

    // Get current product count
    const currentProductCount = await prisma.product.count({
      where: { organizationId }
    })

    // Validate if user can add more products
    const validation = PlanService.validateAction(planId, 'add_product', currentProductCount)
    
    if (!validation.allowed) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 403 }
      )
    }

    const product = await databaseService.createProduct({
      name,
      description,
      sku,
      category,
      brand,
      image,
      url,
      yourPrice: yourPrice ? parseFloat(yourPrice) : undefined,
      currency: currency || 'USD',
      organizationId,
      userId: session.user.id
    })

    return NextResponse.json({
      success: true,
      data: product
    })

  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
} 