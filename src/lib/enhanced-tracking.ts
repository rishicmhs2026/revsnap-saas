// Enhanced real-time tracking service with plan-based features

import { PlanService, PLAN_LIMITS } from './plan-limits'
import { prisma } from './prisma'

export interface TrackingConfig {
  planId: string
  updateIntervalMinutes: number
  competitorSources: string[]
  maxConcurrentJobs: number
  retryAttempts: number
  timeoutSeconds: number
}

export interface TrackingJob {
  id: string
  productId: string
  competitors: string[]
  intervalMinutes: number
  isActive: boolean
  lastRun?: Date
  nextRun?: Date
  planId: string
}

export class EnhancedTrackingService {
  private static readonly DEFAULT_CONFIG: TrackingConfig = {
    planId: 'starter',
    updateIntervalMinutes: 60,
    competitorSources: ['Amazon', 'Best Buy', 'Walmart', 'Target'],
    maxConcurrentJobs: 5,
    retryAttempts: 3,
    timeoutSeconds: 30
  }

  /**
   * Create a new tracking job with plan-based configuration
   */
  static async createTrackingJob(
    productId: string,
    competitors: string[],
    planId: string,
    userId: string
  ): Promise<TrackingJob> {
    const plan = PLAN_LIMITS[planId]
    if (!plan) {
      throw new Error('Invalid plan')
    }

    // Validate competitor sources based on plan
    const availableSources = PlanService.getCompetitorSources(planId)
    const validCompetitors = competitors.filter(c => availableSources.includes(c))
    
    if (validCompetitors.length === 0) {
      throw new Error(`No valid competitor sources for plan ${planId}`)
    }

    // Get update interval for the plan
    const updateInterval = PlanService.getUpdateInterval(planId)
    
    // Calculate next run time
    const nextRun = new Date()
    nextRun.setMinutes(nextRun.getMinutes() + updateInterval)

    const trackingJob = await prisma.trackingJob.create({
      data: {
        productId,
        competitors: JSON.stringify(validCompetitors),
        intervalMinutes: updateInterval,
        isActive: true,
        nextRun
      }
    })

    return {
      id: trackingJob.id,
      productId: trackingJob.productId,
      competitors: validCompetitors,
      intervalMinutes: trackingJob.intervalMinutes,
      isActive: trackingJob.isActive,
      lastRun: trackingJob.lastRun || undefined,
      nextRun: trackingJob.nextRun || undefined,
      planId
    }
  }

  /**
   * Update tracking job with new plan configuration
   */
  static async updateTrackingJob(
    jobId: string,
    planId: string,
    competitors?: string[]
  ): Promise<TrackingJob> {
    const plan = PLAN_LIMITS[planId]
    if (!plan) {
      throw new Error('Invalid plan')
    }

    const updateData: any = {
      intervalMinutes: PlanService.getUpdateInterval(planId),
      nextRun: new Date()
    }

    if (competitors) {
      const availableSources = PlanService.getCompetitorSources(planId)
      const validCompetitors = competitors.filter(c => availableSources.includes(c))
      updateData.competitors = JSON.stringify(validCompetitors)
    }

    updateData.nextRun.setMinutes(updateData.nextRun.getMinutes() + updateData.intervalMinutes)

    const trackingJob = await prisma.trackingJob.update({
      where: { id: jobId },
      data: updateData
    })

    return {
      id: trackingJob.id,
      productId: trackingJob.productId,
      competitors: JSON.parse(trackingJob.competitors),
      intervalMinutes: trackingJob.intervalMinutes,
      isActive: trackingJob.isActive,
      lastRun: trackingJob.lastRun || undefined,
      nextRun: trackingJob.nextRun || undefined,
      planId
    }
  }

  /**
   * Get tracking configuration for a plan
   */
  static getTrackingConfig(planId: string): TrackingConfig {
    const plan = PLAN_LIMITS[planId]
    if (!plan) {
      return this.DEFAULT_CONFIG
    }

    return {
      planId,
      updateIntervalMinutes: plan.updateIntervalMinutes,
      competitorSources: plan.competitorSources,
      maxConcurrentJobs: this.getMaxConcurrentJobs(planId),
      retryAttempts: this.getRetryAttempts(planId),
      timeoutSeconds: this.getTimeoutSeconds(planId)
    }
  }

  /**
   * Get maximum concurrent jobs based on plan
   */
  private static getMaxConcurrentJobs(planId: string): number {
    switch (planId) {
      case 'starter':
        return 3
      case 'professional':
        return 10
      case 'enterprise':
        return 50
      default:
        return 3
    }
  }

  /**
   * Get retry attempts based on plan
   */
  private static getRetryAttempts(planId: string): number {
    switch (planId) {
      case 'starter':
        return 2
      case 'professional':
        return 3
      case 'enterprise':
        return 5
      default:
        return 2
    }
  }

  /**
   * Get timeout seconds based on plan
   */
  private static getTimeoutSeconds(planId: string): number {
    switch (planId) {
      case 'starter':
        return 30
      case 'professional':
        return 45
      case 'enterprise':
        return 60
      default:
        return 30
    }
  }

  /**
   * Get active tracking jobs for an organization
   */
  static async getActiveTrackingJobs(organizationId: string): Promise<TrackingJob[]> {
    const jobs = await prisma.trackingJob.findMany({
      where: {
        product: { organizationId },
        isActive: true
      },
      include: {
        product: true
      }
    })

    return jobs.map((job: any) => ({
      id: job.id,
      productId: job.productId,
      competitors: JSON.parse(job.competitors),
      intervalMinutes: job.intervalMinutes,
      isActive: job.isActive,
      lastRun: job.lastRun || undefined,
      nextRun: job.nextRun || undefined,
      planId: this.determinePlanFromInterval(job.intervalMinutes)
    }))
  }

  /**
   * Determine plan from interval (for existing jobs)
   */
  private static determinePlanFromInterval(intervalMinutes: number): string {
    switch (intervalMinutes) {
      case 5:
        return 'enterprise'
      case 15:
        return 'professional'
      case 60:
      default:
        return 'starter'
    }
  }

  /**
   * Get tracking statistics for an organization
   */
  static async getTrackingStats(organizationId: string): Promise<{
    totalJobs: number
    activeJobs: number
    jobsByPlan: Record<string, number>
    averageUpdateInterval: number
    lastUpdateTime?: Date
  }> {
    const jobs = await prisma.trackingJob.findMany({
      where: {
        product: { organizationId }
      }
    })

    const activeJobs = jobs.filter((job: any) => job.isActive)
    const jobsByPlan: Record<string, number> = {
      starter: 0,
      professional: 0,
      enterprise: 0
    }

    jobs.forEach((job: any) => {
      const planId = this.determinePlanFromInterval(job.intervalMinutes)
      jobsByPlan[planId]++
    })

    const averageInterval = jobs.length > 0 
      ? jobs.reduce((sum: number, job: any) => sum + job.intervalMinutes, 0) / jobs.length
      : 0

    const lastUpdate = jobs.length > 0 
      ? jobs.reduce((latest: Date | null, job: any) => 
          job.lastRun && (!latest || job.lastRun > latest) ? job.lastRun : latest, 
          null as Date | null
        )
      : undefined

    return {
      totalJobs: jobs.length,
      activeJobs: activeJobs.length,
      jobsByPlan,
      averageUpdateInterval: averageInterval,
      lastUpdateTime: lastUpdate || undefined
    }
  }

  /**
   * Validate tracking job creation based on plan limits
   */
  static async validateTrackingJobCreation(
    organizationId: string,
    planId: string
  ): Promise<{ allowed: boolean; reason?: string; currentCount: number; limit: number }> {
    const currentJobs = await prisma.trackingJob.count({
      where: {
        product: { organizationId },
        isActive: true
      }
    })

    const plan = PLAN_LIMITS[planId]
    if (!plan) {
      return { allowed: false, reason: 'Invalid plan', currentCount: currentJobs, limit: 0 }
    }

    const maxJobs = this.getMaxConcurrentJobs(planId)
    const allowed = currentJobs < maxJobs

    return {
      allowed,
      reason: allowed ? undefined : `Maximum ${maxJobs} concurrent tracking jobs allowed for ${plan.name} plan`,
      currentCount: currentJobs,
      limit: maxJobs
    }
  }
} 