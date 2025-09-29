import { CompetitorData, PriceAlert } from './competitor-tracking'
import { AIInsight, PricePrediction, MarketTrend } from './ai-analytics'
import { realCompetitorTracker } from './real-competitor-tracking'
import { aiAnalyticsService } from './ai-analytics'

export interface RealTimeData {
  timestamp: Date
  currentPrices: CompetitorData[]
  priceAlerts: PriceAlert[]
  marketInsights: AIInsight[]
  pricePredictions: PricePrediction[]
  marketTrends: MarketTrend[]
  competitiveIntelligence: {
    summary: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    marketPosition: {
      rank: number
      percentile: number
      category: string
      strength: number
    }
  }
  performanceMetrics: {
    responseTime: number
    dataQuality: number
    lastUpdate: Date
    errors: string[]
  }
}

export interface DataSource {
  id: string
  name: string
  type: 'scraping' | 'api' | 'webhook' | 'database'
  status: 'active' | 'inactive' | 'error'
  lastUpdate: Date
  responseTime: number
  errorCount: number
  successRate: number
}

export class RealTimeDataService {
  private activeTrackingJobs: Map<string, NodeJS.Timeout> = new Map()
  private dataSources: Map<string, DataSource> = new Map()
  private realTimeData: Map<string, RealTimeData> = new Map()
  private subscribers: Map<string, Set<(data: RealTimeData) => void>> = new Map()
  private isRunning = false

  constructor() {
    this.initializeDataSources()
  }

  // Initialize data sources
  private initializeDataSources(): void {
    const sources: DataSource[] = [
      {
        id: 'amazon-scraper',
        name: 'Amazon Web Scraper',
        type: 'scraping',
        status: 'active',
        lastUpdate: new Date(),
        responseTime: 0,
        errorCount: 0,
        successRate: 1.0
      },
      {
        id: 'bestbuy-scraper',
        name: 'Best Buy Web Scraper',
        type: 'scraping',
        status: 'active',
        lastUpdate: new Date(),
        responseTime: 0,
        errorCount: 0,
        successRate: 1.0
      },
      {
        id: 'walmart-scraper',
        name: 'Walmart Web Scraper',
        type: 'scraping',
        status: 'active',
        lastUpdate: new Date(),
        responseTime: 0,
        errorCount: 0,
        successRate: 1.0
      },
      {
        id: 'amazon-api',
        name: 'Amazon API',
        type: 'api',
        status: process.env.RAINFOREST_API_KEY ? 'active' : 'inactive',
        lastUpdate: new Date(),
        responseTime: 0,
        errorCount: 0,
        successRate: 1.0
      },
      {
        id: 'shopify-api',
        name: 'Shopify API',
        type: 'api',
        status: 'active',
        lastUpdate: new Date(),
        responseTime: 0,
        errorCount: 0,
        successRate: 1.0
      }
    ]

    sources.forEach(source => {
      this.dataSources.set(source.id, source)
    })
  }

  // Start real-time tracking for a product
  async startRealTimeTracking(
    productId: string,
    competitors: string[],
    yourPrice: number,
    intervalMinutes: number = 15
  ): Promise<string> {
    const jobId = `tracking-${productId}-${Date.now()}`
    
    if (this.activeTrackingJobs.has(jobId)) {
      throw new Error('Tracking job already exists for this product')
    }

    // Initial data fetch
    await this.fetchRealTimeData(productId, competitors, yourPrice)

    // Set up recurring job
    const interval = setInterval(async () => {
      try {
        await this.fetchRealTimeData(productId, competitors, yourPrice)
      } catch (error) {
        console.error(`Error in tracking job ${jobId}:`, error)
        this.updateDataSourceStatus('error', error instanceof Error ? error.message : 'Unknown error')
      }
    }, intervalMinutes * 60 * 1000)

    this.activeTrackingJobs.set(jobId, interval)
    
    return jobId
  }

  // Stop real-time tracking
  stopRealTimeTracking(jobId: string): boolean {
    const interval = this.activeTrackingJobs.get(jobId)
    if (interval) {
      clearInterval(interval)
      this.activeTrackingJobs.delete(jobId)
      return true
    }
    return false
  }

  // Fetch real-time data from multiple sources
  private async fetchRealTimeData(
    productId: string,
    competitors: string[],
    yourPrice: number
  ): Promise<RealTimeData> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      // Fetch current prices from real sources
      const currentPrices = await this.fetchCurrentPrices(productId, competitors, errors)
      
      // Generate price alerts
      const priceAlerts = await this.generatePriceAlerts(currentPrices, productId)
      
      // Get historical data for analysis
      const historicalData = await this.getHistoricalData(productId, competitors)
      
      // Perform AI analysis
      const intelligence = await aiAnalyticsService.analyzeMarketIntelligence(
        currentPrices,
        yourPrice,
        historicalData
      )

      // Create real-time data object
      const realTimeData: RealTimeData = {
        timestamp: new Date(),
        currentPrices,
        priceAlerts,
        marketInsights: intelligence.keyInsights,
        pricePredictions: intelligence.predictions,
        marketTrends: intelligence.trends,
        competitiveIntelligence: {
          summary: intelligence.summary,
          riskLevel: intelligence.riskLevel,
          marketPosition: intelligence.marketPosition
        },
        performanceMetrics: {
          responseTime: Date.now() - startTime,
          dataQuality: this.calculateDataQuality(currentPrices),
          lastUpdate: new Date(),
          errors
        }
      }

      // Store data
      this.realTimeData.set(productId, realTimeData)
      
      // Notify subscribers
      this.notifySubscribers(productId, realTimeData)
      
      // Update data source status
      this.updateDataSourceStatus('active')
      
      return realTimeData

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push(errorMessage)
      
      this.updateDataSourceStatus('error', errorMessage)
      
      throw new Error(`Failed to fetch real-time data: ${errorMessage}`)
    }
  }

  // Fetch current prices from real sources
  private async fetchCurrentPrices(
    productId: string,
    competitors: string[],
    errors: string[]
  ): Promise<CompetitorData[]> {
    const prices: CompetitorData[] = []
    
    for (const competitor of competitors) {
      try {
        const startTime = Date.now()
        let competitorData: CompetitorData | null = null

        // Try API first if available
        if (competitor.includes('_api') || competitor === 'shopify') {
          const result = await realCompetitorTracker.trackViaAPI(competitor, productId)
          if (result.success && result.data) {
            competitorData = result.data
          }
        } else {
          // Fall back to web scraping
          const url = this.generateCompetitorUrl(competitor, productId)
          const result = await realCompetitorTracker.scrapeCompetitor(url, competitor, productId)
          if (result.success && result.data) {
            competitorData = result.data
          }
        }

        if (competitorData) {
          prices.push(competitorData)
          
          // Update data source metrics
          this.updateDataSourceMetrics(competitor, Date.now() - startTime, true)
        } else {
          errors.push(`Failed to fetch data from ${competitor}`)
          this.updateDataSourceMetrics(competitor, 0, false)
        }

        // Rate limiting
        await this.delay(1000)

      } catch (error) {
        const errorMessage = `Error fetching from ${competitor}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMessage)
        this.updateDataSourceMetrics(competitor, 0, false)
      }
    }

    return prices
  }

  // Generate real price alerts
  private async generatePriceAlerts(
    currentPrices: CompetitorData[],
    productId: string
  ): Promise<PriceAlert[]> {
    const alerts: PriceAlert[] = []
    
    // Get previous prices for comparison
    const previousPrices = await this.getPreviousPrices(productId)
    
    for (const current of currentPrices) {
      const previous = previousPrices.find(p => 
        p.competitor === current.competitor && p.productName === current.productName
      )
      
      if (previous && Math.abs(current.currentPrice - previous.currentPrice) > 0.01) {
        const changePercent = ((current.currentPrice - previous.currentPrice) / previous.currentPrice) * 100
        
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

  // Get historical data for analysis
  private async getHistoricalData(
    productId: string,
    competitors: string[],
    days: number = 30
  ): Promise<CompetitorData[]> {
    // In a real implementation, this would fetch from database
    // For now, we'll generate some historical data based on current prices
    const historicalData: CompetitorData[] = []
    const currentPrices = await this.getCurrentPrices(productId)
    
    for (let i = days; i > 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      for (const current of currentPrices) {
        // Add some realistic variation
        const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
        const historicalPrice = current.currentPrice * (1 + variation)
        
        historicalData.push({
          ...current,
          id: `${current.id}-historical-${i}`,
          currentPrice: Math.round(historicalPrice * 100) / 100,
          lastUpdated: date
        })
      }
    }
    
    return historicalData
  }

  // Get previous prices for comparison
  private async getPreviousPrices(productId: string): Promise<CompetitorData[]> {
    // In a real implementation, this would fetch from database
    // For now, we'll return empty array to avoid circular dependency
    return []
  }

  // Get current prices from cache
  private async getCurrentPrices(productId: string): Promise<CompetitorData[]> {
    const data = this.realTimeData.get(productId)
    return data?.currentPrices || []
  }

  // Calculate data quality score
  private calculateDataQuality(prices: CompetitorData[]): number {
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

  // Generate competitor URL
  private generateCompetitorUrl(competitor: string, productId: string): string {
    const baseUrls: Record<string, string> = {
      'amazon': 'https://www.amazon.com/dp',
      'bestbuy': 'https://www.bestbuy.com/site',
      'walmart': 'https://www.walmart.com/ip',
      'target': 'https://www.target.com/p'
    }
    
    return `${baseUrls[competitor] || 'https://example.com'}/${productId}`
  }

  // Update data source metrics
  private updateDataSourceMetrics(competitor: string, responseTime: number, success: boolean): void {
    const sourceId = `${competitor}-${success ? 'scraper' : 'api'}`
    const source = this.dataSources.get(sourceId)
    
    if (source) {
      source.lastUpdate = new Date()
      source.responseTime = responseTime
      
      if (success) {
        source.errorCount = Math.max(0, source.errorCount - 1)
        source.successRate = Math.min(1, source.successRate + 0.01)
      } else {
        source.errorCount++
        source.successRate = Math.max(0, source.successRate - 0.05)
      }
      
      // Update status based on error count
      if (source.errorCount > 5) {
        source.status = 'error'
      } else if (source.errorCount > 2) {
        source.status = 'inactive'
      } else {
        source.status = 'active'
      }
    }
  }

  // Update data source status
  private updateDataSourceStatus(status: 'active' | 'inactive' | 'error', error?: string): void {
    this.dataSources.forEach(source => {
      if (source.status !== 'error') {
        source.status = status
      }
    })
  }

  // Subscribe to real-time updates
  subscribe(productId: string, callback: (data: RealTimeData) => void): () => void {
    if (!this.subscribers.has(productId)) {
      this.subscribers.set(productId, new Set())
    }
    
    this.subscribers.get(productId)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      const productSubscribers = this.subscribers.get(productId)
      if (productSubscribers) {
        productSubscribers.delete(callback)
        if (productSubscribers.size === 0) {
          this.subscribers.delete(productId)
        }
      }
    }
  }

  // Notify subscribers
  private notifySubscribers(productId: string, data: RealTimeData): void {
    const productSubscribers = this.subscribers.get(productId)
    if (productSubscribers) {
      productSubscribers.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in subscriber callback:', error)
        }
      })
    }
  }

  // Get real-time data for a product
  getRealTimeData(productId: string): RealTimeData | null {
    return this.realTimeData.get(productId) || null
  }

  // Get all data sources
  getDataSources(): DataSource[] {
    return Array.from(this.dataSources.values())
  }

  // Get active tracking jobs
  getActiveTrackingJobs(): string[] {
    return Array.from(this.activeTrackingJobs.keys())
  }

  // Stop tracking for a specific job
  stopTracking(jobId: string): boolean {
    const job = this.activeTrackingJobs.get(jobId)
    if (job) {
      clearInterval(job)
      this.activeTrackingJobs.delete(jobId)
      return true
    }
    return false
  }

  // Get active jobs with details
  getActiveJobs(): Array<{ jobId: string; productId: string; interval: number; startTime: Date }> {
    const jobs: Array<{ jobId: string; productId: string; interval: number; startTime: Date }> = []
    this.activeTrackingJobs.forEach((interval, jobId) => {
      // Extract productId from jobId (assuming format: productId-timestamp)
      const productId = jobId.split('-')[0]
      jobs.push({
        jobId,
        productId,
        interval: 15, // Default interval
        startTime: new Date() // This would need to be stored properly in a real implementation
      })
    })
    return jobs
  }

  // Get tracking statistics
  getTrackingStats(): { activeJobs: number; totalDataPoints: number; averageResponseTime: number } {
    const activeJobs = this.activeTrackingJobs.size
    const totalDataPoints = this.realTimeData.size
    const averageResponseTime = Array.from(this.dataSources.values())
      .reduce((sum, source) => sum + source.responseTime, 0) / this.dataSources.size || 0
    
    return {
      activeJobs,
      totalDataPoints,
      averageResponseTime
    }
  }

  // Start the service
  start(): void {
    if (!this.isRunning) {
      this.isRunning = true
      console.log('Real-time data service started')
    }
  }

  // Stop the service
  stop(): void {
    if (this.isRunning) {
      this.isRunning = false
      
      // Clear all tracking jobs
      this.activeTrackingJobs.forEach((interval, jobId) => {
        clearInterval(interval)
      })
      this.activeTrackingJobs.clear()
      
      console.log('Real-time data service stopped')
    }
  }

  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const realTimeDataService = new RealTimeDataService() 