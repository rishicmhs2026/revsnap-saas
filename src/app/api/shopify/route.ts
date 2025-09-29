import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ShopifyIntegrationService } from '@/lib/shopify-integration'

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

    switch (action) {
      case 'stores':
        // Get connected Shopify stores
        const stores = await getConnectedStores(organizationId)
        return NextResponse.json({ success: true, stores })

      case 'sync-status':
        const storeId = searchParams.get('storeId')
        if (!storeId) {
          return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
        }
        const syncStatus = await getSyncStatus(storeId)
        return NextResponse.json({ success: true, syncStatus })

      case 'pricing-recommendations':
        const recommendationsStoreId = searchParams.get('storeId')
        if (!recommendationsStoreId) {
          return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
        }
        const recommendations = await ShopifyIntegrationService.getPricingRecommendations(
          recommendationsStoreId
        )
        return NextResponse.json({ success: true, recommendations })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Shopify API GET error:', error)
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
    const { action, organizationId } = body

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    switch (action) {
      case 'connect':
        const { shopDomain, accessToken } = body
        if (!shopDomain || !accessToken) {
          return NextResponse.json({ error: 'Shop domain and access token required' }, { status: 400 })
        }

        const connectResult = await ShopifyIntegrationService.connectStore(
          organizationId,
          shopDomain,
          accessToken
        )
        return NextResponse.json(connectResult)

      case 'sync':
        const { storeId } = body
        if (!storeId) {
          return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
        }

        const store = await getShopifyStore(storeId)
        if (!store) {
          return NextResponse.json({ error: 'Store not found' }, { status: 404 })
        }

        const syncResult = await ShopifyIntegrationService.syncProducts(store)
        return NextResponse.json(syncResult)

      case 'apply-pricing':
        const { storeId: pricingStoreId, recommendations } = body
        if (!pricingStoreId || !recommendations) {
          return NextResponse.json({ error: 'Store ID and recommendations required' }, { status: 400 })
        }

        const applyResult = await ShopifyIntegrationService.applyPricingRecommendations(
          pricingStoreId,
          recommendations
        )
        return NextResponse.json(applyResult)

      case 'setup-auto-pricing':
        const { storeId: autoStoreId, settings } = body
        if (!autoStoreId || !settings) {
          return NextResponse.json({ error: 'Store ID and settings required' }, { status: 400 })
        }

        const autoResult = await ShopifyIntegrationService.setupAutoPricing(
          autoStoreId,
          settings
        )
        return NextResponse.json(autoResult)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Shopify API POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions (mock implementations)
async function getConnectedStores(_organizationId: string) { // Prefix with _ to indicate unused
  // In real implementation, query database for Shopify stores
  return []
}

async function getSyncStatus(_storeId: string) { // Prefix with _ to indicate unused
  // In real implementation, get sync status from database
  return {
    lastSync: new Date(),
    syncedProducts: 0,
    errors: [],
    isRunning: false
  }
}

async function getShopifyStore(_storeId: string) { // Prefix with _ to indicate unused
  // In real implementation, query database for store
  return null
} 