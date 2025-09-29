import { prisma } from './prisma';
import logger from './logger';
import Cookies from 'js-cookie';

export interface ABTestData {
  name: string;
  description?: string;
  variants: ABTestVariant[];
  trafficSplit: { [key: string]: number };
  goals: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface ABTestVariant {
  name: string;
  description?: string;
  config: any;
  weight: number;
}

export interface ABTestResult {
  variant: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

export class ABTestingService {
  // Create a new A/B test
  static async createTest(data: ABTestData, organizationId: string, userId: string) {
    try {
      const test = await prisma.aBTest.create({
        data: {
          name: data.name,
          description: data.description,
          variants: data.variants,
          trafficSplit: data.trafficSplit,
          goals: data.goals,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.startDate ? 'running' : 'draft',
          organizationId,
          userId,
        },
      });

      logger.info('A/B test created', { testId: test.id });
      return test;
    } catch (error) {
      logger.error('Failed to create A/B test', { error });
      throw error;
    }
  }

  // Get variant for a user
  static async getVariant(testId: string, userId?: string, sessionId?: string): Promise<string | null> {
    try {
      const test = await prisma.aBTest.findUnique({
        where: { id: testId },
      });

      if (!test || test.status !== 'running') {
        return null;
      }

      // Check if test is active
      const now = new Date();
      if (test.startDate && now < test.startDate) {
        return null;
      }
      if (test.endDate && now > test.endDate) {
        return null;
      }

      // Get user identifier
      const identifier = userId || sessionId;
      if (!identifier) {
        return null;
      }

      // Check if user already has a variant assigned
      const cookieKey = `ab_test_${testId}`;
      const assignedVariant = Cookies.get(cookieKey);
      
      if (assignedVariant) {
        return assignedVariant;
      }

      // Assign variant based on traffic split
      const variant = this.assignVariant(test.trafficSplit as { [key: string]: number }, identifier);
      
      // Store assignment in cookie
      Cookies.set(cookieKey, variant, { expires: 30 }); // 30 days

      // Track impression
      await this.trackImpression(testId, variant, userId, sessionId);

      return variant;
    } catch (error) {
      logger.error('Failed to get A/B test variant', { error });
      return null;
    }
  }

  // Assign variant based on traffic split
  private static assignVariant(trafficSplit: { [key: string]: number }, identifier: string): string {
    const variants = Object.keys(trafficSplit);
    const weights = Object.values(trafficSplit);
    
    // Create hash from identifier
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use hash to determine variant
    const normalizedHash = Math.abs(hash) % 100;
    let cumulativeWeight = 0;
    
    for (let i = 0; i < variants.length; i++) {
      cumulativeWeight += weights[i];
      if (normalizedHash < cumulativeWeight) {
        return variants[i];
      }
    }
    
    // Fallback to first variant
    return variants[0];
  }

  // Track impression
  static async trackImpression(testId: string, variant: string, userId?: string, sessionId?: string) {
    try {
      const result = await prisma.aBTestResult.findFirst({
        where: { testId, variant },
      });

      if (result) {
        await prisma.aBTestResult.update({
          where: { id: result.id },
          data: { impressions: result.impressions + 1 },
        });
      } else {
        await prisma.aBTestResult.create({
          data: {
            testId,
            variant,
            impressions: 1,
            conversions: 0,
            conversionRate: 0,
            revenue: 0,
          },
        });
      }

      logger.info('A/B test impression tracked', { testId, variant });
    } catch (error) {
      logger.error('Failed to track A/B test impression', { error });
    }
  }

  // Track conversion
  static async trackConversion(testId: string, goal: string, value?: number, userId?: string, sessionId?: string) {
    try {
      const test = await prisma.aBTest.findUnique({
        where: { id: testId },
      });

      if (!test || test.status !== 'running') {
        return;
      }

      // Check if goal is valid
      if (!test.goals.includes(goal)) {
        return;
      }

      // Get user's variant
      const identifier = userId || sessionId;
      if (!identifier) {
        return;
      }

      const cookieKey = `ab_test_${testId}`;
      const variant = Cookies.get(cookieKey);
      
      if (!variant) {
        return;
      }

      // Update conversion metrics
      const result = await prisma.aBTestResult.findFirst({
        where: { testId, variant },
      });

      if (result) {
        const newConversions = result.conversions + 1;
        const newRevenue = result.revenue + (value || 0);
        const newConversionRate = (newConversions / result.impressions) * 100;

        await prisma.aBTestResult.update({
          where: { id: result.id },
          data: {
            conversions: newConversions,
            conversionRate: newConversionRate,
            revenue: newRevenue,
          },
        });
      }

      logger.info('A/B test conversion tracked', { 
        testId, 
        variant, 
        goal, 
        value 
      });
    } catch (error) {
      logger.error('Failed to track A/B test conversion', { error });
    }
  }

  // Get test results
  static async getTestResults(testId: string) {
    try {
      const test = await prisma.aBTest.findUnique({
        where: { id: testId },
        include: {
          results: true,
        },
      });

      if (!test) {
        throw new Error('Test not found');
      }

      return {
        test,
        results: test.results,
        totalImpressions: test.results.reduce((sum: number, r: any) => sum + r.impressions, 0),
        totalConversions: test.results.reduce((sum: number, r: any) => sum + r.conversions, 0),
        totalRevenue: test.results.reduce((sum: number, r: any) => sum + r.revenue, 0),
      };
    } catch (error) {
      logger.error('Failed to get A/B test results', { error });
      throw error;
    }
  }

  // Get all tests for an organization
  static async getTests(organizationId: string) {
    try {
      const tests = await prisma.aBTest.findMany({
        where: { organizationId },
        include: {
          results: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return tests;
    } catch (error) {
      logger.error('Failed to get A/B tests', { error });
      throw error;
    }
  }

  // Start a test
  static async startTest(testId: string) {
    try {
      const test = await prisma.aBTest.update({
        where: { id: testId },
        data: {
          status: 'running',
          startDate: new Date(),
        },
      });

      logger.info('A/B test started', { testId });
      return test;
    } catch (error) {
      logger.error('Failed to start A/B test', { error });
      throw error;
    }
  }

  // Pause a test
  static async pauseTest(testId: string) {
    try {
      const test = await prisma.aBTest.update({
        where: { id: testId },
        data: { status: 'paused' },
      });

      logger.info('A/B test paused', { testId });
      return test;
    } catch (error) {
      logger.error('Failed to pause A/B test', { error });
      throw error;
    }
  }

  // End a test
  static async endTest(testId: string) {
    try {
      const test = await prisma.aBTest.update({
        where: { id: testId },
        data: {
          status: 'completed',
          endDate: new Date(),
        },
      });

      logger.info('A/B test ended', { testId });
      return test;
    } catch (error) {
      logger.error('Failed to end A/B test', { error });
      throw error;
    }
  }

  // Get statistical significance
  static async getStatisticalSignificance(testId: string): Promise<{ [key: string]: number }> {
    try {
      const test = await prisma.aBTest.findUnique({
        where: { id: testId },
        include: {
          results: true,
        },
      });

      if (!test || test.results.length < 2) {
        return {};
      }

      const significance: { [key: string]: number } = {};
      const controlVariant = test.results[0];
      
      for (let i = 1; i < test.results.length; i++) {
        const variant = test.results[i];
        const pValue = this.calculatePValue(
          controlVariant.conversions,
          controlVariant.impressions,
          variant.conversions,
          variant.impressions
        );
        significance[variant.variant] = pValue;
      }

      return significance;
    } catch (error) {
      logger.error('Failed to calculate statistical significance', { error });
      return {};
    }
  }

  // Calculate p-value using chi-square test
  private static calculatePValue(conv1: number, imp1: number, conv2: number, imp2: number): number {
    if (imp1 === 0 || imp2 === 0) return 1;

    const rate1 = conv1 / imp1;
    const rate2 = conv2 / imp2;
    
    if (rate1 === rate2) return 1;

    const pooledRate = (conv1 + conv2) / (imp1 + imp2);
    const expected1 = imp1 * pooledRate;
    const expected2 = imp2 * pooledRate;
    
    const chiSquare = Math.pow(conv1 - expected1, 2) / expected1 + 
                     Math.pow(conv2 - expected2, 2) / expected2;
    
    // Simplified p-value calculation (for chi-square with 1 degree of freedom)
    return Math.exp(-chiSquare / 2) / Math.sqrt(2 * Math.PI * chiSquare);
  }
} 