// Enhanced pricing algorithm with volume elasticity, break-even analysis, and data quality
export interface PricingStrategy {
  type: 'competitive' | 'volume_optimization' | 'market_penetration' | 'premium'
  confidence: number
  reasoning: string
  dataQuality: DataQuality
}

export interface DataQuality {
  score: number // 0-100
  sources: DataSource[]
  lastUpdated: Date
  confidence: number
  warnings: string[]
}

export interface DataSource {
  name: string
  type: 'api' | 'scraping' | 'manual' | 'historical'
  reliability: number
  lastUpdated: Date
  price?: number
}

export interface VolumeAnalysis {
  currentVolume: number
  targetVolume: number
  priceElasticity: number
  breakEvenPrice: number
  optimalPrice: number
  projectedProfit: number
}

export interface MarketPenetration {
  marketShare: number
  penetrationPrice: number
  timeToMarket: number
  competitiveResponse: string
}

export class EnhancedPricingEngine {
  // Volume elasticity modeling
  calculateVolumeOptimizedPrice(
    currentPrice: number,
    currentVolume: number,
    targetVolume: number,
    cost: number,
    priceElasticity: number = -1.5
  ): VolumeAnalysis {
    // Price elasticity formula: % change in quantity / % change in price
    const volumeMultiplier = targetVolume / currentVolume
    const priceChange = Math.pow(volumeMultiplier, 1 / priceElasticity)
    const volumeOptimizedPrice = currentPrice * priceChange
    
    // Break-even analysis
    const breakEvenPrice = cost * 1.1 // 10% minimum margin
    const optimalPrice = Math.max(volumeOptimizedPrice, breakEvenPrice)
    
    // Projected profit calculation
    const projectedProfit = (optimalPrice - cost) * targetVolume
    
    return {
      currentVolume,
      targetVolume,
      priceElasticity,
      breakEvenPrice,
      optimalPrice: Math.round(optimalPrice * 100) / 100,
      projectedProfit: Math.round(projectedProfit * 100) / 100
    }
  }

  // Market penetration pricing
  calculateMarketPenetrationPrice(
    competitorPrices: number[],
    cost: number,
    targetMarketShare: number
  ): MarketPenetration {
    const averageCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
    const lowestCompetitorPrice = Math.min(...competitorPrices)
    
    // Penetration pricing: 10-15% below lowest competitor
    const penetrationPrice = lowestCompetitorPrice * 0.85
    
    // Ensure profitability
    const minPrice = cost * 1.2
    const finalPenetrationPrice = Math.max(penetrationPrice, minPrice)
    
    return {
      marketShare: targetMarketShare,
      penetrationPrice: Math.round(finalPenetrationPrice * 100) / 100,
      timeToMarket: 30, // days
      competitiveResponse: 'Expected competitive response within 30-60 days'
    }
  }

  // Data quality scoring
  calculateDataQuality(sources: DataSource[]): DataQuality {
    if (sources.length === 0) {
      return {
        score: 0,
        sources: [],
        lastUpdated: new Date(),
        confidence: 0,
        warnings: ['No data sources available']
      }
    }

    const totalReliability = sources.reduce((sum, source) => sum + source.reliability, 0)
    const averageReliability = totalReliability / sources.length
    
    // Weight by data freshness
    const now = new Date()
    const freshnessScore = sources.reduce((sum, source) => {
      const hoursOld = (now.getTime() - source.lastUpdated.getTime()) / (1000 * 60 * 60)
      const freshness = Math.max(0, 1 - hoursOld / 24) // 24 hours = 0 score
      return sum + freshness
    }, 0) / sources.length

    const score = Math.round((averageReliability * 0.7 + freshnessScore * 0.3) * 100)
    const confidence = Math.min(score / 100, 1)

    const warnings: string[] = []
    if (score < 50) warnings.push('Low data quality - results may be inaccurate')
    if (sources.every(s => s.type === 'manual')) warnings.push('All data is manually entered')
    if (sources.some(s => s.type === 'scraping')) warnings.push('Some data from web scraping - may be unreliable')

    return {
      score,
      sources,
      lastUpdated: new Date(Math.max(...sources.map(s => s.lastUpdated.getTime()))),
      confidence,
      warnings
    }
  }

  // Main pricing strategy selection
  selectPricingStrategy(
    currentPrice: number,
    cost: number,
    competitorPrices: number[],
    dataQuality: DataQuality,
    businessGoals: {
      targetVolume?: number
      currentVolume?: number
      marketShare?: number
      strategy?: 'competitive' | 'volume' | 'penetration' | 'premium'
    }
  ): PricingStrategy {
    // Require real data for recommendations
    if (dataQuality.score < 30) {
      return {
        type: 'competitive',
        confidence: 0,
        reasoning: 'Insufficient data quality for reliable pricing recommendations',
        dataQuality
      }
    }

    const averageCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
    const isOverpriced = currentPrice > averageCompetitorPrice * 1.2
    const isUnderpriced = currentPrice < averageCompetitorPrice * 0.8

    // Strategy selection based on business goals and market position
    if (businessGoals.strategy === 'volume' || (isOverpriced && businessGoals.targetVolume)) {
      const volumeAnalysis = this.calculateVolumeOptimizedPrice(
        currentPrice,
        businessGoals.currentVolume || 100,
        businessGoals.targetVolume || 150,
        cost
      )
      
      return {
        type: 'volume_optimization',
        confidence: dataQuality.confidence * 0.8,
        reasoning: `Volume optimization: Lower price to $${volumeAnalysis.optimalPrice} to achieve ${businessGoals.targetVolume} units (from ${businessGoals.currentVolume})`,
        dataQuality
      }
    }

    if (businessGoals.strategy === 'penetration' || businessGoals.marketShare) {
      const penetration = this.calculateMarketPenetrationPrice(
        competitorPrices,
        cost,
        businessGoals.marketShare || 10
      )
      
      return {
        type: 'market_penetration',
        confidence: dataQuality.confidence * 0.7,
        reasoning: `Market penetration: Price at $${penetration.penetrationPrice} to gain market share`,
        dataQuality
      }
    }

    // Default competitive pricing
    const competitivePrice = averageCompetitorPrice * 0.95
    return {
      type: 'competitive',
      confidence: dataQuality.confidence,
      reasoning: `Competitive pricing: Price at $${competitivePrice.toFixed(2)} (5% below market average)`,
      dataQuality
    }
  }

  // Demand forecasting (simplified)
  forecastDemand(
    historicalPrices: number[],
    historicalVolumes: number[],
    priceElasticity: number = -1.5
  ): { predictedVolume: number; confidence: number } {
    if (historicalPrices.length < 2 || historicalVolumes.length < 2) {
      return { predictedVolume: 0, confidence: 0 }
    }

    // Simple linear regression for demand forecasting
    const avgPrice = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length
    const avgVolume = historicalVolumes.reduce((a, b) => a + b, 0) / historicalVolumes.length
    
    // Use price elasticity to predict volume change
    const predictedVolume = avgVolume * Math.pow(avgPrice / avgPrice, priceElasticity)
    
    return {
      predictedVolume: Math.round(predictedVolume),
      confidence: Math.min(historicalPrices.length / 10, 1) // More data = higher confidence
    }
  }
}
