import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AnalyticsTrackingService } from '@/lib/analytics-tracking';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const {
      eventName,
      eventData,
      pageUrl,
      referrer,
      userAgent,
      ipAddress,
      organizationId,
      sessionId,
    } = body;

    if (!eventName) {
      return NextResponse.json({ error: 'Event name required' }, { status: 400 });
    }

    const userId = session?.user?.email || undefined;

    // Track the event
    const event = await AnalyticsTrackingService.trackEvent({
      eventName,
      eventData,
      userId,
      sessionId,
      pageUrl,
      referrer,
      userAgent,
      ipAddress,
      organizationId,
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    logger.error('Failed to track analytics event', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 