import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ABTestingService } from '@/lib/ab-testing';
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
    const testId = searchParams.get('testId');

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

    if (testId) {
      // Get variant for specific test
      const sessionId = searchParams.get('sessionId');
      const variant = await ABTestingService.getVariant(testId, user.id, sessionId || undefined);
      return NextResponse.json({ variant });
    } else {
      // Get all tests for organization
      const tests = await ABTestingService.getTests(organizationId);
      return NextResponse.json({ tests });
    }
  } catch (error) {
    logger.error('Failed to get A/B test data', { error });
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
      name,
      description,
      variants,
      trafficSplit,
      goals,
      startDate,
      endDate,
      organizationId,
    } = body;

    if (!name || !variants || !trafficSplit || !goals || !organizationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    const test = await ABTestingService.createTest({
      name,
      description,
      variants,
      trafficSplit,
      goals,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    }, organizationId, user.id);

    return NextResponse.json({ test }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create A/B test', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 