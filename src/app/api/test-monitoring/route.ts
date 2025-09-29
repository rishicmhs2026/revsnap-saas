import { NextRequest, NextResponse } from 'next/server';
// import * as Sentry from '@sentry/nextjs';
import { logInfo, logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    logInfo('Test monitoring endpoint called', { 
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent')
    });

    // Test Sentry error capture
    if (request.nextUrl.searchParams.get('test-sentry') === 'true') {
      const testError = new Error('Test error from RevSnap SaaS monitoring system');
      // Sentry.captureException(testError, {
      //   tags: {
      //     test: 'monitoring-integration',
      //     endpoint: '/api/test-monitoring'
      //   },
      //   extra: {
      //     timestamp: new Date().toISOString(),
      //     userAgent: request.headers.get('user-agent')
      //   }
      // });
      
      logError(testError, { context: 'test-sentry-integration' });
      
      return NextResponse.json({
        success: true,
        message: 'Test error sent to Sentry',
        timestamp: new Date().toISOString()
      });
    }

    // Test performance monitoring
    if (request.nextUrl.searchParams.get('test-performance') === 'true') {
      const startTime = Date.now();
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const duration = Date.now() - startTime;
      
      logInfo('Performance test completed', { 
        duration,
        operation: 'test-performance'
      });

      return NextResponse.json({
        success: true,
        message: 'Performance test completed',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }

    // Default response
    return NextResponse.json({
      success: true,
      message: 'Monitoring test endpoint is working',
      timestamp: new Date().toISOString(),
      tests: {
        sentry: '/api/test-monitoring?test-sentry=true',
        performance: '/api/test-monitoring?test-performance=true'
      }
    });

  } catch (error) {
    logError(error as Error, { context: 'test-monitoring-endpoint' });
    
    // Sentry.captureException(error, {
    //   tags: {
    //     endpoint: '/api/test-monitoring'
    //   }
    // });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 