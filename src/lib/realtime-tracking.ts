import { competitorTracker, CompetitorData, PriceAlert } from './competitor-tracking'
import { wsServer } from './websocket-server'

interface TrackingJob {
  id: string
  productId: string
  competitors: string[]
  interval: number // milliseconds
  isActive: boolean
  lastRun: Date
  nextRun: Date
  errorCount: number
  maxErrors: number
}

interface TrackingResult {
  success: boolean
  data?: CompetitorData[]
  alerts?: PriceAlert[]
  error?: string
  timestamp: Date
}

export class RealtimeTrackingService {
  private trackingJobs: Map<string, TrackingJob> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return
    
    try {
      await competitorTracker.initialize()
      this.isInitialized = true
      console.log('RealtimeTrackingService initialized successfully')
    } catch (error) {
      console.error('Failed to initialize RealtimeTrackingService:', error)
      throw error
    }
  }

  // Start tracking a product with specified competitors
  async startTracking(
    productId: string, 
    competitors: string[], 
    intervalMinutes: number = 15,
    yourPrice?: number
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const jobId = `tracking-${productId}-${Date.now()}`
    
    const job: TrackingJob = {
      id: jobId,
      productId,
      competitors,
      interval: intervalMinutes * 60 * 1000, // Convert to milliseconds
      isActive: true,
      lastRun: new Date(),
      nextRun: new Date(Date.now() + intervalMinutes * 60 * 1000),
      errorCount: 0,
      maxErrors: 5
    }

    this.trackingJobs.set(jobId, job)

    // Start the tracking interval
    const intervalId = setInterval(async () => {
      await this.runTrackingJob(jobId, yourPrice)
    }, job.interval)

    this.intervals.set(jobId, intervalId)

    // Run initial tracking
    await this.runTrackingJob(jobId, yourPrice)

    console.log(`Started tracking job ${jobId} for product ${productId}`)
    return jobId
  }

  // Stop tracking a specific job
  stopTracking(jobId: string): boolean {
    const job = this.trackingJobs.get(jobId)
    if (!job) {
      return false
    }

    job.isActive = false
    this.trackingJobs.delete(jobId)

    const intervalId = this.intervals.get(jobId)
    if (intervalId) {
      clearInterval(intervalId)
      this.intervals.delete(jobId)
    }

    console.log(`Stopped tracking job ${jobId}`)
    return true
  }

  // Stop all tracking jobs
  stopAllTracking(): void {
    for (const [jobId] of this.trackingJobs) {
      this.stopTracking(jobId)
    }
  }

  // Get all active tracking jobs
  getActiveJobs(): TrackingJob[] {
    return Array.from(this.trackingJobs.values()).filter(job => job.isActive)
  }

  // Get tracking job by ID
  getJob(jobId: string): TrackingJob | undefined {
    return this.trackingJobs.get(jobId)
  }

  // Run a single tracking job
  private async runTrackingJob(jobId: string, yourPrice?: number): Promise<TrackingResult> {
    const job = this.trackingJobs.get(jobId)
    if (!job || !job.isActive) {
      return { success: false, error: 'Job not found or inactive', timestamp: new Date() }
    }

    try {
      console.log(`Running tracking job ${jobId} for product ${job.productId}`)

      // Update job status
      job.lastRun = new Date()
      job.nextRun = new Date(Date.now() + job.interval)

      // Track competitors with timeout
      const trackingPromise = competitorTracker.trackMultipleCompetitors([
        { id: job.productId, competitors: job.competitors }
      ])
      
      const trackingData = await Promise.race([
        trackingPromise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Tracking timeout after 30 seconds')), 30000)
        )
      ])

      if (trackingData.length === 0) {
        throw new Error('No tracking data received')
      }

      // Get previous prices for comparison
      const previousPrices: CompetitorData[] = []
      for (const data of trackingData) {
        const previous = await competitorTracker.getPreviousPrices(data.competitor, data.productName)
        if (previous.length > 0) {
          previousPrices.push(...previous)
        }
      }

      // Generate price alerts
      const alerts = competitorTracker.generatePriceAlerts(trackingData, previousPrices)

      // Analyze market position if your price is provided
      let marketAnalysis = null
      if (yourPrice !== undefined) {
        marketAnalysis = competitorTracker.analyzeMarketPosition(trackingData, yourPrice)
      }

      // Save data to database
      for (const data of trackingData) {
        await competitorTracker.saveCompetitorData(data)
      }

      for (const alert of alerts) {
        await competitorTracker.savePriceAlert(alert)
      }

      // Reset error count on success
      job.errorCount = 0

      // Broadcast updates via WebSocket
      for (const data of trackingData) {
        wsServer.broadcastPriceUpdate(job.productId, data)
      }

      for (const alert of alerts) {
        wsServer.broadcastPriceAlert(job.productId, alert)
      }

      if (marketAnalysis) {
        wsServer.broadcastMarketAnalysis(job.productId, marketAnalysis)
      }

      // Broadcast tracking status
      wsServer.broadcastTrackingStatus(job.productId, 'active')

      const result: TrackingResult = {
        success: true,
        data: trackingData,
        alerts,
        timestamp: new Date()
      }

      console.log(`Tracking job ${jobId} completed successfully`)
      return result

    } catch (error) {
      console.error(`Error in tracking job ${jobId}:`, error)
      
      job.errorCount++
      
      // Stop job if too many errors
      if (job.errorCount >= job.maxErrors) {
        console.error(`Stopping tracking job ${jobId} due to too many errors`)
        this.stopTracking(jobId)
        wsServer.broadcastTrackingStatus(job.productId, 'error')
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }
    }
  }

  // Update tracking interval for a job
  updateTrackingInterval(jobId: string, newIntervalMinutes: number): boolean {
    const job = this.trackingJobs.get(jobId)
    if (!job) {
      return false
    }

    // Stop current interval
    const currentInterval = this.intervals.get(jobId)
    if (currentInterval) {
      clearInterval(currentInterval)
    }

    // Update job interval
    job.interval = newIntervalMinutes * 60 * 1000
    job.nextRun = new Date(Date.now() + job.interval)

    // Start new interval
    const newIntervalId = setInterval(async () => {
      await this.runTrackingJob(jobId)
    }, job.interval)

    this.intervals.set(jobId, newIntervalId)

    console.log(`Updated tracking interval for job ${jobId} to ${newIntervalMinutes} minutes`)
    return true
  }

  // Add competitors to existing tracking job
  addCompetitors(jobId: string, newCompetitors: string[]): boolean {
    const job = this.trackingJobs.get(jobId)
    if (!job) {
      return false
    }

    // Add new competitors (avoid duplicates)
    for (const competitor of newCompetitors) {
      if (!job.competitors.includes(competitor)) {
        job.competitors.push(competitor)
      }
    }

    console.log(`Added competitors to job ${jobId}:`, newCompetitors)
    return true
  }

  // Remove competitors from existing tracking job
  removeCompetitors(jobId: string, competitorsToRemove: string[]): boolean {
    const job = this.trackingJobs.get(jobId)
    if (!job) {
      return false
    }

    job.competitors = job.competitors.filter(
      competitor => !competitorsToRemove.includes(competitor)
    )

    console.log(`Removed competitors from job ${jobId}:`, competitorsToRemove)
    return true
  }

  // Get tracking statistics
  getTrackingStats(): {
    activeJobs: number
    totalErrors: number
    nextRunTime: Date | null
  } {
    const activeJobs = Array.from(this.trackingJobs.values()).filter(job => job.isActive)
    const totalErrors = activeJobs.reduce((sum, job) => sum + job.errorCount, 0)
    const nextRunTime = activeJobs.length > 0 
      ? new Date(Math.min(...activeJobs.map(job => job.nextRun.getTime())))
      : null

    return {
      activeJobs: activeJobs.length,
      totalErrors,
      nextRunTime
    }
  }

  // Cleanup on shutdown
  async cleanup() {
    this.stopAllTracking()
    
    if (this.isInitialized) {
      await competitorTracker.close()
      this.isInitialized = false
    }
    
    console.log('RealtimeTrackingService cleaned up')
  }
}

export const realtimeTrackingService = new RealtimeTrackingService() 