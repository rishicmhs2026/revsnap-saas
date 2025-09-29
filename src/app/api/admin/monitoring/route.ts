import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uptimeMonitor } from '@/lib/uptime-monitor'
import { performanceMonitor } from '@/lib/performance-monitor'
import { logInfo } from '@/lib/logger'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get system health status
    const systemHealth = uptimeMonitor.getSystemHealth()
    
    // Get performance statistics
    const performanceStats = performanceMonitor.getPerformanceStats()
    const apiStats = performanceMonitor.getApiStats()
    const dbStats = performanceMonitor.getDatabaseStats()
    
    // Get environment information
    const environment = {
      nodeEnv: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      version: process.version,
    }
    
    const response = {
      status: 'healthy',
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
    }
    
    logInfo('Admin monitoring check performed', {
      userId: session.user.id,
      overall: systemHealth.overall,
    })
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Admin monitoring error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'clear-metrics':
        performanceMonitor.clearMetrics()
        return NextResponse.json({ success: true, message: 'Metrics cleared' })
      
      case 'restart-monitoring':
        // Restart monitoring (placeholder implementation)
        return NextResponse.json({ success: true, message: 'Monitoring restart requested' })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Admin monitoring POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process admin action' },
      { status: 500 }
    )
  }
}