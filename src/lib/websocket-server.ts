import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { CompetitorData, PriceAlert } from './competitor-tracking'

export class WebSocketServer {
  private io: SocketIOServer | null = null

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://revsnap.com', 'https://www.revsnap.com']
          : ['http://localhost:3000'],
        methods: ['GET', 'POST']
      }
    })

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Join product-specific room
      socket.on('join-product', (productId: string) => {
        socket.join(`product-${productId}`)
        console.log(`Client ${socket.id} joined product room: ${productId}`)
      })

      // Leave product-specific room
      socket.on('leave-product', (productId: string) => {
        socket.leave(`product-${productId}`)
        console.log(`Client ${socket.id} left product room: ${productId}`)
      })

      // Handle real-time tracking requests
      socket.on('start-tracking', async (data: { productId: string, competitors: string[] }) => {
        try {
          console.log('Starting real-time tracking for:', data)
          // Emit tracking started confirmation
          socket.emit('tracking-started', { productId: data.productId })
        } catch (error) {
          socket.emit('tracking-error', { error: 'Failed to start tracking' })
        }
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    return this.io
  }

  // Broadcast price updates to all clients tracking a specific product
  broadcastPriceUpdate(productId: string, data: CompetitorData) {
    if (this.io) {
      this.io.to(`product-${productId}`).emit('price-update', {
        type: 'price_update',
        productId,
        data,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Broadcast price alerts to all clients
  broadcastPriceAlert(productId: string, alert: PriceAlert) {
    if (this.io) {
      this.io.to(`product-${productId}`).emit('price-alert', {
        type: 'price_alert',
        productId,
        alert,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Broadcast market analysis updates
  broadcastMarketAnalysis(productId: string, analysis: any) {
    if (this.io) {
      this.io.to(`product-${productId}`).emit('market-analysis', {
        type: 'market_analysis',
        productId,
        analysis,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Broadcast tracking status
  broadcastTrackingStatus(productId: string, status: 'active' | 'paused' | 'error') {
    if (this.io) {
      this.io.to(`product-${productId}`).emit('tracking-status', {
        type: 'tracking_status',
        productId,
        status,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Get connected clients count for a product
  getConnectedClients(productId: string): number {
    if (this.io) {
      const room = this.io.sockets.adapter.rooms.get(`product-${productId}`)
      return room ? room.size : 0
    }
    return 0
  }
}

export const wsServer = new WebSocketServer()

// Default export for CommonJS compatibility
export default WebSocketServer 