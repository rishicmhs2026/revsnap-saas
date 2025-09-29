import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'

let io: SocketIOServer | null = null

export const wsServer = io as SocketIOServer | null

export function initializeWebSocket(server: HTTPServer) {
  if (io) return io

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    },
    path: '/api/websocket'
  })

  io.use(async (socket, next) => {
    try {
      // Authenticate the socket connection
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return next(new Error('Authentication required'))
      }

      // Check if user has premium plan for real-time features
      const subscription = await prisma.subscription.findFirst({
        where: { 
          user: { id: session.user.id },
          status: 'active'
        },
        orderBy: { createdAt: 'desc' }
      })

      const planId = subscription?.stripePriceId?.includes('starter') ? 'starter' :
                     subscription?.stripePriceId?.includes('professional') ? 'professional' :
                     subscription?.stripePriceId?.includes('enterprise') ? 'enterprise' : 'free'

      if (planId === 'free') {
        return next(new Error('Real-time features require premium plan'))
      }

      // Store user info in socket
      socket.data.userId = session.user.id
      socket.data.planId = planId
      socket.data.email = session.user.email

      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.email} (${socket.data.planId})`)

    // Join user-specific room
    socket.join(`user:${socket.data.userId}`)

    // Join organization rooms
    socket.on('join_organization', async (organizationId: string) => {
      try {
        // Verify user has access to organization
        const org = await prisma.organization.findFirst({
          where: {
            id: organizationId,
            OR: [
              { userId: socket.data.userId },
              { members: { some: { userId: socket.data.userId } } }
            ]
          }
        })

        if (org) {
          socket.join(`org:${organizationId}`)
          socket.emit('joined_organization', { organizationId, name: org.name })
        } else {
          socket.emit('error', { message: 'Access denied to organization' })
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join organization' })
      }
    })

    // Handle product tracking subscription
    socket.on('subscribe_product', async (productId: string) => {
      try {
        // Verify user owns the product
        const product = await prisma.product.findFirst({
          where: {
            id: productId,
            userId: socket.data.userId
          }
        })

        if (product) {
          socket.join(`product:${productId}`)
          socket.emit('subscribed_product', { productId, name: product.name })
        } else {
          socket.emit('error', { message: 'Product not found or access denied' })
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to subscribe to product' })
      }
    })

    // Handle real-time price tracking requests (Enterprise only)
    socket.on('request_live_tracking', async (productId: string) => {
      if (socket.data.planId !== 'enterprise') {
        socket.emit('error', { message: 'Live tracking requires Enterprise plan' })
        return
      }

      try {
        // Start live tracking for this product
        await startLiveTracking(productId, socket.data.userId)
        socket.emit('live_tracking_started', { productId })
      } catch (error) {
        socket.emit('error', { message: 'Failed to start live tracking' })
      }
    })

    // Handle analytics subscription (Professional+)
    socket.on('subscribe_analytics', async (organizationId: string) => {
      if (socket.data.planId === 'free') {
        socket.emit('error', { message: 'Analytics subscription requires premium plan' })
        return
      }

      socket.join(`analytics:${organizationId}`)
      socket.emit('analytics_subscribed', { organizationId })
    })

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.email}`)
    })
  })

  return io
}

export function getWebSocketServer(): SocketIOServer | null {
  return io
}

// Real-time notification functions
export async function sendPriceAlert(userId: string, alert: any) {
  if (!io) return

  io.to(`user:${userId}`).emit('price_alert', {
    id: alert.id,
    type: alert.type,
    title: alert.title,
    message: alert.message,
    productId: alert.productId,
    oldPrice: alert.oldPrice,
    newPrice: alert.newPrice,
    competitor: alert.competitor,
    timestamp: alert.createdAt
  })
}

export async function sendCompetitorUpdate(productId: string, data: any) {
  if (!io) return

  io.to(`product:${productId}`).emit('competitor_update', {
    productId,
    competitor: data.competitor,
    price: data.price,
    currency: data.currency,
    availability: data.availability,
    timestamp: data.createdAt,
    source: data.source
  })
}

export async function sendAnalyticsUpdate(organizationId: string, metrics: any) {
  if (!io) return

  io.to(`analytics:${organizationId}`).emit('analytics_update', {
    organizationId,
    metrics,
    timestamp: new Date().toISOString()
  })
}

export async function sendSystemNotification(userId: string, notification: any) {
  if (!io) return

  io.to(`user:${userId}`).emit('system_notification', {
    type: notification.type,
    title: notification.title,
    message: notification.message,
    severity: notification.severity || 'info',
    timestamp: new Date().toISOString()
  })
}

// Live tracking function (Enterprise feature)
async function startLiveTracking(productId: string, userId: string) {
  // This would integrate with your scraping service
  // For now, we'll simulate live tracking
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { competitorData: { take: 1, orderBy: { createdAt: 'desc' } } }
  })

  if (!product) return

  // Simulate live tracking with periodic updates
  const trackingInterval = setInterval(async () => {
    try {
      // In a real implementation, this would trigger actual scraping
      const mockUpdate = {
        productId,
        competitor: 'Amazon',
        price: Math.round((Math.random() * 100 + 50) * 100) / 100,
        currency: 'USD',
        availability: Math.random() > 0.1 ? 'in_stock' : 'out_of_stock',
        createdAt: new Date(),
        source: 'live_tracking'
      }

      // Send update to connected clients
      await sendCompetitorUpdate(productId, mockUpdate)

      // Save to database
      await prisma.competitorData.create({
        data: {
          productId,
          competitor: mockUpdate.competitor,
          price: mockUpdate.price,
          currency: mockUpdate.currency,
          availability: mockUpdate.availability,
          source: mockUpdate.source,
          url: `https://amazon.com/product/${productId}`,
          confidence: 95,
          isValidated: true
        }
      })

    } catch (error) {
      console.error('Live tracking error:', error)
      clearInterval(trackingInterval)
    }
  }, 30000) // Update every 30 seconds for demo

  // Store interval for cleanup
  setTimeout(() => {
    clearInterval(trackingInterval)
  }, 300000) // Stop after 5 minutes for demo
}

// Background service to send periodic updates
export function startBackgroundServices() {
  if (!io) return

  // Send analytics updates every minute for Professional+ users
  setInterval(async () => {
    try {
      const activeOrganizations = await prisma.organization.findMany({
        where: {
          user: {
            subscriptions: {
              some: {
                status: 'active',
                stripePriceId: {
                  contains: 'professional'
                }
              }
            }
          }
        },
        select: { id: true }
      })

      for (const org of activeOrganizations) {
        const metrics = await generateRealTimeMetrics(org.id)
        await sendAnalyticsUpdate(org.id, metrics)
      }
    } catch (error) {
      console.error('Background analytics update error:', error)
    }
  }, 60000) // Every minute

  // Check for new price alerts every 30 seconds
  setInterval(async () => {
    try {
      const recentAlerts = await prisma.priceAlert.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30000) // Last 30 seconds
          },
          acknowledged: false
        },
        include: {
          product: {
            select: {
              userId: true,
              name: true
            }
          }
        }
      })

      for (const alert of recentAlerts) {
        await sendPriceAlert(alert.product.userId, alert)
      }
    } catch (error) {
      console.error('Background alert check error:', error)
    }
  }, 30000) // Every 30 seconds
}

async function generateRealTimeMetrics(organizationId: string) {
  const [productCount, alertCount, trackingJobs] = await Promise.all([
    prisma.product.count({
      where: { organizationId }
    }),
    prisma.priceAlert.count({
      where: {
        product: { organizationId },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    }),
    prisma.trackingJob.count({
      where: {
        product: { organizationId },
        isActive: true
      }
    })
  ])

  return {
    products: productCount,
    alerts24h: alertCount,
    activeJobs: trackingJobs,
    timestamp: new Date().toISOString()
  }
}

// Broadcast methods for real-time updates
export function broadcastPriceUpdate(productId: string, data: any) {
  if (io) {
    io.emit('priceUpdate', { productId, data })
  }
}

export function broadcastPriceAlert(productId: string, alert: any) {
  if (io) {
    io.emit('priceAlert', { productId, alert })
  }
}

export function broadcastMarketAnalysis(productId: string, analysis: any) {
  if (io) {
    io.emit('marketAnalysis', { productId, analysis })
  }
}

export function broadcastTrackingStatus(productId: string, status: string) {
  if (io) {
    io.emit('trackingStatus', { productId, status })
  }
}