import { CompetitorData, PriceAlert } from './competitor-tracking'

export interface MarketInsight {
  type: 'opportunity' | 'threat' | 'trend' | 'recommendation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  confidence: number
  dataPoints: any[]
  timestamp: Date
}

export interface PricePrediction {
  competitor: string
  predictedPrice: number
  confidence: number
  timeframe: '24h' | '7d' | '30d'
  factors: string[]
  timestamp: Date
}

export interface MarketTrend {
  direction: 'up' | 'down' | 'stable' | 'volatile'
  strength: number // 0-1
  duration: number // days
  confidence: number
  description: string
}

export class MarketIntelligenceService {
  private historicalData: Map<string, CompetitorData[]> = new Map()
  private insights: MarketInsight[] = []
  private predictions: PricePrediction[] = []

  // Analyze market position and generate insights
  analyzeMarketPosition(
    currentPrices: CompetitorData[], 
    yourPrice: number,
    historicalData?: CompetitorData[]
  ): {
    position: 'leader' | 'follower' | 'premium' | 'budget'
    percentile: number
    recommendations: MarketInsight[]
    opportunities: MarketInsight[]
    threats: MarketInsight[]
  } {
    const validPrices = currentPrices.filter(p => p.currentPrice > 0)
    if (validPrices.length === 0) {
      return {
        position: 'follower',
        percentile: 50,
        recommendations: [],
        opportunities: [],
        threats: []
      }
    }

    const sortedPrices = validPrices.sort((a, b) => a.currentPrice - b.currentPrice)
    const yourPosition = sortedPrices.findIndex(p => p.currentPrice >= yourPrice) + 1
    const percentile = (yourPosition / sortedPrices.length) * 100
    
    const averagePrice = validPrices.reduce((sum, p) => sum + p.currentPrice, 0) / validPrices.length
    const lowestPrice = sortedPrices[0].currentPrice
    const highestPrice = sortedPrices[sortedPrices.length - 1].currentPrice

    // Determine market position
    let position: 'leader' | 'follower' | 'premium' | 'budget'
    if (yourPrice <= lowestPrice * 1.05) {
      position = 'leader'
    } else if (yourPrice >= highestPrice * 0.95) {
      position = 'premium'
    } else if (yourPrice <= averagePrice) {
      position = 'follower'
    } else {
      position = 'budget'
    }

    // Generate insights
    const insights = this.generateInsights(currentPrices, yourPrice, position, percentile)
    const opportunities = insights.filter(i => i.type === 'opportunity')
    const threats = insights.filter(i => i.type === 'threat')

    return {
      position,
      percentile,
      recommendations: insights.filter(i => i.type === 'recommendation'),
      opportunities,
      threats
    }
  }

  // Generate AI-powered market insights
  private generateInsights(
    prices: CompetitorData[], 
    yourPrice: number, 
    position: string, 
    percentile: number
  ): MarketInsight[] {
    const insights: MarketInsight[] = []
    const averagePrice = prices.reduce((sum, p) => sum + p.currentPrice, 0) / prices.length
    const lowestPrice = Math.min(...prices.map(p => p.currentPrice))
    const highestPrice = Math.max(...prices.map(p => p.currentPrice))

    // Price gap analysis
    const priceGap = highestPrice - lowestPrice
    const priceGapPercentage = (priceGap / averagePrice) * 100

    if (priceGapPercentage > 30) {
      insights.push({
        type: 'opportunity',
        severity: 'high',
        title: 'High Price Dispersion Detected',
        description: `Price gap of ${priceGapPercentage.toFixed(1)}% indicates market inefficiency. Consider strategic pricing.`,
        confidence: 0.85,
        dataPoints: [priceGap, priceGapPercentage],
        timestamp: new Date()
      })
    }

    // Your position analysis
    if (position === 'premium' && percentile > 80) {
      insights.push({
        type: 'threat',
        severity: 'medium',
        title: 'Premium Position Risk',
        description: 'You are priced significantly above market average. Consider value-add strategies.',
        confidence: 0.75,
        dataPoints: [percentile, yourPrice, averagePrice],
        timestamp: new Date()
      })
    }

    if (position === 'leader' && percentile < 20) {
      insights.push({
        type: 'opportunity',
        severity: 'high',
        title: 'Market Leadership Opportunity',
        description: 'You have the lowest price. Consider gradual increases to maximize profit.',
        confidence: 0.90,
        dataPoints: [percentile, yourPrice, lowestPrice],
        timestamp: new Date()
      })
    }

    // Competitor analysis
    const amazonPrice = prices.find(p => p.competitor.toLowerCase().includes('amazon'))?.currentPrice
    const walmartPrice = prices.find(p => p.competitor.toLowerCase().includes('walmart'))?.currentPrice

    if (amazonPrice && walmartPrice) {
      const amazonWalmartGap = Math.abs(amazonPrice - walmartPrice)
      if (amazonWalmartGap > 10) {
        insights.push({
          type: 'trend',
          severity: 'medium',
          title: 'Major Retailer Price Divergence',
          description: `Amazon and Walmart prices differ by $${amazonWalmartGap.toFixed(2)}. Monitor for convergence.`,
          confidence: 0.70,
          dataPoints: [amazonPrice, walmartPrice, amazonWalmartGap],
          timestamp: new Date()
        })
      }
    }

    // Recommendations
    if (yourPrice > averagePrice * 1.1) {
      insights.push({
        type: 'recommendation',
        severity: 'high',
        title: 'Price Adjustment Recommended',
        description: `Consider lowering price to $${(averagePrice * 0.95).toFixed(2)} to be more competitive`,
        confidence: 0.80,
        dataPoints: [yourPrice, averagePrice, (averagePrice * 0.95)],
        timestamp: new Date()
      })
    }

    if (yourPrice < lowestPrice * 0.9) {
      insights.push({
        type: 'recommendation',
        severity: 'medium',
        title: 'Price Increase Opportunity',
        description: `You can increase price to $${(lowestPrice * 1.05).toFixed(2)} and still be competitive`,
        confidence: 0.75,
        dataPoints: [yourPrice, lowestPrice, (lowestPrice * 1.05)],
        timestamp: new Date()
      })
    }

    return insights
  }

  // Predict future price movements
  predictPriceMovements(
    historicalData: CompetitorData[],
    timeframe: '24h' | '7d' | '30d' = '7d'
  ): PricePrediction[] {
    const predictions: PricePrediction[] = []
    
    // Group by competitor
    const competitorGroups = new Map<string, CompetitorData[]>()
    historicalData.forEach(data => {
      if (!competitorGroups.has(data.competitor)) {
        competitorGroups.set(data.competitor, [])
      }
      competitorGroups.get(data.competitor)!.push(data)
    })

    competitorGroups.forEach((data, competitor) => {
      if (data.length < 3) return // Need at least 3 data points

      // Simple trend analysis
      const sortedData = data.sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime())
      const recentPrices = sortedData.slice(-3).map(d => d.currentPrice)
      
      // Calculate trend
      const trend = this.calculateTrend(recentPrices)
      const currentPrice = recentPrices[recentPrices.length - 1]
      
      // Predict based on trend
      let predictedPrice = currentPrice
      let confidence = 0.5
      const factors: string[] = []

      if (trend > 0.05) {
        predictedPrice = currentPrice * 1.02
        confidence = 0.7
        factors.push('Upward trend detected')
      } else if (trend < -0.05) {
        predictedPrice = currentPrice * 0.98
        confidence = 0.7
        factors.push('Downward trend detected')
      } else {
        predictedPrice = currentPrice
        confidence = 0.8
        factors.push('Stable pricing')
      }

      // Adjust for timeframe
      if (timeframe === '30d') {
        predictedPrice = currentPrice + (trend * currentPrice * 4) // 4 weeks
        confidence *= 0.8 // Less confident for longer timeframe
      }

      predictions.push({
        competitor,
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        confidence,
        timeframe,
        factors,
        timestamp: new Date()
      })
    })

    return predictions
  }

  // Calculate price trend
  private calculateTrend(prices: number[]): number {
    if (prices.length < 2) return 0
    
    const changes = []
    for (let i = 1; i < prices.length; i++) {
      changes.push((prices[i] - prices[i-1]) / prices[i-1])
    }
    
    return changes.reduce((sum, change) => sum + change, 0) / changes.length
  }

  // Analyze market trends
  analyzeMarketTrends(historicalData: CompetitorData[]): MarketTrend[] {
    const trends: MarketTrend[] = []
    
    // Overall market trend
    const allPrices = historicalData.map(d => d.currentPrice)
    const overallTrend = this.calculateTrend(allPrices)
    
    let direction: 'up' | 'down' | 'stable' | 'volatile'
    let strength = Math.abs(overallTrend)
    
    if (strength < 0.02) {
      direction = 'stable'
    } else if (strength > 0.1) {
      direction = 'volatile'
    } else if (overallTrend > 0) {
      direction = 'up'
    } else {
      direction = 'down'
    }

    trends.push({
      direction,
      strength: Math.min(strength * 10, 1), // Scale to 0-1
      duration: 7, // Assume 7 days of data
      confidence: 0.7,
      description: `Market is trending ${direction} with ${(strength * 100).toFixed(1)}% average change`
    })

    return trends
  }

  // Get competitive intelligence summary
  getCompetitiveIntelligence(
    currentPrices: CompetitorData[],
    yourPrice: number,
    historicalData?: CompetitorData[]
  ): {
    summary: string
    keyInsights: string[]
    recommendations: string[]
    riskLevel: 'low' | 'medium' | 'high'
  } {
    const analysis = this.analyzeMarketPosition(currentPrices, yourPrice, historicalData)
    const insights = this.generateInsights(currentPrices, yourPrice, analysis.position, analysis.percentile)
    
    const keyInsights = insights
      .filter(i => i.severity === 'high' || i.severity === 'critical')
      .map(i => i.title)
      .slice(0, 3)

    const recommendations = analysis.recommendations
      .map(r => r.description)
      .slice(0, 3)

    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    const threats = insights.filter(i => i.type === 'threat')
    if (threats.some(t => t.severity === 'critical')) {
      riskLevel = 'high'
    } else if (threats.some(t => t.severity === 'high')) {
      riskLevel = 'medium'
    }

    const summary = `Market analysis shows you are in ${analysis.position} position (${analysis.percentile.toFixed(1)}th percentile). ${threats.length} threats and ${analysis.opportunities.length} opportunities detected.`

    return {
      summary,
      keyInsights,
      recommendations,
      riskLevel
    }
  }

  // Store historical data for analysis
  storeHistoricalData(productId: string, data: CompetitorData[]): void {
    if (!this.historicalData.has(productId)) {
      this.historicalData.set(productId, [])
    }
    
    const existing = this.historicalData.get(productId)!
    existing.push(...data)
    
    // Keep only last 30 days of data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    this.historicalData.set(productId, existing.filter(d => new Date(d.lastUpdated) > thirtyDaysAgo))
  }

  // Get historical data for analysis
  getHistoricalData(productId: string): CompetitorData[] {
    return this.historicalData.get(productId) || []
  }
}

export const marketIntelligenceService = new MarketIntelligenceService() 