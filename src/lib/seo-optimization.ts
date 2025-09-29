import { prisma } from './prisma';
import logger from './logger';

export interface SEOData {
  pageUrl: string;
  title?: string;
  description?: string;
  keywords?: string;
  h1Tags?: string;
  h2Tags?: string;
  h3Tags?: string;
  imageAlt?: string;
  canonicalUrl?: string;
  metaRobots?: string;
  structuredData?: any;
}

export interface SEOAnalysis {
  score: number;
  issues: SEOIssue[];
  suggestions: SEOSuggestion[];
  metrics: SEOMetrics;
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  priority: 'high' | 'medium' | 'low';
  element?: string;
}

export interface SEOSuggestion {
  message: string;
  impact: 'high' | 'medium' | 'low';
  implementation: string;
}

export interface SEOMetrics {
  titleLength: number;
  descriptionLength: number;
  keywordDensity: number;
  headingStructure: number;
  imageOptimization: number;
  mobileFriendliness: number;
  pageSpeed: number;
}

export class SEOOptimizationService {
  // Create or update SEO data for a page
  static async saveSEOData(data: SEOData, organizationId: string, userId: string) {
    try {
      const existingData = await prisma.sEOData.findFirst({
        where: { 
          pageUrl: data.pageUrl,
          organizationId,
        },
      });

      let seoData;
      if (existingData) {
        seoData = await prisma.sEOData.update({
          where: { id: existingData.id },
          data: {
            title: data.title,
            description: data.description,
            keywords: data.keywords,
            h1Tags: data.h1Tags,
            h2Tags: data.h2Tags,
            h3Tags: data.h3Tags,
            imageAlt: data.imageAlt,
            canonicalUrl: data.canonicalUrl,
            metaRobots: data.metaRobots,
            structuredData: data.structuredData,
          },
        });
      } else {
        seoData = await prisma.sEOData.create({
          data: {
            pageUrl: data.pageUrl,
            title: data.title,
            description: data.description,
            keywords: data.keywords,
            h1Tags: data.h1Tags,
            h2Tags: data.h2Tags,
            h3Tags: data.h3Tags,
            imageAlt: data.imageAlt,
            canonicalUrl: data.canonicalUrl,
            metaRobots: data.metaRobots,
            structuredData: data.structuredData,
            organizationId,
            userId,
          },
        });
      }

      // Analyze SEO and update score
      const analysis = await this.analyzeSEO(data);
      await prisma.sEOData.update({
        where: { id: seoData.id },
        data: { score: analysis.score },
      });

      logger.info('SEO data saved', { pageUrl: data.pageUrl, score: analysis.score });
      return { ...seoData, analysis };
    } catch (error) {
      logger.error('Failed to save SEO data', { error });
      throw error;
    }
  }

  // Analyze SEO for a page
  static async analyzeSEO(data: SEOData): Promise<SEOAnalysis> {
    try {
      const issues: SEOIssue[] = [];
      const suggestions: SEOSuggestion[] = [];
      let score = 100;

      // Title analysis
      if (!data.title) {
        issues.push({
          type: 'error',
          message: 'Missing page title',
          priority: 'high',
          element: 'title',
        });
        score -= 20;
      } else {
        const titleLength = data.title.length;
        if (titleLength < 30) {
          issues.push({
            type: 'warning',
            message: 'Title is too short (should be 30-60 characters)',
            priority: 'medium',
            element: 'title',
          });
          score -= 5;
        } else if (titleLength > 60) {
          issues.push({
            type: 'warning',
            message: 'Title is too long (should be 30-60 characters)',
            priority: 'medium',
            element: 'title',
          });
          score -= 5;
        }
      }

      // Description analysis
      if (!data.description) {
        issues.push({
          type: 'error',
          message: 'Missing meta description',
          priority: 'high',
          element: 'description',
        });
        score -= 15;
      } else {
        const descLength = data.description.length;
        if (descLength < 120) {
          issues.push({
            type: 'warning',
            message: 'Meta description is too short (should be 120-160 characters)',
            priority: 'medium',
            element: 'description',
          });
          score -= 3;
        } else if (descLength > 160) {
          issues.push({
            type: 'warning',
            message: 'Meta description is too long (should be 120-160 characters)',
            priority: 'medium',
            element: 'description',
          });
          score -= 3;
        }
      }

      // Keywords analysis
      if (!data.keywords) {
        issues.push({
          type: 'warning',
          message: 'No keywords specified',
          priority: 'low',
          element: 'keywords',
        });
        score -= 2;
      }

      // Heading structure analysis
      if (!data.h1Tags) {
        issues.push({
          type: 'error',
          message: 'Missing H1 tag',
          priority: 'high',
          element: 'h1',
        });
        score -= 10;
      }

      if (!data.h2Tags && !data.h3Tags) {
        issues.push({
          type: 'warning',
          message: 'No subheadings (H2/H3) found',
          priority: 'medium',
          element: 'headings',
        });
        score -= 5;
      }

      // Image optimization
      if (!data.imageAlt) {
        issues.push({
          type: 'warning',
          message: 'Images missing alt text',
          priority: 'medium',
          element: 'images',
        });
        score -= 5;
      }

      // Canonical URL
      if (!data.canonicalUrl) {
        suggestions.push({
          message: 'Add canonical URL to prevent duplicate content',
          impact: 'medium',
          implementation: 'Add <link rel="canonical" href="page-url" />',
        });
        score -= 2;
      }

      // Structured data
      if (!data.structuredData) {
        suggestions.push({
          message: 'Add structured data for better search results',
          impact: 'medium',
          implementation: 'Add JSON-LD structured data',
        });
        score -= 3;
      }

      // Calculate metrics
      const metrics: SEOMetrics = {
        titleLength: data.title?.length || 0,
        descriptionLength: data.description?.length || 0,
        keywordDensity: this.calculateKeywordDensity(data),
        headingStructure: this.calculateHeadingStructure(data),
        imageOptimization: data.imageAlt ? 100 : 0,
        mobileFriendliness: 85, // Would need actual mobile testing
        pageSpeed: 90, // Would need actual speed testing
      };

      // Ensure score doesn't go below 0
      score = Math.max(0, score);

      return {
        score,
        issues,
        suggestions,
        metrics,
      };
    } catch (error) {
      logger.error('Failed to analyze SEO', { error });
      throw error;
    }
  }

  // Calculate keyword density
  private static calculateKeywordDensity(data: SEOData): number {
    if (!data.keywords || !data.title || !data.description) {
      return 0;
    }

    const keywords = data.keywords.toLowerCase().split(',').map(k => k.trim());
    const content = `${data.title} ${data.description}`.toLowerCase();
    
    let totalOccurrences = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'g');
      const matches = content.match(regex);
      totalOccurrences += matches ? matches.length : 0;
    });

    const wordCount = content.split(/\s+/).length;
    return wordCount > 0 ? (totalOccurrences / wordCount) * 100 : 0;
  }

  // Calculate heading structure score
  private static calculateHeadingStructure(data: SEOData): number {
    let score = 0;
    
    if (data.h1Tags) score += 40;
    if (data.h2Tags) score += 30;
    if (data.h3Tags) score += 20;
    
    // Bonus for proper hierarchy
    if (data.h1Tags && data.h2Tags) score += 10;
    
    return Math.min(100, score);
  }

  // Get SEO data for a page
  static async getSEOData(pageUrl: string, organizationId: string) {
    try {
      const seoData = await prisma.sEOData.findFirst({
        where: { 
          pageUrl,
          organizationId,
        },
      });

      if (!seoData) {
        return null;
      }

      // Re-analyze SEO
      const analysis = await this.analyzeSEO(seoData);
      
      return {
        ...seoData,
        analysis,
      };
    } catch (error) {
      logger.error('Failed to get SEO data', { error });
      throw error;
    }
  }

  // Get all SEO data for an organization
  static async getAllSEOData(organizationId: string) {
    try {
      const seoData = await prisma.sEOData.findMany({
        where: { organizationId },
        orderBy: { score: 'desc' },
      });

      // Analyze each page
      const analyzedData = await Promise.all(
        seoData.map(async (data: any) => {
          const analysis = await this.analyzeSEO(data);
          return {
            ...data,
            analysis,
          };
        })
      );

      return analyzedData;
    } catch (error) {
      logger.error('Failed to get all SEO data', { error });
      throw error;
    }
  }

  // Generate SEO report
  static async generateSEOReport(organizationId: string) {
    try {
      const seoData = await this.getAllSEOData(organizationId);
      
      const totalPages = seoData.length;
      const averageScore = totalPages > 0 
        ? seoData.reduce((sum, data) => sum + data.analysis.score, 0) / totalPages 
        : 0;

      const issuesByPriority = {
        high: 0,
        medium: 0,
        low: 0,
      };

      const suggestionsByImpact = {
        high: 0,
        medium: 0,
        low: 0,
      };

      seoData.forEach(data => {
        data.analysis.issues.forEach((issue: any) => {
          const priority = issue.priority as keyof typeof issuesByPriority;
          if (priority in issuesByPriority) {
            issuesByPriority[priority]++;
          }
        });
        data.analysis.suggestions.forEach((suggestion: any) => {
          const impact = suggestion.impact as keyof typeof suggestionsByImpact;
          if (impact in suggestionsByImpact) {
            suggestionsByImpact[impact]++;
          }
        });
      });

      const topIssues = seoData
        .flatMap(data => data.analysis.issues)
        .sort((a: any, b: any) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = a.priority as keyof typeof priorityOrder;
          const bPriority = b.priority as keyof typeof priorityOrder;
          return (priorityOrder[bPriority] || 0) - (priorityOrder[aPriority] || 0);
        })
        .slice(0, 10);

      const topSuggestions = seoData
        .flatMap(data => data.analysis.suggestions)
        .sort((a: any, b: any) => {
          const impactOrder = { high: 3, medium: 2, low: 1 };
          const aImpact = a.impact as keyof typeof impactOrder;
          const bImpact = b.impact as keyof typeof impactOrder;
          return (impactOrder[bImpact] || 0) - (impactOrder[aImpact] || 0);
        })
        .slice(0, 10);

      return {
        summary: {
          totalPages,
          averageScore: Math.round(averageScore),
          issuesByPriority,
          suggestionsByImpact,
        },
        topIssues,
        topSuggestions,
        pages: seoData.map(data => ({
          pageUrl: data.pageUrl,
          score: data.analysis.score,
          issues: data.analysis.issues.length,
          suggestions: data.analysis.suggestions.length,
        })),
      };
    } catch (error) {
      logger.error('Failed to generate SEO report', { error });
      throw error;
    }
  }

  // Generate sitemap
  static async generateSitemap(organizationId: string, baseUrl: string) {
    try {
      const seoData = await prisma.sEOData.findMany({
        where: { organizationId },
        select: { pageUrl: true, updatedAt: true },
      });

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${seoData.map((data: any) => `  <url>
    <loc>${baseUrl}${data.pageUrl}</loc>
    <lastmod>${data.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

      return sitemap;
    } catch (error) {
      logger.error('Failed to generate sitemap', { error });
      throw error;
    }
  }

  // Generate robots.txt
  static async generateRobotsTxt(baseUrl: string) {
    try {
      const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/`;

      return robotsTxt;
    } catch (error) {
      logger.error('Failed to generate robots.txt', { error });
      throw error;
    }
  }
} 