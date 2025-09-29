// Shopify Integration for RevSnap - Automatic Product & Price Sync
import { prisma } from './prisma'

export interface ShopifyStore {
  id: string
  organizationId: string
  shopDomain: string
  accessToken: string
  webhookEndpoint: string
  isActive: boolean
  lastSync: Date
  createdAt: Date
  settings: {
    autoSync: boolean
    syncFrequency: 'realtime' | 'hourly' | 'daily'
    autoPriceUpdate: boolean
    priceUpdateThreshold: number // percentage
    excludedProducts: string[]
    currency: string
  }
}

export interface ShopifyProduct {
  shopifyId: string
  handle: string
  title: string
  variants: ShopifyVariant[]
  vendor: string
  productType: string
  tags: string[]
  status: 'active' | 'archived' | 'draft'
  createdAt: string
  updatedAt: string
}

export interface ShopifyVariant {
  id: string
  productId: string
  title: string
  price: string
  compareAtPrice?: string
  sku: string
  inventoryQuantity: number
  weight: number
  inventoryManagement: string
}

export interface PricingRecommendation {
  variantId: string
  currentPrice: number
  recommendedPrice: number
  confidence: number
  reasoning: string
  competitorData: {
    source: string
    price: number
    url: string
  }[]
  expectedImpact: {
    revenueChange: number
    marginChange: number
    demandChange: number
  }
}

export class ShopifyIntegrationService {
  private static readonly SHOPIFY_API_VERSION = '2024-01'
  
  /**
   * Initialize Shopify integration for an organization
   */
  static async connectStore(
    organizationId: string,
    shopDomain: string,
    accessToken: string
  ): Promise<{ success: boolean; store?: ShopifyStore; error?: string }> {
    try {
      // Validate Shopify credentials
      const isValid = await this.validateShopifyCredentials(shopDomain, accessToken)
      if (!isValid) {
        return { success: false, error: 'Invalid Shopify credentials' }
      }

      // Create store integration
      const store: ShopifyStore = {
        id: `shopify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        organizationId,
        shopDomain,
        accessToken: await this.encryptToken(accessToken),
        webhookEndpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify`,
        isActive: true,
        lastSync: new Date(),
        createdAt: new Date(),
        settings: {
          autoSync: true,
          syncFrequency: 'hourly',
          autoPriceUpdate: false, // Start conservative
          priceUpdateThreshold: 5, // 5% threshold
          excludedProducts: [],
          currency: 'USD'
        }
      }

      // Store in database
      await this.storeShopifyIntegration(store)

      // Set up webhooks
      await this.setupShopifyWebhooks(shopDomain, accessToken)

      // Initial product sync
      await this.syncProducts(store)

      return { success: true, store }

    } catch (error) {
      console.error('Error connecting Shopify store:', error)
      return { success: false, error: 'Failed to connect store' }
    }
  }

  /**
   * Sync products from Shopify to RevSnap
   */
  static async syncProducts(store: ShopifyStore): Promise<{
    success: boolean
    synced: number
    errors: string[]
  }> {
    try {
      const accessToken = await this.decryptToken(store.accessToken)
      const products = await this.fetchShopifyProducts(store.shopDomain, accessToken)
      
      let synced = 0
      const errors: string[] = []

      for (const shopifyProduct of products) {
        try {
          // Convert Shopify product to RevSnap format
          const revSnapProduct = await this.convertShopifyProduct(
            shopifyProduct, 
            store.organizationId
          )

          // Check if product already exists
          const existingProduct = await this.findExistingProduct(
            store.organizationId, 
            shopifyProduct.shopifyId
          )

          if (existingProduct) {
            // Update existing product
            await this.updateRevSnapProduct(existingProduct.id, revSnapProduct)
          } else {
            // Create new product
            await this.createRevSnapProduct(revSnapProduct, shopifyProduct.shopifyId)
          }

          synced++

                 } catch (error) {
           errors.push(`Failed to sync ${shopifyProduct.title}: ${error instanceof Error ? error.message : 'Unknown error'}`)
         }
      }

      // Update last sync time
      store.lastSync = new Date()
      await this.updateShopifyIntegration(store)

      return { success: true, synced, errors }

         } catch (error) {
       console.error('Error syncing products:', error)
       return { success: false, synced: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] }
     }
  }

  /**
   * Generate pricing recommendations for Shopify products
   */
  static async getPricingRecommendations(
    storeId: string,
    productIds?: string[]
  ): Promise<PricingRecommendation[]> {
    try {
      const store = await this.getShopifyStore(storeId)
      if (!store) return []

      // Get products to analyze
      const products = productIds 
        ? await this.getSpecificProducts(store.organizationId, productIds)
        : await this.getAllStoreProducts(store.organizationId)

      const recommendations: PricingRecommendation[] = []

      for (const product of products) {
        // Get competitor data for this product
        const competitorData = await this.getCompetitorPricing(product.id)
        
        // Use AI to generate pricing recommendation
        const recommendation = await this.generatePricingRecommendation(
          product,
          competitorData
        )

        if (recommendation) {
          recommendations.push(recommendation)
        }
      }

      return recommendations

    } catch (error) {
      console.error('Error generating pricing recommendations:', error)
      return []
    }
  }

  /**
   * Apply pricing recommendations to Shopify store
   */
  static async applyPricingRecommendations(
    storeId: string,
    recommendations: Array<{
      variantId: string
      newPrice: number
      reason: string
    }>
  ): Promise<{ success: boolean; updated: number; errors: string[] }> {
    try {
      const store = await this.getShopifyStore(storeId)
      if (!store) {
        return { success: false, updated: 0, errors: ['Store not found'] }
      }

      const accessToken = await this.decryptToken(store.accessToken)
      let updated = 0
      const errors: string[] = []

      for (const rec of recommendations) {
        try {
          // Update price in Shopify
          await this.updateShopifyVariantPrice(
            store.shopDomain,
            accessToken,
            rec.variantId,
            rec.newPrice
          )

          // Log price change
          await this.logPriceChange(
            store.organizationId,
            rec.variantId,
            rec.newPrice,
            rec.reason
          )

          updated++

        } catch (error) {
          errors.push(`Failed to update variant ${rec.variantId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return { success: true, updated, errors }

         } catch (error) {
       console.error('Error applying pricing recommendations:', error)
       return { success: false, updated: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] }
     }
  }

  /**
   * Set up automatic price monitoring and updates
   */
  static async setupAutoPricing(
    storeId: string,
    settings: {
      enabled: boolean
      frequency: 'hourly' | 'daily' | 'weekly'
      maxPriceChange: number // percentage
      requireApproval: boolean
      excludedProducts: string[]
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const store = await this.getShopifyStore(storeId)
      if (!store) {
        return { success: false, error: 'Store not found' }
      }

      // Update store settings
      store.settings = {
        ...store.settings,
        autoPriceUpdate: settings.enabled,
        priceUpdateThreshold: settings.maxPriceChange,
        excludedProducts: settings.excludedProducts
      }

      await this.updateShopifyIntegration(store)

      // Schedule background job for auto-pricing
      if (settings.enabled) {
        await this.scheduleAutoPricingJob(storeId, settings.frequency)
      }

      return { success: true }

    } catch (error) {
      console.error('Error setting up auto-pricing:', error)
      return { success: false, error: 'Failed to configure auto-pricing' }
    }
  }

  /**
   * Handle Shopify webhook events
   */
  static async handleWebhook(
    event: string,
    payload: any,
    shopDomain: string
  ): Promise<void> {
    try {
      const store = await this.getStoreByDomain(shopDomain)
      if (!store) return

      switch (event) {
        case 'products/create':
        case 'products/update':
          await this.handleProductUpdate(store, payload)
          break

        case 'orders/create':
          await this.handleOrderCreated(store, payload)
          break

        case 'app/uninstalled':
          await this.handleAppUninstalled(store)
          break

        default:
          console.log(`Unhandled webhook event: ${event}`)
      }

    } catch (error) {
      console.error('Error handling webhook:', error)
    }
  }

  // Private helper methods

  private static async validateShopifyCredentials(
    shopDomain: string,
    accessToken: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `https://${shopDomain}.myshopify.com/admin/api/${this.SHOPIFY_API_VERSION}/shop.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.ok
    } catch {
      return false
    }
  }

  private static async fetchShopifyProducts(
    shopDomain: string,
    accessToken: string
  ): Promise<ShopifyProduct[]> {
    const products: ShopifyProduct[] = []
    let nextPageInfo = null

    do {
      const url = `https://${shopDomain}.myshopify.com/admin/api/${this.SHOPIFY_API_VERSION}/products.json?limit=250${
        nextPageInfo ? `&page_info=${nextPageInfo}` : ''
      }`

      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.statusText}`)
      }

      const data = await response.json()
      products.push(...data.products.map(this.formatShopifyProduct))

      // Check for pagination
      const linkHeader = response.headers.get('Link')
      nextPageInfo = this.extractNextPageInfo(linkHeader)

    } while (nextPageInfo)

    return products
  }

  private static formatShopifyProduct(product: any): ShopifyProduct {
    return {
      shopifyId: product.id.toString(),
      handle: product.handle,
      title: product.title,
      vendor: product.vendor,
      productType: product.product_type,
      tags: product.tags.split(',').map((tag: string) => tag.trim()),
      status: product.status,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      variants: product.variants.map((variant: any) => ({
        id: variant.id.toString(),
        productId: product.id.toString(),
        title: variant.title,
        price: variant.price,
        compareAtPrice: variant.compare_at_price,
        sku: variant.sku,
        inventoryQuantity: variant.inventory_quantity,
        weight: variant.weight,
        inventoryManagement: variant.inventory_management
      }))
    }
  }

  private static async setupShopifyWebhooks(
    shopDomain: string,
    accessToken: string
  ): Promise<void> {
    const webhooks = [
      'products/create',
      'products/update',
      'orders/create',
      'app/uninstalled'
    ]

    for (const topic of webhooks) {
      await fetch(
        `https://${shopDomain}.myshopify.com/admin/api/${this.SHOPIFY_API_VERSION}/webhooks.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            webhook: {
              topic,
              address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify`,
              format: 'json'
            }
          })
        }
      )
    }
  }

  private static async generatePricingRecommendation(
    product: any,
    competitorData: any[]
  ): Promise<PricingRecommendation | null> {
    try {
      // Simplified AI pricing logic
      const currentPrice = parseFloat(product.price)
      const competitorPrices = competitorData.map(c => c.price)
      
      if (competitorPrices.length === 0) return null

      const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b) / competitorPrices.length
      const minCompetitorPrice = Math.min(...competitorPrices)
      const maxCompetitorPrice = Math.max(...competitorPrices)

      // Simple pricing strategy: position slightly below average
      const recommendedPrice = avgCompetitorPrice * 0.95
      const confidence = competitorPrices.length >= 3 ? 0.85 : 0.65

      return {
        variantId: product.id,
        currentPrice,
        recommendedPrice: Math.round(recommendedPrice * 100) / 100,
        confidence,
        reasoning: `Recommended price based on ${competitorPrices.length} competitors (avg: $${avgCompetitorPrice.toFixed(2)})`,
        competitorData: competitorData.slice(0, 5), // Top 5 competitors
        expectedImpact: {
          revenueChange: (recommendedPrice - currentPrice) * 0.8, // Estimate
          marginChange: ((recommendedPrice - currentPrice) / currentPrice) * 100,
          demandChange: currentPrice > recommendedPrice ? 15 : -10 // Estimate
        }
      }

    } catch (error) {
      console.error('Error generating pricing recommendation:', error)
      return null
    }
  }

  // Mock database methods (in real implementation, use Prisma)
  private static async storeShopifyIntegration(store: ShopifyStore): Promise<void> {
    console.log('Storing Shopify integration:', store.id)
  }

  private static async updateShopifyIntegration(store: ShopifyStore): Promise<void> {
    console.log('Updating Shopify integration:', store.id)
  }

  private static async getShopifyStore(storeId: string): Promise<ShopifyStore | null> {
    // Mock implementation
    return null
  }

  private static async encryptToken(token: string): Promise<string> {
    // In production, use proper encryption
    return Buffer.from(token).toString('base64')
  }

  private static async decryptToken(encryptedToken: string): Promise<string> {
    // In production, use proper decryption
    return Buffer.from(encryptedToken, 'base64').toString()
  }

  private static extractNextPageInfo(linkHeader: string | null): string | null {
    // Parse Shopify pagination link header
    return null // Simplified
  }

  private static async convertShopifyProduct(product: ShopifyProduct, orgId: string): Promise<any> {
    return {
      name: product.title,
      sku: product.variants[0]?.sku || product.handle,
      price: parseFloat(product.variants[0]?.price || '0'),
      category: product.productType,
      brand: product.vendor,
      organizationId: orgId
    }
  }

  private static async findExistingProduct(orgId: string, shopifyId: string): Promise<any> {
    return null // Mock
  }

  private static async createRevSnapProduct(product: any, shopifyId: string): Promise<void> {
    console.log('Creating RevSnap product for Shopify ID:', shopifyId)
  }

  private static async updateRevSnapProduct(productId: string, updates: any): Promise<void> {
    console.log('Updating RevSnap product:', productId)
  }

  private static async getSpecificProducts(orgId: string, productIds: string[]): Promise<any[]> {
    return [] // Mock
  }

  private static async getAllStoreProducts(orgId: string): Promise<any[]> {
    return [] // Mock
  }

  private static async getCompetitorPricing(productId: string): Promise<any[]> {
    return [] // Mock
  }

  private static async updateShopifyVariantPrice(
    shopDomain: string,
    accessToken: string,
    variantId: string,
    newPrice: number
  ): Promise<void> {
    await fetch(
      `https://${shopDomain}.myshopify.com/admin/api/${this.SHOPIFY_API_VERSION}/variants/${variantId}.json`,
      {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variant: {
            id: variantId,
            price: newPrice.toString()
          }
        })
      }
    )
  }

  private static async logPriceChange(
    orgId: string,
    variantId: string,
    newPrice: number,
    reason: string
  ): Promise<void> {
    console.log('Logging price change:', { orgId, variantId, newPrice, reason })
  }

  private static async scheduleAutoPricingJob(storeId: string, frequency: string): Promise<void> {
    console.log('Scheduling auto-pricing job:', { storeId, frequency })
  }

  private static async getStoreByDomain(domain: string): Promise<ShopifyStore | null> {
    return null // Mock
  }

  private static async handleProductUpdate(store: ShopifyStore, payload: any): Promise<void> {
    console.log('Handling product update:', payload.id)
  }

  private static async handleOrderCreated(store: ShopifyStore, payload: any): Promise<void> {
    console.log('Handling order created:', payload.id)
  }

  private static async handleAppUninstalled(store: ShopifyStore): Promise<void> {
    console.log('Handling app uninstalled for store:', store.id)
  }
} 