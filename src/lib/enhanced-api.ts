// Enhanced API service with premium features

import { PlanService, PLAN_LIMITS } from './plan-limits'
import { prisma } from './prisma'
import crypto from 'crypto'

export interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  isActive: boolean
  lastUsed?: Date
  expiresAt?: Date
  createdAt: Date
  userId: string
}

export interface ApiRateLimit {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
}

export interface CustomAlert {
  id: string
  productId: string
  competitor: string
  threshold: number
  condition: 'above' | 'below' | 'change_percent'
  isActive: boolean
  createdAt: Date
}

export class EnhancedApiService {
  /**
   * Generate API key for user
   */
  static async generateApiKey(
    userId: string,
    name: string,
    planId: string
  ): Promise<ApiKey> {
    // Check if API access is allowed for the plan
    if (!PlanService.hasFeature(planId, 'apiAccess')) {
      throw new Error('API access not available in this plan')
    }

    const key = `revsnap_${crypto.randomBytes(32).toString('hex')}`
    const permissions = this.getDefaultPermissions(planId)

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        permissions: JSON.stringify(permissions),
        isActive: true,
        userId
      }
    })

    return {
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key,
      permissions: JSON.parse(apiKey.permissions),
      isActive: apiKey.isActive,
      lastUsed: apiKey.lastUsed || undefined,
      expiresAt: apiKey.expiresAt || undefined,
      createdAt: apiKey.createdAt,
      userId: apiKey.userId
    }
  }

  /**
   * Get default permissions based on plan
   */
  private static getDefaultPermissions(planId: string): string[] {
    switch (planId) {
      case 'professional':
        return ['read:products', 'read:competitors', 'read:analytics', 'write:alerts']
      case 'enterprise':
        return ['read:products', 'read:competitors', 'read:analytics', 'write:alerts', 'write:products', 'admin:all']
      default:
        return ['read:products', 'read:competitors']
    }
  }

  /**
   * Validate API key and check rate limits
   */
  static async validateApiKey(
    apiKey: string,
    endpoint: string
  ): Promise<{ valid: boolean; userId?: string; planId?: string; rateLimit?: ApiRateLimit; error?: string }> {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    })

    if (!keyRecord || !keyRecord.isActive) {
      return { valid: false, error: 'Invalid or inactive API key' }
    }

    // Check expiration
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return { valid: false, error: 'API key has expired' }
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() }
    })

    // Get user's plan from subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId: keyRecord.userId },
      orderBy: { createdAt: 'desc' }
    })

    const planId = subscription?.stripePriceId?.includes('starter') ? 'starter' :
                   subscription?.stripePriceId?.includes('professional') ? 'professional' :
                   subscription?.stripePriceId?.includes('enterprise') ? 'enterprise' : 'starter'

    const rateLimit = this.getRateLimits(planId)

    return {
      valid: true,
      userId: keyRecord.userId,
      planId,
      rateLimit
    }
  }

  /**
   * Get rate limits based on plan
   */
  static getRateLimits(planId: string): ApiRateLimit {
    switch (planId) {
      case 'starter':
        return {
          requestsPerMinute: 30,
          requestsPerHour: 1000,
          requestsPerDay: 10000
        }
      case 'professional':
        return {
          requestsPerMinute: 100,
          requestsPerHour: 5000,
          requestsPerDay: 50000
        }
      case 'enterprise':
        return {
          requestsPerMinute: 500,
          requestsPerHour: 25000,
          requestsPerDay: 250000
        }
      default:
        return {
          requestsPerMinute: 30,
          requestsPerHour: 1000,
          requestsPerDay: 10000
        }
    }
  }

  /**
   * Create custom alert
   */
  static async createCustomAlert(
    productId: string,
    competitor: string,
    threshold: number,
    condition: 'above' | 'below' | 'change_percent',
    userId: string,
    planId: string
  ): Promise<CustomAlert> {
    // Check if custom alerts are allowed for the plan
    if (!PlanService.hasFeature(planId, 'customAlerts')) {
      throw new Error('Custom alerts not available in this plan')
    }

    // For now, we'll store custom alerts in the existing PriceAlert table
    // In a full implementation, you'd have a separate CustomAlert table
    const alert = await prisma.priceAlert.create({
      data: {
        productId,
        competitor,
        oldPrice: 0,
        newPrice: threshold,
        changePercent: condition === 'change_percent' ? threshold : 0,
        severity: 'medium',
        threshold,
        notes: `Custom alert: ${condition} ${threshold}`,
        userId
      }
    })

    return {
      id: alert.id,
      productId: alert.productId,
      competitor: alert.competitor,
      threshold: alert.threshold,
      condition: condition,
      isActive: true,
      createdAt: alert.timestamp
    }
  }

  /**
   * Export data based on plan capabilities
   */
  static async exportData(
    organizationId: string,
    dataType: 'products' | 'competitors' | 'analytics' | 'all',
    format: 'json' | 'csv' | 'excel',
    userId: string,
    planId: string
  ): Promise<{ data: any; format: string; filename: string }> {
    // Check if data export is allowed for the plan
    if (!PlanService.hasFeature(planId, 'dataExport')) {
      throw new Error('Data export not available in this plan')
    }

    let data: any = {}
    const timestamp = new Date().toISOString().split('T')[0]

    switch (dataType) {
      case 'products':
        data = await this.exportProducts(organizationId)
        break
      case 'competitors':
        data = await this.exportCompetitors(organizationId)
        break
      case 'analytics':
        data = await this.exportAnalytics(organizationId)
        break
      case 'all':
        data = {
          products: await this.exportProducts(organizationId),
          competitors: await this.exportCompetitors(organizationId),
          analytics: await this.exportAnalytics(organizationId)
        }
        break
    }

    const filename = `revsnap_export_${dataType}_${timestamp}.${format}`

    return { data, format, filename }
  }

  /**
   * Export products data
   */
  private static async exportProducts(organizationId: string) {
    const products = await prisma.product.findMany({
      where: { organizationId },
      include: {
        competitorData: {
          orderBy: { lastUpdated: 'desc' },
          take: 1
        }
      }
    })

    return products.map((product: any) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      brand: product.brand,
      yourPrice: product.yourPrice,
      currency: product.currency,
      isActive: product.isActive,
      createdAt: product.createdAt,
      latestCompetitorData: product.competitorData[0] || null
    }))
  }

  /**
   * Export competitors data
   */
  private static async exportCompetitors(organizationId: string) {
    const competitorData = await prisma.competitorData.findMany({
      where: {
        product: { organizationId }
      },
      include: {
        product: true
      },
      orderBy: { lastUpdated: 'desc' }
    })

    return competitorData.map((data: any) => ({
      id: data.id,
      productName: data.productName,
      competitor: data.competitor,
      currentPrice: data.currentPrice,
      previousPrice: data.previousPrice,
      priceChange: data.priceChange,
      lastUpdated: data.lastUpdated,
      source: data.source,
      availability: data.availability,
      rating: data.rating,
      reviewCount: data.reviewCount,
      url: data.url
    }))
  }

  /**
   * Export analytics data
   */
  private static async exportAnalytics(organizationId: string) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [products, alerts, trackingJobs] = await Promise.all([
      prisma.product.findMany({
        where: { organizationId },
        include: {
          competitorData: {
            where: { lastUpdated: { gte: thirtyDaysAgo } },
            orderBy: { lastUpdated: 'desc' }
          }
        }
      }),
      prisma.priceAlert.findMany({
        where: {
          product: { organizationId },
          timestamp: { gte: thirtyDaysAgo }
        },
        include: { product: true }
      }),
      prisma.trackingJob.findMany({
        where: {
          product: { organizationId }
        }
      })
    ])

    return {
      summary: {
        totalProducts: products.length,
        totalAlerts: alerts.length,
        activeTrackingJobs: trackingJobs.filter((job: any) => job.isActive).length,
        averagePriceChange: products.length > 0
          ? products.reduce((sum: number, product: any) => {
              const latestData = product.competitorData[0]
              return sum + (latestData?.priceChange || 0)
            }, 0) / products.length
          : 0
      },
      products: products.map((product: any) => ({
        id: product.id,
        name: product.name,
        competitorDataCount: product.competitorData.length,
        averagePriceChange: product.competitorData.length > 0
          ? product.competitorData.reduce((sum: number, data: any) => sum + (data.priceChange || 0), 0) / product.competitorData.length
          : 0
      })),
      alerts: alerts.map((alert: any) => ({
        id: alert.id,
        productName: alert.productName,
        competitor: alert.competitor,
        oldPrice: alert.oldPrice,
        newPrice: alert.newPrice,
        changePercent: alert.changePercent,
        severity: alert.severity,
        timestamp: alert.timestamp
      }))
    }
  }

  /**
   * Get user's API keys
   */
  static async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return apiKeys.map((key: any) => ({
      id: key.id,
      name: key.name,
      key: key.key,
      permissions: JSON.parse(key.permissions),
      isActive: key.isActive,
      lastUsed: key.lastUsed || undefined,
      expiresAt: key.expiresAt || undefined,
      createdAt: key.createdAt,
      userId: key.userId
    }))
  }

  /**
   * Revoke API key
   */
  static async revokeApiKey(apiKeyId: string, userId: string): Promise<void> {
    await prisma.apiKey.updateMany({
      where: {
        id: apiKeyId,
        userId
      },
      data: {
        isActive: false
      }
    })
  }
} 