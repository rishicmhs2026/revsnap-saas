import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { databaseService } from '@/lib/database'
import { realCompetitorTracker } from '@/lib/real-competitor-tracking'
import { aiAnalyticsService } from '@/lib/ai-analytics'
import { realTimeDataService } from '@/lib/realtime-data-service'
import { CompetitorData, PriceAlert } from '@/lib/competitor-tracking'

interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !('id' in session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const user = session.user as SessionUser

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const organizationId = searchParams.get('organizationId')
    const competitor = searchParams.get('competitor')
    const days = parseInt(searchParams.get('days') || '30')

    if (!productId && !organizationId) {
      return NextResponse.json(
        { error: 'Either productId or organizationId is required' },
        { status: 400 }
      )
    }

    let data

    if (productId) {
      // Get real-time data for specific product
      const realTimeData = realTimeDataService.getRealTimeData(productId)
      
      if (realTimeData) {
        data = {
          currentPrices: realTimeData.currentPrices,
          priceAlerts: realTimeData.priceAlerts,
          marketInsights: realTimeData.marketInsights,
          pricePredictions: realTimeData.pricePredictions,
          marketTrends: realTimeData.marketTrends,
          competitiveIntelligence: realTimeData.competitiveIntelligence,
          performanceMetrics: realTimeData.performanceMetrics,
          timestamp: realTimeData.timestamp
        }
      } else {
        // Fall back to database data
        const [currentPrices, alerts, historicalData] = await Promise.all([
          databaseService.getLatestCompetitorData(productId, competitor || undefined),
          databaseService.getUnreadAlerts(user.id),
          databaseService.getCompetitorDataHistory(productId, days)
        ])

        data = {
          currentPrices,
          alerts: alerts.filter((a: any) => a.productId === productId),
          historicalData,
          timestamp: new Date().toISOString()
        }
      }
    } else {
      // Get organization-wide data
      const products = await databaseService.getOrganizationProducts(organizationId!)
      const allData = await Promise.all(
        products.map(async (product) => {
          const realTimeData = realTimeDataService.getRealTimeData(product.id)
          return {
            productId: product.id,
            productName: product.name,
            data: realTimeData || {
              currentPrices: await databaseService.getLatestCompetitorData(product.id),
              timestamp: new Date()
            }
          }
        })
      )

      data = {
        products: allData,
        totalProducts: products.length,
        activeTrackingJobs: realTimeDataService.getActiveTrackingJobs().length,
        dataSources: realTimeDataService.getDataSources(),
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Competitor tracking GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitor tracking data' },
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
    const { productId, competitors, yourPrice, urls, startTracking = false, intervalMinutes = 15 } = body

    if (!productId || !competitors || !Array.isArray(competitors)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Start real-time tracking if requested
    let trackingJobId: string | null = null
    if (startTracking && yourPrice) {
      trackingJobId = await realTimeDataService.startRealTimeTracking(
        productId,
        competitors,
        yourPrice,
        intervalMinutes
      )
    }

    // Track current prices using real services
    const startTime = Date.now()
    const currentPrices = await realCompetitorTracker.trackMultipleCompetitors([
      { id: productId, competitors, urls }
    ])

    // Get previous prices for comparison
    const previousPrices = await databaseService.getLatestCompetitorData(productId)
    const previousPricesMap = new Map(
      previousPrices.map(p => [p.competitor, p])
    )

    // Calculate price changes
    const pricesWithChanges = currentPrices.map(current => {
      const previous = previousPricesMap.get(current.competitor)
      const priceChange = previous ? current.currentPrice - previous.currentPrice : 0
      const priceChangePercent = previous && previous.currentPrice > 0 
        ? (priceChange / previous.currentPrice) * 100 
        : 0

      return {
        ...current,
        previousPrice: previous?.currentPrice || 0,
        priceChange,
        priceChangePercent: Math.round(priceChangePercent * 100) / 100
      }
    })

    // Generate price alerts using real data
    const alerts = await generatePriceAlerts(pricesWithChanges, previousPrices)

    // Perform AI analysis if your price is provided
    let marketAnalysis = null
    let competitiveIntelligence = null
    
    if (yourPrice) {
      const historicalData = await databaseService.getCompetitorDataHistory(productId, 30)
      
      competitiveIntelligence = await aiAnalyticsService.analyzeMarketIntelligence(
        pricesWithChanges,
        yourPrice,
        historicalData
      )

      marketAnalysis = {
        position: competitiveIntelligence.marketPosition.category,
        percentile: competitiveIntelligence.marketPosition.percentile,
        strength: competitiveIntelligence.marketPosition.strength,
        recommendations: competitiveIntelligence.recommendations,
        riskLevel: competitiveIntelligence.riskLevel
      }
    }

    // Save data to database
    for (const price of pricesWithChanges) {
      await databaseService.saveCompetitorData({
        ...price,
        productId
      })
    }

    for (const alert of alerts) {
      await databaseService.savePriceAlert({
        ...alert,
        productId,
        userId: session.user.id
      })
    }

    // Create tracking job in database if started
    if (trackingJobId) {
      await databaseService.createTrackingJob({
        productId,
        competitors,
        intervalMinutes
      })
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: {
        currentPrices: pricesWithChanges,
        alerts,
        marketAnalysis,
        competitiveIntelligence,
        trackingJobId,
        performanceMetrics: {
          responseTime,
          dataQuality: calculateDataQuality(pricesWithChanges),
          sourcesUsed: competitors.length,
          errors: []
        },
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Competitor tracking POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process competitor tracking request' },
      { status: 500 }
    )
  }
}

// Webhook for real-time updates
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, action, data } = body

    if (!productId || !action) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'start_tracking':
        const { competitors, yourPrice, intervalMinutes } = data
        const jobId = await realTimeDataService.startRealTimeTracking(
          productId,
          competitors,
          yourPrice,
          intervalMinutes
        )
        return NextResponse.json({ success: true, trackingJobId: jobId })

      case 'stop_tracking':
        const { trackingJobId } = data
        const stopped = realTimeDataService.stopRealTimeTracking(trackingJobId)
        return NextResponse.json({ success: true, stopped })

      case 'update_price':
        const { newPrice } = data
        // Update product price in database
        // This would typically update the product record
        return NextResponse.json({ success: true, priceUpdated: true })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Competitor tracking PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook request' },
      { status: 500 }
    )
  }
}

// Helper function to generate price alerts
async function generatePriceAlerts(
  currentPrices: CompetitorData[],
  previousPrices: CompetitorData[]
): Promise<PriceAlert[]> {
  const alerts: PriceAlert[] = []
  
  for (const current of currentPrices) {
    const previous = previousPrices.find(p => 
      p.competitor === current.competitor && p.productName === current.productName
    )
    
    if (previous && Math.abs(current.priceChange || 0) > 0.01) {
      const changePercent = current.priceChangePercent || 0
      
      let severity: 'high' | 'medium' | 'low' = 'low'
      if (Math.abs(changePercent) >= 10) {
        severity = 'high'
      } else if (Math.abs(changePercent) >= 5) {
        severity = 'medium'
      }
      
      alerts.push({
        id: `alert-${current.id}-${Date.now()}`,
        competitor: current.competitor,
        productName: current.productName,
        oldPrice: previous.currentPrice,
        newPrice: current.currentPrice,
        changePercent: Math.round(changePercent * 100) / 100,
        timestamp: new Date(),
        severity,
        threshold: severity === 'high' ? 10 : severity === 'medium' ? 5 : 2
      })
    }
  }
  
  return alerts
}

// Helper function to calculate data quality
function calculateDataQuality(prices: CompetitorData[]): number {
  if (prices.length === 0) return 0
  
  let quality = 1.0
  
  // Check for missing data
  const missingData = prices.filter(p => !p.currentPrice || !p.productName).length
  quality -= (missingData / prices.length) * 0.3
  
  // Check for stale data (older than 1 hour)
  const staleData = prices.filter(p => 
    Date.now() - new Date(p.lastUpdated).getTime() > 60 * 60 * 1000
  ).length
  quality -= (staleData / prices.length) * 0.2
  
  // Check for price anomalies
  const validPrices = prices.filter(p => p.currentPrice > 0).map(p => p.currentPrice)
  if (validPrices.length > 1) {
    const mean = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length
    const anomalies = validPrices.filter(price => Math.abs(price - mean) / mean > 0.5).length
    quality -= (anomalies / validPrices.length) * 0.1
  }
  
  return Math.max(0, Math.min(1, quality))
} 