import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CRMIntegrationService } from '@/lib/crm-integration';
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

    const contacts = await CRMIntegrationService.getContacts(organizationId);

    return NextResponse.json({ contacts });
  } catch (error) {
    logger.error('Failed to get CRM contacts', { error });
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
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      source,
      status,
      tags,
      notes,
      metadata,
      organizationId,
    } = body;

    if (!email || !organizationId) {
      return NextResponse.json({ error: 'Email and Organization ID required' }, { status: 400 });
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

    const contact = await CRMIntegrationService.createContact({
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      source,
      status,
      tags,
      notes,
      metadata,
    }, organizationId, user.id);

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create CRM contact', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 