import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EnhancedApiService } from '@/lib/enhanced-api'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Get user's subscription to determine plan
    const subscription = await prisma.subscription.findFirst({
      where: { 
        organizationId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Determine plan from Stripe price ID
    const planId = subscription.stripePriceId?.includes('starter') ? 'starter' :
                   subscription.stripePriceId?.includes('professional') ? 'professional' :
                   subscription.stripePriceId?.includes('enterprise') ? 'enterprise' : 'starter'

    switch (action) {
      case 'api_keys':
        const apiKeys = await EnhancedApiService.getUserApiKeys(session.user.email)
        return NextResponse.json({ apiKeys })

      case 'rate_limits':
        const rateLimits = EnhancedApiService.getRateLimits(planId)
        return NextResponse.json({ rateLimits, planId })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Enhanced API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, organizationId, ...params } = body

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Get user's subscription to determine plan
    const subscription = await prisma.subscription.findFirst({
      where: { 
        organizationId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Determine plan from Stripe price ID
    const planId = subscription.stripePriceId?.includes('starter') ? 'starter' :
                   subscription.stripePriceId?.includes('professional') ? 'professional' :
                   subscription.stripePriceId?.includes('enterprise') ? 'enterprise' : 'starter'

    switch (action) {
      case 'generate_api_key':
        const { name } = params
        if (!name) {
          return NextResponse.json({ error: 'API key name required' }, { status: 400 })
        }

        try {
          const apiKey = await EnhancedApiService.generateApiKey(
            session.user.email,
            name,
            planId
          )
          return NextResponse.json({
            success: true,
            apiKey,
            message: 'API key generated successfully'
          })
        } catch (error: any) {
          return NextResponse.json({ 
            error: error.message || 'Failed to generate API key' 
          }, { status: 400 })
        }

      case 'revoke_api_key':
        const { apiKeyId } = params
        if (!apiKeyId) {
          return NextResponse.json({ error: 'API key ID required' }, { status: 400 })
        }

        await EnhancedApiService.revokeApiKey(apiKeyId, session.user.email)
        return NextResponse.json({
          success: true,
          message: 'API key revoked successfully'
        })

      case 'create_custom_alert':
        const { productId, competitor, threshold, condition } = params
        if (!productId || !competitor || !threshold || !condition) {
          return NextResponse.json({ 
            error: 'Product ID, competitor, threshold, and condition required' 
          }, { status: 400 })
        }

        try {
          const customAlert = await EnhancedApiService.createCustomAlert(
            productId,
            competitor,
            threshold,
            condition,
            session.user.email,
            planId
          )
          return NextResponse.json({
            success: true,
            customAlert,
            message: 'Custom alert created successfully'
          })
        } catch (error: any) {
          return NextResponse.json({ 
            error: error.message || 'Failed to create custom alert' 
          }, { status: 400 })
        }

      case 'export_data':
        const { dataType, format } = params
        if (!dataType || !format) {
          return NextResponse.json({ 
            error: 'Data type and format required' 
          }, { status: 400 })
        }

        try {
          const exportResult = await EnhancedApiService.exportData(
            organizationId,
            dataType,
            format,
            session.user.email,
            planId
          )
          return NextResponse.json({
            success: true,
            exportResult,
            message: 'Data exported successfully'
          })
        } catch (error: any) {
          return NextResponse.json({ 
            error: error.message || 'Failed to export data' 
          }, { status: 400 })
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Enhanced API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 