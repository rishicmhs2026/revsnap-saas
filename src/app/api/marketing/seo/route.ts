import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SEOOptimizationService } from '@/lib/seo-optimization';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const pageUrl = searchParams.get('pageUrl');
    const action = searchParams.get('action');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check if user has access to organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          where: { id: organizationId },
        },
      },
    });

    if (!user?.organizations.length) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (action === 'report') {
      // Generate SEO report
      const report = await SEOOptimizationService.generateSEOReport(organizationId);
      return NextResponse.json({ report });
    } else if (action === 'sitemap') {
      // Generate sitemap
      const baseUrl = searchParams.get('baseUrl') || 'https://revsnap.com';
      const sitemap = await SEOOptimizationService.generateSitemap(organizationId, baseUrl);
      return new NextResponse(sitemap, {
        headers: { 'Content-Type': 'application/xml' },
      });
    } else if (action === 'robots') {
      // Generate robots.txt
      const baseUrl = searchParams.get('baseUrl') || 'https://revsnap.com';
      const robotsTxt = await SEOOptimizationService.generateRobotsTxt(baseUrl);
      return new NextResponse(robotsTxt, {
        headers: { 'Content-Type': 'text/plain' },
      });
    } else if (pageUrl) {
      // Get SEO data for specific page
      const seoData = await SEOOptimizationService.getSEOData(pageUrl, organizationId);
      return NextResponse.json({ seoData });
    } else {
      // Get all SEO data
      const seoData = await SEOOptimizationService.getAllSEOData(organizationId);
      return NextResponse.json({ seoData });
    }
  } catch (error) {
    logger.error('Failed to get SEO data', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      pageUrl,
      title,
      description,
      keywords,
      h1Tags,
      h2Tags,
      h3Tags,
      imageAlt,
      canonicalUrl,
      metaRobots,
      structuredData,
      organizationId,
    } = body;

    if (!pageUrl || !organizationId) {
      return NextResponse.json({ error: 'Page URL and Organization ID required' }, { status: 400 });
    }

    // Check if user has access to organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          where: { id: organizationId },
        },
      },
    });

    if (!user?.organizations.length) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const seoData = await SEOOptimizationService.saveSEOData({
      pageUrl,
      title,
      description,
      keywords,
      h1Tags,
      h2Tags,
      h3Tags,
      imageAlt,
      canonicalUrl,
      metaRobots,
      structuredData,
    }, organizationId, user.id);

    return NextResponse.json({ seoData }, { status: 201 });
  } catch (error) {
    logger.error('Failed to save SEO data', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 