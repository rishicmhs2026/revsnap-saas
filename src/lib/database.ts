import { prisma } from './prisma'
import { CompetitorData, PriceAlert } from './competitor-tracking'

export class DatabaseService {
  // Check if database is available
  private async isDatabaseAvailable(): Promise<boolean> {
    try {
      if (!prisma) return false
      await prisma.$connect()
      return true
    } catch (error) {
      console.warn('Database not available:', error)
      return false
    }
  }
  // User operations
  async createUser(data: {
    email: string
    name?: string
    password?: string
    image?: string
  }) {
    return await prisma.user.create({
      data
    })
  }

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        organizations: true,
        products: true
      }
    })
  }

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  async updateUser(id: string, data: {
    name?: string
    email?: string
    password?: string
    image?: string
  }) {
    return await prisma.user.update({
      where: { id },
      data
    })
  }

  // Password reset operations
  async savePasswordResetToken(data: {
    userId: string
    token: string
    expiresAt: Date
  }) {
    return await prisma.passwordResetToken.create({
      data
    })
  }

  async validatePasswordResetToken(token: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return null
    }

    return resetToken
  }

  async deletePasswordResetToken(token: string) {
    return await prisma.passwordResetToken.delete({
      where: { token }
    })
  }

  // Session management operations
  async getUserSessions(userId: string) {
    return await prisma.session.findMany({
      where: { userId },
      orderBy: { expires: 'desc' }
    })
  }

  async revokeSession(sessionId: string, userId: string) {
    return await prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId
      }
    })
  }

  // Organization operations
  async createOrganization(data: {
    name: string
    slug: string
    description?: string
    userId: string
    industry?: string
    size?: string
  }) {
    return await prisma.organization.create({
      data,
      include: {
        user: true,
        members: true
      }
    })
  }

  async getOrganizationBySlug(slug: string) {
    return await prisma.organization.findUnique({
      where: { slug },
      include: {
        user: true,
        members: {
          include: {
            user: true
          }
        },
        products: true
      }
    })
  }

  async getUserOrganizations(userId: string) {
    return await prisma.organization.findMany({
      where: {
        OR: [
          { userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        user: true,
        members: {
          include: {
            user: true
          }
        }
      }
    })
  }

  // Product operations
  async createProduct(data: {
    name: string
    description?: string
    sku?: string
    category?: string
    brand?: string
    image?: string
    url?: string
    yourPrice?: number
    currency?: string
    organizationId: string
    userId: string
  }) {
    return await prisma.product.create({
      data,
      include: {
        organization: true,
        competitorData: {
          orderBy: { lastUpdated: 'desc' },
          take: 10
        }
      }
    })
  }

  async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        organization: true,
        competitorData: {
          orderBy: { lastUpdated: 'desc' }
        },
        priceAlerts: {
          orderBy: { timestamp: 'desc' }
        },
        trackingJobs: true
      }
    })
  }

  async getOrganizationProducts(organizationId: string) {
    return await prisma.product.findMany({
      where: { organizationId },
      include: {
        competitorData: {
          orderBy: { lastUpdated: 'desc' },
          take: 5
        },
        priceAlerts: {
          where: { isRead: false },
          orderBy: { timestamp: 'desc' }
        }
      }
    })
  }

  // Competitor data operations
  async saveCompetitorData(data: CompetitorData & { productId: string; metadata?: any }) {
    return await prisma.competitorData.create({
      data: {
        competitor: data.competitor,
        productName: data.productName,
        currentPrice: data.currentPrice,
        previousPrice: data.previousPrice,
        priceChange: data.priceChange,
        source: data.source,
        availability: data.availability,
        currency: data.currency,
        shipping: data.shipping,
        rating: data.rating,
        reviewCount: data.reviewCount,
        url: data.url,
        metadata: data.metadata || {},
        productId: data.productId
      }
    })
  }

  async getLatestCompetitorData(productId: string, competitor?: string) {
    const where: any = { productId }
    if (competitor) {
      where.competitor = competitor
    }

    return await prisma.competitorData.findMany({
      where,
      orderBy: { lastUpdated: 'desc' },
      take: 1
    })
  }

  async getCompetitorDataHistory(productId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return await prisma.competitorData.findMany({
      where: {
        productId,
        lastUpdated: {
          gte: startDate
        }
      },
      orderBy: { lastUpdated: 'asc' }
    })
  }

  // Price alert operations
  async savePriceAlert(data: PriceAlert & { productId: string, userId: string }) {
    return await prisma.priceAlert.create({
      data: {
        competitor: data.competitor,
        productName: data.productName,
        oldPrice: data.oldPrice,
        newPrice: data.newPrice,
        changePercent: data.changePercent,
        severity: data.severity,
        threshold: data.threshold,
        productId: data.productId,
        userId: data.userId
      }
    })
  }

  async getUnreadAlerts(userId: string) {
    return await prisma.priceAlert.findMany({
      where: {
        userId,
        isRead: false
      },
      include: {
        product: true
      },
      orderBy: { timestamp: 'desc' }
    })
  }

  async markAlertAsRead(alertId: string) {
    return await prisma.priceAlert.update({
      where: { id: alertId },
      data: { isRead: true }
    })
  }

  // Tracking job operations
  async createTrackingJob(data: {
    productId: string
    competitors: string[]
    intervalMinutes: number
  }) {
    return await prisma.trackingJob.create({
      data: {
        ...data,
        competitors: JSON.stringify(data.competitors),
        nextRun: new Date(Date.now() + data.intervalMinutes * 60 * 1000)
      }
    })
  }

  async getActiveTrackingJobs() {
    return await prisma.trackingJob.findMany({
      where: {
        isActive: true,
        nextRun: {
          lte: new Date()
        }
      },
      include: {
        product: true
      }
    })
  }

  async updateTrackingJob(id: string, data: {
    lastRun?: Date
    nextRun?: Date
    isActive?: boolean
  }) {
    return await prisma.trackingJob.update({
      where: { id },
      data
    })
  }

  // Subscription operations
  async createSubscription(data: {
    organizationId: string
    userId: string
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    stripePriceId?: string
    status: string
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
  }) {
    return await prisma.subscription.create({
      data,
      include: {
        organization: true,
        user: true
      }
    })
  }

  async getActiveSubscription(organizationId: string) {
    return await prisma.subscription.findFirst({
      where: {
        organizationId,
        status: 'active'
      },
      include: {
        organization: true
      }
    })
  }

  // API Key operations
  async createApiKey(data: {
    name: string
    key: string
    permissions: string[]
    userId: string
    expiresAt?: Date
  }) {
    return await prisma.apiKey.create({
      data: {
        ...data,
        permissions: JSON.stringify(data.permissions)
      }
    })
  }

  async validateApiKey(key: string) {
    const apiKey = await prisma.apiKey.findUnique({
      where: { key },
      include: {
        user: true
      }
    })

    if (!apiKey || !apiKey.isActive) {
      return null
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsed: new Date() }
    })

    return apiKey
  }

  // Analytics and reporting
  async getProductAnalytics(productId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [priceHistory, alerts, trackingStats] = await Promise.all([
      prisma.competitorData.findMany({
        where: {
          productId,
          lastUpdated: { gte: startDate }
        },
        orderBy: { lastUpdated: 'asc' }
      }),
      prisma.priceAlert.findMany({
        where: {
          productId,
          timestamp: { gte: startDate }
        },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.trackingJob.findMany({
        where: { productId }
      })
    ])

    return {
      priceHistory,
      alerts,
      trackingStats,
      totalAlerts: alerts.length,
      highSeverityAlerts: alerts.filter((a: any) => a.severity === 'high').length,
      averagePriceChange: priceHistory.length > 0 
        ? priceHistory.reduce((sum: number, p: any) => sum + (p.priceChange || 0), 0) / priceHistory.length
        : 0
    }
  }

  async getOrganizationAnalytics(organizationId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [products, alerts, trackingJobs] = await Promise.all([
      prisma.product.findMany({
        where: { organizationId },
        include: {
          competitorData: {
            where: { lastUpdated: { gte: startDate } },
            orderBy: { lastUpdated: 'desc' },
            take: 1
          }
        }
      }),
      prisma.priceAlert.findMany({
        where: {
          product: { organizationId },
          timestamp: { gte: startDate }
        },
        include: { product: true }
      }),
      prisma.trackingJob.findMany({
        where: {
          product: { organizationId },
          isActive: true
        }
      })
    ])

    return {
      totalProducts: products.length,
      activeTrackingJobs: trackingJobs.length,
      totalAlerts: alerts.length,
      unreadAlerts: alerts.filter((a: any) => !a.isRead).length,
      highSeverityAlerts: alerts.filter((a: any) => a.severity === 'high').length,
      averagePriceChange: products.length > 0
        ? products.reduce((sum: number, p: any) => {
            const latestData = p.competitorData[0]
            return sum + (latestData?.priceChange || 0)
          }, 0) / products.length
        : 0
    }
  }
}

export const databaseService = new DatabaseService() 