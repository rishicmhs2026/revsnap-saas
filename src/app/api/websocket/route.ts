import { NextRequest } from 'next/server'
import { realtimeTrackingService } from '@/lib/realtime-tracking'

export async function GET(request: NextRequest) {
  // This is a placeholder for WebSocket upgrade
  // In a real implementation, you'd handle WebSocket upgrade here
  return new Response('WebSocket endpoint - use Socket.IO client', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, productId, competitors, interval, yourPrice } = body

    switch (action) {
      case 'start-tracking':
        const jobId = await realtimeTrackingService.startTracking(
          productId,
          competitors,
          interval || 15,
          yourPrice
        )
        return Response.json({ success: true, jobId })

      case 'stop-tracking':
        const { jobId: stopJobId } = body
        const stopped = realtimeTrackingService.stopTracking(stopJobId)
        return Response.json({ success: stopped })

      case 'get-status':
        const activeJobs = realtimeTrackingService.getActiveJobs()
        const jobForProduct = activeJobs.find(job => job.productId === productId)
        const stats = realtimeTrackingService.getTrackingStats()
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