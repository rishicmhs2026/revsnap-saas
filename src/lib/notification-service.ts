import { prisma } from '@/lib/prisma'

export interface CreateNotificationParams {
  organizationId: string
  productId: string
  type: 'price_change' | 'competitor_found' | 'tracking_updated' | 'system_alert'
  severity: 'low' | 'medium' | 'high'
  title: string
  message: string
  currentPrice?: number
  previousPrice?: number
  competitorName?: string
  priceChangePercent?: number
}

/**
 * Creates a price alert notification for premium users
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    // Check if organization has active subscription (premium feature)
    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: params.organizationId,
        status: 'active'
      }
    })

    if (!subscription) {
      // Notifications are premium-only, skip for free users
      return null
    }

    // Create price alert as notification
    const notification = await prisma.priceAlert.create({
      data: {
        productId: params.productId,
        severity: params.severity,
        message: params.message,
        acknowledged: false,
        currentPrice: params.currentPrice,
        previousPrice: params.previousPrice,
        priceChangePercent: params.priceChangePercent
      }
    })

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

/**
 * Creates a price change notification
 */
export async function createPriceChangeNotification(
  organizationId: string,
  productId: string,
  productName: string,
  competitorName: string,
  currentPrice: number,
  previousPrice: number
) {
  const priceChangePercent = ((currentPrice - previousPrice) / previousPrice) * 100
  const isIncrease = currentPrice > previousPrice
  const severity = Math.abs(priceChangePercent) > 10 ? 'high' : 
                   Math.abs(priceChangePercent) > 5 ? 'medium' : 'low'

  return createNotification({
    organizationId,
    productId,
    type: 'price_change',
    severity,
    title: 'Price Alert',
    message: `${competitorName} ${isIncrease ? 'increased' : 'decreased'} price of ${productName} by ${Math.abs(priceChangePercent).toFixed(1)}%`,
    currentPrice,
    previousPrice,
    competitorName,
    priceChangePercent
  })
}

/**
 * Creates a new competitor found notification
 */
export async function createCompetitorFoundNotification(
  organizationId: string,
  productId: string,
  productName: string,
  competitorName: string
) {
  return createNotification({
    organizationId,
    productId,
    type: 'competitor_found',
    severity: 'medium',
    title: 'New Competitor Found',
    message: `Discovered new competitor ${competitorName} selling ${productName}`,
    competitorName
  })
}

/**
 * Creates a tracking update notification
 */
export async function createTrackingUpdateNotification(
  organizationId: string,
  productId: string,
  productName: string,
  updatedCount: number
) {
  return createNotification({
    organizationId,
    productId,
    type: 'tracking_updated',
    severity: 'low',
    title: 'Tracking Updated',
    message: `Successfully updated prices for ${updatedCount} competitor${updatedCount === 1 ? '' : 's'} of ${productName}`
  })
}



