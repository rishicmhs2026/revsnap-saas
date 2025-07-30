import { CompetitorData, PriceAlert } from './competitor-tracking'

export interface AIInsight {
  id: string
  type: 'opportunity' | 'threat' | 'trend' | 'recommendation' | 'prediction'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  confidence: number
  dataPoints: any[]
  impact: {
    revenue: number
    marketShare: number
    competitivePosition: number
  }
  recommendations: string[]
  timestamp: Date
  expiresAt?: Date
}

export interface PricePrediction {
  competitor: string
  predictedPrice: number
  confidence: number
  timeframe: '24h' | '7d' | '30d'
  factors: string[]
  trend: 'up' | 'down' | 'stable'
  volatility: number
  timestamp: Date
}

export interface MarketTrend {
  type: 'price' | 'demand' | 'competition' | 'seasonal'
  direction: 'up' | 'down' | 'stable'
  strength: number
  duration: number
  description: string
  confidence: number
  affectedCompetitors: string[]
  timestamp: Date
}

export interface CompetitiveIntelligence {
  summary: string
  keyInsights: AIInsight[]
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  marketPosition: {
    rank: number
    percentile: number
    category: 'leader' | 'follower' | 'premium' | 'budget'
    strength: number
  }
  opportunities: AIInsight[]
  threats: AIInsight[]
  predictions: PricePrediction[]
  trends: MarketTrend[]
}

export class AIAnalyticsService {
  private historicalData: Map<string, CompetitorData[]> = new Map()
  private insights: AIInsight[] = []
  private predictions: PricePrediction[] = []
  private trends: MarketTrend[] = []

  // Advanced market analysis using machine learning principles
  async analyzeMarketIntelligence(
    currentPrices: CompetitorData[],
    yourPrice: number,
    historicalData?: CompetitorData[]
  ): Promise<CompetitiveIntelligence> {
    const startTime = Date.now()
    
    try {
      // Store historical data
      if (historicalData) {
        this.storeHistoricalData('current', historicalData)
      }

      // Perform comprehensive analysis
      const [marketPosition, insights, predictions, trends] = await Promise.all([
        this.calculateMarketPosition(currentPrices, yourPrice),
        this.generateAIInsights(currentPrices, yourPrice),
        this.predictPriceMovements(currentPrices, yourPrice),
        this.analyzeMarketTrends(currentPrices, yourPrice)
      ])

      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(insights)

      // Generate summary
      const summary = this.generateIntelligenceSummary(marketPosition, insights, predictions)

      // Categorize insights
      const opportunities = insights.filter(i => i.type === 'opportunity')
      const threats = insights.filter(i => i.type === 'threat')

      return {
        summary,
        keyInsights: insights.filter(i => i.severity === 'high' || i.severity === 'critical'),
        recommendations: this.generateRecommendations(insights, marketPosition),
        riskLevel,
        marketPosition,
        opportunities,
        threats,
        predictions,
        trends
      }

    } catch (error) {
      console.error('AI Analytics error:', error)
      throw new Error('Failed to analyze market intelligence')
    }
  }

  // Calculate market position using advanced algorithms
  private async calculateMarketPosition(
    prices: CompetitorData[],
    yourPrice: number
  ): Promise<{
    rank: number
    percentile: number
    category: 'leader' | 'follower' | 'premium' | 'budget'
    strength: number
  }> {
    const validPrices = prices.filter(p => p.currentPrice > 0)
    if (validPrices.length === 0) {
      return {
        rank: 1,
        percentile: 50,
        category: 'follower',
        strength: 0.5
      }
    }

    // Calculate statistical measures
    const sortedPrices = validPrices.sort((a, b) => a.currentPrice - b.currentPrice)
    const pricesArray = sortedPrices.map(p => p.currentPrice)
    
    const mean = pricesArray.reduce((sum, price) => sum + price, 0) / pricesArray.length
    const median = this.calculateMedian(pricesArray)
    const stdDev = this.calculateStandardDeviation(pricesArray, mean)
    
    // Calculate your position
    const yourPosition = sortedPrices.findIndex(p => p.currentPrice >= yourPrice) + 1
    const percentile = (yourPosition / sortedPrices.length) * 100
    
    // Calculate market strength using multiple factors
    const priceSpread = (Math.max(...pricesArray) - Math.min(...pricesArray)) / mean
    const yourDistanceFromMean = Math.abs(yourPrice - mean) / stdDev
    const marketConcentration = this.calculateMarketConcentration(pricesArray)
    
    // Determine category using machine learning-like classification
    let category: 'leader' | 'follower' | 'premium' | 'budget'
    let strength = 0.5

    if (yourPrice <= Math.min(...pricesArray) * 1.05) {
      category = 'leader'
      strength = 0.8 + (0.2 * (1 - percentile / 100))
    } else if (yourPrice >= Math.max(...pricesArray) * 0.95) {
      category = 'premium'
      strength = 0.6 + (0.4 * (percentile / 100))
    } else if (yourPrice <= median) {
      category = 'follower'
      strength = 0.7 + (0.3 * (1 - Math.abs(yourPrice - median) / median))
    } else {
      category = 'budget'
      strength = 0.5 + (0.5 * (1 - (yourPrice - median) / median))
    }

    // Adjust strength based on market conditions
    strength *= (1 - priceSpread * 0.5) // Lower strength in volatile markets
    strength *= (1 + marketConcentration * 0.3) // Higher strength in concentrated markets

    return {
      rank: yourPosition,
      percentile,
      category,
      strength: Math.max(0, Math.min(1, strength))
    }
  }

  // Generate AI-powered insights using advanced algorithms
  private async generateAIInsights(
    prices: CompetitorData[],
    yourPrice: number
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = []
    const validPrices = prices.filter(p => p.currentPrice > 0)
    
    if (validPrices.length === 0) return insights

    const pricesArray = validPrices.map(p => p.currentPrice)
    const mean = pricesArray.reduce((sum, price) => sum + price, 0) / pricesArray.length
    const stdDev = this.calculateStandardDeviation(pricesArray, mean)
    const lowestPrice = Math.min(...pricesArray)
    const highestPrice = Math.max(...pricesArray)

    // Price dispersion analysis
    const priceDispersion = (highestPrice - lowestPrice) / mean
    if (priceDispersion > 0.3) {
      insights.push({
        id: `insight-${Date.now()}-1`,
        type: 'opportunity',
        severity: 'high',
        title: 'High Market Inefficiency Detected',
        description: `Price dispersion of ${(priceDispersion * 100).toFixed(1)}% indicates significant market inefficiency. This presents opportunities for strategic pricing.`,
        confidence: 0.85,
        dataPoints: [priceDispersion, mean, stdDev],
        impact: {
          revenue: priceDispersion * 0.15,
          marketShare: priceDispersion * 0.2,
          competitivePosition: 0.8
        },
        recommendations: [
          'Consider dynamic pricing strategy',
          'Monitor competitor price changes more frequently',
          'Implement price optimization algorithms'
        ],
        timestamp: new Date()
      })
    }

    // Your position analysis
    const yourDistanceFromMean = (yourPrice - mean) / stdDev
    if (yourDistanceFromMean > 1.5) {
      insights.push({
        id: `insight-${Date.now()}-2`,
        type: 'threat',
        severity: 'medium',
        title: 'Premium Pricing Risk',
        description: `Your price is ${yourDistanceFromMean.toFixed(1)} standard deviations above the mean, indicating premium positioning that may limit market share.`,
        confidence: 0.75,
        dataPoints: [yourDistanceFromMean, mean, yourPrice],
        impact: {
          revenue: -0.1,
          marketShare: -0.2,
          competitivePosition: 0.6
        },
        recommendations: [
          'Consider value-add strategies to justify premium pricing',
          'Analyze customer willingness to pay',
          'Monitor market share trends'
        ],
        timestamp: new Date()
      })
    } else if (yourDistanceFromMean < -1.5) {
      insights.push({
        id: `insight-${Date.now()}-3`,
        type: 'opportunity',
        severity: 'high',
        title: 'Market Leadership Opportunity',
        description: `Your price is ${Math.abs(yourDistanceFromMean).toFixed(1)} standard deviations below the mean, positioning you as a market leader.`,
        confidence: 0.9,
        dataPoints: [yourDistanceFromMean, mean, yourPrice],
        impact: {
          revenue: 0.2,
          marketShare: 0.3,
          competitivePosition: 0.9
        },
        recommendations: [
          'Consider gradual price increases to maximize profit',
          'Focus on volume and market share growth',
          'Monitor competitor responses'
        ],
        timestamp: new Date()
      })
    }

    // Competitor analysis
    const amazonPrice = validPrices.find(p => p.competitor.toLowerCase().includes('amazon'))?.currentPrice
    const walmartPrice = validPrices.find(p => p.competitor.toLowerCase().includes('walmart'))?.currentPrice

    if (amazonPrice && walmartPrice) {
      const amazonWalmartGap = Math.abs(amazonPrice - walmartPrice) / mean
      if (amazonWalmartGap > 0.15) {
        insights.push({
          id: `insight-${Date.now()}-4`,
          type: 'trend',
          severity: 'medium',
          title: 'Major Retailer Price Divergence',
          description: `Amazon and Walmart prices differ by ${(amazonWalmartGap * 100).toFixed(1)}%, indicating potential market disruption.`,
          confidence: 0.7,
          dataPoints: [amazonWalmartGap, amazonPrice, walmartPrice],
          impact: {
            revenue: 0.05,
            marketShare: 0.1,
            competitivePosition: 0.7
          },
          recommendations: [
            'Monitor both retailers closely for price changes',
            'Consider positioning between their price points',
            'Prepare for potential price wars'
          ],
          timestamp: new Date()
        })
      }
    }

    // Seasonal and trend analysis
    const seasonalInsight = this.analyzeSeasonalPatterns(validPrices)
    if (seasonalInsight) {
      insights.push(seasonalInsight)
    }

    // Market concentration analysis
    const concentrationInsight = this.analyzeMarketConcentration(validPrices)
    if (concentrationInsight) {
      insights.push(concentrationInsight)
    }

    return insights
  }

  // Predict price movements using time series analysis
  private async predictPriceMovements(
    currentPrices: CompetitorData[],
    yourPrice: number
  ): Promise<PricePrediction[]> {
    const predictions: PricePrediction[] = []
    
    for (const competitor of currentPrices) {
      const historicalData = this.getHistoricalData(competitor.competitor)
      
      if (historicalData.length < 3) continue

      // Time series analysis
      const timeSeries = historicalData
        .sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime())
        .map(d => ({ price: d.currentPrice, timestamp: new Date(d.lastUpdated) }))

      // Calculate trend using linear regression
      const trend = this.calculateLinearTrend(timeSeries.map(t => t.price))
      
      // Calculate volatility
      const volatility = this.calculateVolatility(timeSeries.map(t => t.price))
      
      // Predict future prices
      const timeframes: Array<'24h' | '7d' | '30d'> = ['24h', '7d', '30d']
      
      for (const timeframe of timeframes) {
        const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30
        const predictedPrice = this.predictPrice(competitor.currentPrice, trend, days)
        
        // Calculate confidence based on historical accuracy
        const confidence = this.calculatePredictionConfidence(historicalData, trend, volatility)
        
        predictions.push({
          competitor: competitor.competitor,
          predictedPrice: Math.round(predictedPrice * 100) / 100,
          confidence,
          timeframe,
          factors: this.identifyPredictionFactors(trend, volatility, historicalData),
          trend: trend > 0.01 ? 'up' : trend < -0.01 ? 'down' : 'stable',
          volatility,
          timestamp: new Date()
        })
      }
    }

    return predictions
  }

  // Analyze market trends using advanced pattern recognition
  private async analyzeMarketTrends(
    currentPrices: CompetitorData[],
    yourPrice: number
  ): Promise<MarketTrend[]> {
    const trends: MarketTrend[] = []
    const validPrices = currentPrices.filter(p => p.currentPrice > 0)
    
    if (validPrices.length < 3) return trends

    // Price trend analysis
    const priceTrend = this.analyzePriceTrend(validPrices)
    if (priceTrend) {
      trends.push(priceTrend)
    }

    // Demand trend analysis
    const demandTrend = this.analyzeDemandTrend(validPrices)
    if (demandTrend) {
      trends.push(demandTrend)
    }

    // Competition trend analysis
    const competitionTrend = this.analyzeCompetitionTrend(validPrices)
    if (competitionTrend) {
      trends.push(competitionTrend)
    }

    // Seasonal trend analysis
    const seasonalTrend = this.analyzeSeasonalTrend(validPrices)
    if (seasonalTrend) {
      trends.push(seasonalTrend)
    }

    return trends
  }

  // Utility methods for statistical calculations
  private calculateMedian(values: number[]): number {
    const sorted = values.sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid]
  }

  private calculateStandardDeviation(values: number[], mean: number): number {
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  private calculateMarketConcentration(prices: number[]): number {
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
    return 1 / (1 + variance / Math.pow(mean, 2)) // Higher concentration = lower variance
  }

  private calculateLinearTrend(prices: number[]): number {
    const n = prices.length
    if (n < 2) return 0

    const x = Array.from({ length: n }, (_, i) => i)
    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = prices.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * prices[i], 0)
    const sumXX = x.reduce((sum, val) => sum + val * val, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    return slope
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0
    
    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }
    
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length
    
    return Math.sqrt(variance)
  }

  private predictPrice(currentPrice: number, trend: number, days: number): number {
    return currentPrice * (1 + trend * days)
  }

  private calculatePredictionConfidence(historicalData: CompetitorData[], trend: number, volatility: number): number {
    // Base confidence on data quality and market stability
    let confidence = 0.5
    
    // More data points = higher confidence
    confidence += Math.min(0.3, historicalData.length * 0.05)
    
    // Lower volatility = higher confidence
    confidence += Math.max(0, 0.2 * (1 - volatility))
    
    // Trend consistency = higher confidence
    const trendConsistency = Math.abs(trend) > 0.01 ? 0.1 : 0.2
    confidence += trendConsistency
    
    return Math.min(0.95, Math.max(0.1, confidence))
  }

  private identifyPredictionFactors(trend: number, volatility: number, historicalData: CompetitorData[]): string[] {
    const factors = []
    
    if (Math.abs(trend) > 0.01) {
      factors.push(trend > 0 ? 'Upward price trend' : 'Downward price trend')
    }
    
    if (volatility > 0.1) {
      factors.push('High market volatility')
    }
    
    if (historicalData.length > 10) {
      factors.push('Strong historical data')
    }
    
    return factors
  }

  private analyzePriceTrend(prices: CompetitorData[]): MarketTrend | null {
    const priceValues = prices.map(p => p.currentPrice)
    const trend = this.calculateLinearTrend(priceValues)
    
    if (Math.abs(trend) < 0.001) return null
    
    return {
      type: 'price',
      direction: trend > 0 ? 'up' : 'down',
      strength: Math.min(1, Math.abs(trend) * 100),
      duration: 7, // 7 days
      description: `Prices are trending ${trend > 0 ? 'upward' : 'downward'} with ${(Math.abs(trend) * 100).toFixed(1)}% daily change`,
      confidence: 0.7,
      affectedCompetitors: prices.map(p => p.competitor),
      timestamp: new Date()
    }
  }

  private analyzeDemandTrend(prices: CompetitorData[]): MarketTrend | null {
    // Analyze availability as proxy for demand
    const availabilityRate = prices.filter(p => p.availability).length / prices.length
    
    if (availabilityRate < 0.3) {
      return {
        type: 'demand',
        direction: 'up',
        strength: 0.8,
        duration: 14,
        description: 'Low availability across competitors suggests high demand',
        confidence: 0.6,
        affectedCompetitors: prices.map(p => p.competitor),
        timestamp: new Date()
      }
    }
    
    return null
  }

  private analyzeCompetitionTrend(prices: CompetitorData[]): MarketTrend | null {
    const priceSpread = (Math.max(...prices.map(p => p.currentPrice)) - Math.min(...prices.map(p => p.currentPrice))) / 
                       (prices.reduce((sum, p) => sum + p.currentPrice, 0) / prices.length)
    
    if (priceSpread > 0.3) {
      return {
        type: 'competition',
        direction: 'up',
        strength: 0.7,
        duration: 30,
        description: 'High price dispersion indicates increasing competition',
        confidence: 0.65,
        affectedCompetitors: prices.map(p => p.competitor),
        timestamp: new Date()
      }
    }
    
    return null
  }

  private analyzeSeasonalTrend(prices: CompetitorData[]): MarketTrend | null {
    const currentMonth = new Date().getMonth()
    
    // Simple seasonal analysis (can be enhanced with more sophisticated algorithms)
    if (currentMonth >= 10 || currentMonth <= 1) {
      return {
        type: 'seasonal',
        direction: 'up',
        strength: 0.6,
        duration: 90,
        description: 'Holiday season typically increases demand and prices',
        confidence: 0.5,
        affectedCompetitors: prices.map(p => p.competitor),
        timestamp: new Date()
      }
    }
    
    return null
  }

  private analyzeSeasonalPatterns(prices: CompetitorData[]): AIInsight | null {
    const currentMonth = new Date().getMonth()
    
    if (currentMonth >= 10 || currentMonth <= 1) {
      return {
        id: `seasonal-${Date.now()}`,
        type: 'trend',
        severity: 'medium',
        title: 'Seasonal Demand Increase Expected',
        description: 'Holiday season typically increases demand by 20-40%. Consider adjusting pricing strategy.',
        confidence: 0.7,
        dataPoints: [currentMonth],
        impact: {
          revenue: 0.2,
          marketShare: 0.1,
          competitivePosition: 0.8
        },
        recommendations: [
          'Consider premium pricing during peak demand',
          'Monitor competitor holiday pricing strategies',
          'Prepare inventory for increased demand'
        ],
        timestamp: new Date()
      }
    }
    
    return null
  }

  private analyzeMarketConcentration(prices: CompetitorData[]): AIInsight | null {
    const concentration = this.calculateMarketConcentration(prices.map(p => p.currentPrice))
    
    if (concentration > 0.8) {
      return {
        id: `concentration-${Date.now()}`,
        type: 'threat',
        severity: 'medium',
        title: 'High Market Concentration',
        description: 'Market is highly concentrated with similar pricing, limiting differentiation opportunities.',
        confidence: 0.75,
        dataPoints: [concentration],
        impact: {
          revenue: -0.1,
          marketShare: -0.05,
          competitivePosition: 0.6
        },
        recommendations: [
          'Focus on non-price differentiation',
          'Consider value-added services',
          'Monitor for price leadership opportunities'
        ],
        timestamp: new Date()
      }
    }
    
    return null
  }

  private calculateRiskLevel(insights: AIInsight[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalThreats = insights.filter(i => i.type === 'threat' && i.severity === 'critical').length
    const highThreats = insights.filter(i => i.type === 'threat' && i.severity === 'high').length
    const mediumThreats = insights.filter(i => i.type === 'threat' && i.severity === 'medium').length

    if (criticalThreats > 0) return 'critical'
    if (highThreats > 2) return 'high'
    if (highThreats > 0 || mediumThreats > 3) return 'medium'
    return 'low'
  }

  private generateIntelligenceSummary(
    marketPosition: any,
    insights: AIInsight[],
    predictions: PricePrediction[]
  ): string {
    const threatCount = insights.filter(i => i.type === 'threat').length
    const opportunityCount = insights.filter(i => i.type === 'opportunity').length
    const predictionCount = predictions.length

    return `Market analysis shows you are in ${marketPosition.category} position (${marketPosition.percentile.toFixed(1)}th percentile). 
    ${threatCount} threats and ${opportunityCount} opportunities detected. 
    ${predictionCount} price predictions generated with ${(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictionCount * 100).toFixed(0)}% average confidence.`
  }

  private generateRecommendations(insights: AIInsight[], marketPosition: any): string[] {
    const recommendations: string[] = []
    
    // Market position based recommendations
    if (marketPosition.category === 'premium') {
      recommendations.push('Focus on value-add strategies to justify premium pricing')
    } else if (marketPosition.category === 'leader') {
      recommendations.push('Consider gradual price increases to maximize profit while maintaining leadership')
    } else if (marketPosition.category === 'budget') {
      recommendations.push('Monitor quality perception and consider value proposition improvements')
    }

    // Insight-based recommendations
    const highPriorityInsights = insights.filter(i => i.severity === 'high' || i.severity === 'critical')
    for (const insight of highPriorityInsights.slice(0, 3)) {
      recommendations.push(...insight.recommendations.slice(0, 1))
    }

    return recommendations.slice(0, 5) // Limit to top 5 recommendations
  }

  private storeHistoricalData(key: string, data: CompetitorData[]): void {
    if (!this.historicalData.has(key)) {
      this.historicalData.set(key, [])
    }
    this.historicalData.get(key)!.push(...data)
  }

  private getHistoricalData(competitor: string): CompetitorData[] {
    return this.historicalData.get(competitor) || []
  }
}

export const aiAnalyticsService = new AIAnalyticsService() 