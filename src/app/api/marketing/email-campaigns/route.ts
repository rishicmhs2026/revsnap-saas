import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EmailMarketingService } from '@/lib/email-marketing';
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

    const campaigns = await EmailMarketingService.getCampaigns(organizationId);

    return NextResponse.json({ campaigns });
  } catch (error) {
    logger.error('Failed to get email campaigns', { error });
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
      subject,
      content,
      template,
      scheduledAt,
      organizationId,
      recipients,
    } = body;

    if (!name || !subject || !content || !organizationId) {
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

    // Create campaign
    const campaign = await EmailMarketingService.createCampaign({
      name,
      subject,
      content,
      template,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      organizationId,
      userId: user.id,
    });

    // Add recipients if provided
    if (recipients && recipients.length > 0) {
      await EmailMarketingService.addRecipients(campaign.id, recipients);
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create email campaign', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 