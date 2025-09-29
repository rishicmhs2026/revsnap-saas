import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getWebSocketServer } from '@/lib/websocket-server'
import { realTimeDataService } from '@/lib/realtime-data-service'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required for WebSocket connection' },
        { status: 401 }
      )
    }

    const wsServer = getWebSocketServer()
    
    if (!wsServer) {
      return NextResponse.json(
        { 
          error: 'WebSocket server not initialized',
          message: 'Real-time features are currently unavailable'
        },
        { status: 503 }
      )
    }

    // Return connection information for client
    return NextResponse.json({
      success: true,
      message: 'WebSocket server is running',
      endpoint: '/api/websocket',
      features: {
        priceAlerts: 'Real-time price change notifications',
        competitorUpdates: 'Live competitor data updates',
        analyticsUpdates: 'Real-time dashboard metrics (Professional+)',
        liveTracking: 'Live product tracking (Enterprise only)'
      },
      connectionInfo: {
        path: '/api/websocket',
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true
      }
    })

  } catch (error) {
    console.error('WebSocket API error:', error)
    return NextResponse.json(
      { error: 'WebSocket service error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, productId, competitors, interval, yourPrice } = body

    switch (action) {
      case 'start-tracking':
        const jobId = await realTimeDataService.startRealTimeTracking(
          productId,
          competitors,
          interval || 15,
          yourPrice
        )
        return Response.json({ success: true, jobId })

      case 'stop-tracking':
        const { jobId: stopJobId } = body
        const stopped = realTimeDataService.stopTracking(stopJobId)
        return Response.json({ success: stopped })

      case 'get-status':
        const activeJobs = realTimeDataService.getActiveJobs()
        const jobForProduct = activeJobs.find(job => job.productId === productId)
        const stats = realTimeDataService.getTrackingStats()
        return Response.json({
          success: true,
          isTracking: !!jobForProduct,
          job: jobForProduct,
          stats
        })

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('WebSocket API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
} 