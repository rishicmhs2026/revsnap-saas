import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { databaseService } from '@/lib/database'

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