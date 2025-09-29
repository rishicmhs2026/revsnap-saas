import { NextResponse } from 'next/server';
import { uptimeMonitor } from '@/lib/uptime-monitor';
import { performanceMonitor } from '@/lib/performance-monitor';
import { logInfo } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Get system health status
    const systemHealth = uptimeMonitor.getSystemHealth();
    
    // Get performance statistics
    const performanceStats = performanceMonitor.getPerformanceStats();
    const apiStats = performanceMonitor.getApiStats();
    const dbStats = performanceMonitor.getDatabaseStats();
    
    // Get environment information
    const environment = {
      nodeEnv: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      version: process.version,
    };
    
    // Determine overall status
    const isHealthy = systemHealth.overall === 'healthy';
    const statusCode = isHealthy ? 200 : 503;
    
    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment,
      system: {
        overall: systemHealth.overall,
        checks: systemHealth.checks,
        services: systemHealth.services,
      },
      performance: {
        operations: performanceStats,
        api: apiStats,
        database: dbStats,
      },
      version: process.env.npm_package_version || '1.0.0',
    };
    
    const duration = Date.now() - startTime;
    
    // Log the health check
    logInfo('Health check performed', {
      status: response.status,
      duration,
      overall: systemHealth.overall,
    });
    
    return NextResponse.json(response, { status: statusCode });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logInfo('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    });
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        duration,
      },
      { status: 503 }
    );
  }
}

// Simple health check for load balancers
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
} 