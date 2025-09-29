import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from './performance-monitor';
import { logApiRequest } from './logger';
// import * as Sentry from '@sentry/nextjs';

export function monitoringMiddleware(request: NextRequest) {
  const startTime = Date.now();
  const url = request.url;
  const method = request.method;

  // Create a custom response handler
  const originalResponse = NextResponse.next();
  
  // Override the response to capture metrics
  const response = new NextResponse(originalResponse.body, {
    status: originalResponse.status,
    statusText: originalResponse.statusText,
    headers: originalResponse.headers,
  });

  // Add response tracking
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
  
  // Track API performance
  const duration = Date.now() - startTime;
  performanceMonitor.trackApiRequest(method, url, response.status, duration);
  
  // Log API request
  logApiRequest(method, url, response.status, duration);
  
      // Capture errors in Sentry
    if (response.status >= 400) {
      // Sentry.captureException(new Error(`HTTP ${response.status}: ${method} ${url}`), {
      //   tags: {
      //     method,
      //     url,
      //     status: response.status.toString(),
      //   },
      //   extra: {
      //     duration,
      //     userAgent: request.headers.get('user-agent'),
      //   },
      // });
  }

  return response;
}

// Database monitoring wrapper
export function withDatabaseMonitoring<T extends any[], R>(
  operation: string,
  table: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    let success = false;
    
    try {
      const result = await fn(...args);
      success = true;
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      performanceMonitor.trackDatabaseOperation(operation, table, duration, success);
    }
  };
}

// Performance monitoring wrapper
export function withPerformanceMonitoring<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R> | R,
  context?: Record<string, any>
) {
  return performanceMonitor.trackOperation.bind(performanceMonitor, operation, fn, context);
} 