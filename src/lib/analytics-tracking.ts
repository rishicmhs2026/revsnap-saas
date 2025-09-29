import { prisma } from './prisma';
import logger from './logger';

export interface AnalyticsEvent {
  eventName: string;
  eventData?: any;
  userId?: string;
  sessionId?: string;
  pageUrl?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  organizationId?: string;
}

export interface PageViewData {
  pageUrl: string;
  pageTitle?: string;
  referrer?: string;
  userId?: string;
  sessionId?: string;
  organizationId?: string;
}

export interface ConversionData {
  eventName: string;
  value?: number;
  currency?: string;
  userId?: string;
  sessionId?: string;
  organizationId?: string;
}

export class AnalyticsTrackingService {
  // Track a custom event
  static async trackEvent(data: AnalyticsEvent) {
    try {
      // Store in database
      const event = await prisma.analyticsEvent.create({
        data: {
          eventName: data.eventName,
          eventData: data.eventData,
          userId: data.userId,
          sessionId: data.sessionId,
          pageUrl: data.pageUrl,
          referrer: data.referrer,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          organizationId: data.organizationId,
        },
      });

      // Send to external analytics services
      await this.sendToExternalServices(data);

      logger.info('Analytics event tracked', { 
        eventName: data.eventName, 
        eventId: event.id 
      });
      return event;
    } catch (error) {
      logger.error('Failed to track analytics event', { error });
      throw error;
    }
  }

  // Track page view
  static async trackPageView(data: PageViewData) {
    try {
      const event = await this.trackEvent({
        eventName: 'page_view',
        eventData: {
          pageTitle: data.pageTitle,
        },
        userId: data.userId,
        sessionId: data.sessionId,
        pageUrl: data.pageUrl,
        referrer: data.referrer,
        organizationId: data.organizationId,
      });

      logger.info('Page view tracked', { pageUrl: data.pageUrl });
      return event;
    } catch (error) {
      logger.error('Failed to track page view', { error });
      throw error;
    }
  }

  // Track conversion
  static async trackConversion(data: ConversionData) {
    try {
      const event = await this.trackEvent({
        eventName: data.eventName,
        eventData: {
          value: data.value,
          currency: data.currency,
        },
        userId: data.userId,
        sessionId: data.sessionId,
        organizationId: data.organizationId,
      });

      logger.info('Conversion tracked', { 
        eventName: data.eventName, 
        value: data.value 
      });
      return event;
    } catch (error) {
      logger.error('Failed to track conversion', { error });
      throw error;
    }
  }

  // Send to external analytics services
  private static async sendToExternalServices(data: AnalyticsEvent) {
    try {
      // Google Analytics 4
      if (process.env.GOOGLE_ANALYTICS_4_ID) {
        await this.sendToGoogleAnalytics(data);
      }

      // Mixpanel
      if (process.env.MIXPANEL_TOKEN) {
        await this.sendToMixpanel(data);
      }

      // Segment
      if (process.env.SEGMENT_WRITE_KEY) {
        await this.sendToSegment(data);
      }

      // PostHog
      if (process.env.POSTHOG_API_KEY) {
        await this.sendToPostHog(data);
      }

      // Amplitude
      if (process.env.AMPLITUDE_API_KEY) {
        await this.sendToAmplitude(data);
      }
    } catch (error) {
      logger.error('Failed to send to external analytics services', { error });
    }
  }

  // Send to Google Analytics 4
  private static async sendToGoogleAnalytics(data: AnalyticsEvent) {
    try {
      // This would typically use the Google Analytics Measurement Protocol
      // For now, we'll log the event
      logger.info('Google Analytics event', {
        measurementId: process.env.GOOGLE_ANALYTICS_4_ID,
        eventName: data.eventName,
        eventData: data.eventData,
      });
    } catch (error) {
      logger.error('Failed to send to Google Analytics', { error });
    }
  }

  // Send to Mixpanel
  private static async sendToMixpanel(data: AnalyticsEvent) {
    try {
      // This would typically use the Mixpanel API
      // For now, we'll log the event
      logger.info('Mixpanel event', {
        token: process.env.MIXPANEL_TOKEN,
        eventName: data.eventName,
        eventData: data.eventData,
        userId: data.userId,
      });
    } catch (error) {
      logger.error('Failed to send to Mixpanel', { error });
    }
  }

  // Send to Segment
  private static async sendToSegment(data: AnalyticsEvent) {
    try {
      // This would typically use the Segment API
      // For now, we'll log the event
      logger.info('Segment event', {
        writeKey: process.env.SEGMENT_WRITE_KEY,
        eventName: data.eventName,
        eventData: data.eventData,
        userId: data.userId,
      });
    } catch (error) {
      logger.error('Failed to send to Segment', { error });
    }
  }

  // Send to PostHog
  private static async sendToPostHog(data: AnalyticsEvent) {
    try {
      // This would typically use the PostHog API
      // For now, we'll log the event
      logger.info('PostHog event', {
        apiKey: process.env.POSTHOG_API_KEY,
        eventName: data.eventName,
        eventData: data.eventData,
        userId: data.userId,
      });
    } catch (error) {
      logger.error('Failed to send to PostHog', { error });
    }
  }

  // Send to Amplitude
  private static async sendToAmplitude(data: AnalyticsEvent) {
    try {
      // This would typically use the Amplitude API
      // For now, we'll log the event
      logger.info('Amplitude event', {
        apiKey: process.env.AMPLITUDE_API_KEY,
        eventName: data.eventName,
        eventData: data.eventData,
        userId: data.userId,
      });
    } catch (error) {
      logger.error('Failed to send to Amplitude', { error });
    }
  }

  // Get analytics for an organization
  static async getAnalytics(organizationId: string, startDate?: Date, endDate?: Date) {
    try {
      const whereClause: any = { organizationId };
      
      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp.gte = startDate;
        if (endDate) whereClause.timestamp.lte = endDate;
      }

      const events = await prisma.analyticsEvent.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
      });

      // Calculate metrics
      const totalEvents = events.length;
      const uniqueUsers = new Set(events.filter((e: any) => e.userId).map((e: any) => e.userId)).size;
      const pageViews = events.filter((e: any) => e.eventName === 'page_view').length;
      const conversions = events.filter((e: any) => e.eventName.includes('conversion')).length;

      // Top events
      const eventCounts: { [key: string]: number } = {};
      events.forEach((event: any) => {
        eventCounts[event.eventName] = (eventCounts[event.eventName] || 0) + 1;
      });

      const topEvents = Object.entries(eventCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([eventName, count]) => ({ eventName, count }));

      // Top pages
      const pageCounts: { [key: string]: number } = {};
      events.forEach((event: any) => {
        if (event.pageUrl) {
          pageCounts[event.pageUrl] = (pageCounts[event.pageUrl] || 0) + 1;
        }
      });

      const topPages = Object.entries(pageCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([pageUrl, count]) => ({ pageUrl, count }));

      return {
        totalEvents,
        uniqueUsers,
        pageViews,
        conversions,
        conversionRate: pageViews > 0 ? (conversions / pageViews) * 100 : 0,
        topEvents,
        topPages,
        recentEvents: events.slice(0, 20),
      };
    } catch (error) {
      logger.error('Failed to get analytics', { error });
      throw error;
    }
  }

  // Get user journey
  static async getUserJourney(userId: string, organizationId?: string) {
    try {
      const whereClause: any = { userId };
      if (organizationId) whereClause.organizationId = organizationId;

      const events = await prisma.analyticsEvent.findMany({
        where: whereClause,
        orderBy: { timestamp: 'asc' },
      });

      return events.map((event: any) => ({
        timestamp: event.timestamp,
        eventName: event.eventName,
        pageUrl: event.pageUrl,
        eventData: event.eventData,
      }));
    } catch (error) {
      logger.error('Failed to get user journey', { error });
      throw error;
    }
  }

  // Get funnel analysis
  static async getFunnelAnalysis(organizationId: string, funnelSteps: string[]) {
    try {
      const events = await prisma.analyticsEvent.findMany({
        where: { 
          organizationId,
          eventName: { in: funnelSteps },
        },
        orderBy: { timestamp: 'asc' },
      });

      // Group events by session
      const sessions: { [key: string]: any[] } = {};
      events.forEach((event: any) => {
        if (event.sessionId) {
          if (!sessions[event.sessionId]) {
            sessions[event.sessionId] = [];
          }
          sessions[event.sessionId].push(event);
        }
      });

      // Calculate funnel
      const funnel = funnelSteps.map((step, index) => {
        const stepEvents = events.filter((e: any) => e.eventName === step);
        const uniqueUsers = new Set(stepEvents.map((e: any) => e.userId)).size;
        
        // Calculate conversion from previous step
        let conversionRate = 100;
        if (index > 0) {
          const prevStep = funnelSteps[index - 1];
          const prevStepEvents = events.filter((e: any) => e.eventName === prevStep);
          const prevUniqueUsers = new Set(prevStepEvents.map((e: any) => e.userId)).size;
          conversionRate = prevUniqueUsers > 0 ? (uniqueUsers / prevUniqueUsers) * 100 : 0;
        }

        return {
          step,
          uniqueUsers,
          conversionRate,
        };
      });

      return funnel;
    } catch (error) {
      logger.error('Failed to get funnel analysis', { error });
      throw error;
    }
  }
} 