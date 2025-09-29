// API Endpoint Tests for RevSnap Integrations
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'
import { GET as shopifyGET, POST as shopifyPOST } from '../src/app/api/shopify/route'
import { GET as zapierGET, POST as zapierPOST } from '../src/app/api/zapier/route'
import { POST as webhookHandler } from '../src/app/api/webhooks/shopify/route'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

// Mock the auth options
jest.mock('../src/lib/auth', () => ({
  authOptions: {}
}))

const { getServerSession } = require('next-auth')

describe('Shopify API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock authenticated session
    getServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    })
  })

  describe('GET /api/shopify', () => {
    it('should return connected stores', async () => {
      const url = 'http://localhost:3000/api/shopify?action=stores&organizationId=test-org'
      const request = new NextRequest(url)

      const response = await shopifyGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.stores).toBeDefined()
      expect(Array.isArray(data.stores)).toBe(true)
    })

    it('should return sync status for a store', async () => {
      const url = 'http://localhost:3000/api/shopify?action=sync-status&organizationId=test-org&storeId=store-123'
      const request = new NextRequest(url)

      const response = await shopifyGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.syncStatus).toBeDefined()
    })

    it('should return pricing recommendations', async () => {
      const url = 'http://localhost:3000/api/shopify?action=pricing-recommendations&organizationId=test-org&storeId=store-123'
      const request = new NextRequest(url)

      const response = await shopifyGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.recommendations).toBeDefined()
      expect(Array.isArray(data.recommendations)).toBe(true)
    })

    it('should require authentication', async () => {
      getServerSession.mockResolvedValue(null)

      const url = 'http://localhost:3000/api/shopify?action=stores&organizationId=test-org'
      const request = new NextRequest(url)

      const response = await shopifyGET(request)

      expect(response.status).toBe(401)
    })

    it('should require organizationId parameter', async () => {
      const url = 'http://localhost:3000/api/shopify?action=stores'
      const request = new NextRequest(url)

      const response = await shopifyGET(request)

      expect(response.status).toBe(400)
    })

    it('should handle invalid actions', async () => {
      const url = 'http://localhost:3000/api/shopify?action=invalid&organizationId=test-org'
      const request = new NextRequest(url)

      const response = await shopifyGET(request)

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/shopify', () => {
    it('should connect a new Shopify store', async () => {
      const request = new NextRequest('http://localhost:3000/api/shopify', {
        method: 'POST',
        body: JSON.stringify({
          action: 'connect',
          organizationId: 'test-org',
          shopDomain: 'test-store.myshopify.com',
          accessToken: 'valid-token'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await shopifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBeDefined()
    })

    it('should sync products from Shopify', async () => {
      const request = new NextRequest('http://localhost:3000/api/shopify', {
        method: 'POST',
        body: JSON.stringify({
          action: 'sync',
          organizationId: 'test-org',
          storeId: 'store-123'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await shopifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBeDefined()
    })

    it('should apply pricing recommendations', async () => {
      const request = new NextRequest('http://localhost:3000/api/shopify', {
        method: 'POST',
        body: JSON.stringify({
          action: 'apply-pricing',
          organizationId: 'test-org',
          storeId: 'store-123',
          recommendations: [
            { variantId: '123', newPrice: 99.99, reason: 'AI recommendation' }
          ]
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await shopifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBeDefined()
    })

    it('should setup auto pricing', async () => {
      const request = new NextRequest('http://localhost:3000/api/shopify', {
        method: 'POST',
        body: JSON.stringify({
          action: 'setup-auto-pricing',
          organizationId: 'test-org',
          storeId: 'store-123',
          settings: {
            enabled: true,
            frequency: 'daily',
            maxPriceChange: 10,
            requireApproval: false,
            excludedProducts: []
          }
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await shopifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBeDefined()
    })

    it('should validate required fields for store connection', async () => {
      const request = new NextRequest('http://localhost:3000/api/shopify', {
        method: 'POST',
        body: JSON.stringify({
          action: 'connect',
          organizationId: 'test-org'
          // Missing shopDomain and accessToken
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await shopifyPOST(request)

      expect(response.status).toBe(400)
    })

    it('should handle invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/shopify', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await shopifyPOST(request)

      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/webhooks/shopify', () => {
    it('should handle valid webhook with proper signature', async () => {
      const payload = JSON.stringify({
        id: 12345,
        title: 'Test Product',
        created_at: new Date().toISOString()
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          'x-shopify-hmac-sha256': 'valid-hmac',
          'x-shopify-topic': 'products/create',
          'x-shopify-shop-domain': 'test-store.myshopify.com'
        }
      })

      // Mock environment variable
      process.env.SHOPIFY_WEBHOOK_SECRET = 'test-secret'

      const response = await webhookHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should reject webhooks without required headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
        method: 'POST',
        body: JSON.stringify({ id: 123 }),
        headers: {
          'Content-Type': 'application/json'
          // Missing required headers
        }
      })

      const response = await webhookHandler(request)

      expect(response.status).toBe(400)
    })

    it('should reject webhooks with invalid signature', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
        method: 'POST',
        body: JSON.stringify({ id: 123 }),
        headers: {
          'Content-Type': 'application/json',
          'x-shopify-hmac-sha256': 'invalid-hmac',
          'x-shopify-topic': 'products/create',
          'x-shopify-shop-domain': 'test-store.myshopify.com'
        }
      })

      process.env.SHOPIFY_WEBHOOK_SECRET = 'test-secret'

      const response = await webhookHandler(request)

      expect(response.status).toBe(401)
    })

    it('should handle malformed webhook payload', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
          'x-shopify-hmac-sha256': 'valid-hmac',
          'x-shopify-topic': 'products/create',
          'x-shopify-shop-domain': 'test-store.myshopify.com'
        }
      })

      const response = await webhookHandler(request)

      expect(response.status).toBe(500)
    })
  })
})

describe('Zapier API Endpoints', () => {
  const mockZapierAuth = 'zap_test_org_123456_abc123'

  describe('GET /api/zapier', () => {
    it('should return available triggers', async () => {
      const url = 'http://localhost:3000/api/zapier?action=triggers&organization_id=test-org'
      const request = new NextRequest(url, {
        headers: {
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.triggers).toBeDefined()
      expect(Array.isArray(data.triggers)).toBe(true)
    })

    it('should return available actions', async () => {
      const url = 'http://localhost:3000/api/zapier?action=actions&organization_id=test-org'
      const request = new NextRequest(url, {
        headers: {
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.actions).toBeDefined()
      expect(Array.isArray(data.actions)).toBe(true)
    })

    it('should handle polling requests', async () => {
      const url = 'http://localhost:3000/api/zapier?action=poll&trigger_type=price_change_detected&organization_id=test-org'
      const request = new NextRequest(url, {
        headers: {
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('should return dynamic dropdown data', async () => {
      const url = 'http://localhost:3000/api/zapier?action=dynamic&field=product_list&organization_id=test-org'
      const request = new NextRequest(url, {
        headers: {
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('should return workflow templates', async () => {
      const url = 'http://localhost:3000/api/zapier?action=templates&organization_id=test-org'
      const request = new NextRequest(url, {
        headers: {
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.templates).toBeDefined()
      expect(Array.isArray(data.templates)).toBe(true)
    })

    it('should require Zapier authentication', async () => {
      const url = 'http://localhost:3000/api/zapier?action=triggers&organization_id=test-org'
      const request = new NextRequest(url)

      const response = await zapierGET(request)

      expect(response.status).toBe(401)
    })

    it('should validate Zapier auth key format', async () => {
      const url = 'http://localhost:3000/api/zapier?action=triggers&organization_id=test-org'
      const request = new NextRequest(url, {
        headers: {
          'x-zapier-auth': 'invalid-key-format'
        }
      })

      const response = await zapierGET(request)

      expect(response.status).toBe(401)
    })

    it('should require organization_id for polling', async () => {
      const url = 'http://localhost:3000/api/zapier?action=poll&trigger_type=price_change_detected'
      const request = new NextRequest(url, {
        headers: {
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierGET(request)

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/zapier', () => {
    it('should setup a new Zapier connection', async () => {
      const request = new NextRequest('http://localhost:3000/api/zapier', {
        method: 'POST',
        body: JSON.stringify({
          action: 'setup_connection',
          organization_id: 'test-org',
          trigger_type: 'price_change_detected',
          target_app: 'slack',
          target_action: 'send_message',
          config: {
            channel: '#pricing-alerts'
          }
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBeDefined()
    })

    it('should perform Zapier actions', async () => {
      const request = new NextRequest('http://localhost:3000/api/zapier', {
        method: 'POST',
        body: JSON.stringify({
          action: 'perform_action',
          organization_id: 'test-org',
          action_id: 'add_product_tracking',
          input_data: {
            product_name: 'Test Product',
            current_price: 99.99
          }
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.result).toBeDefined()
    })

    it('should test triggers with sample data', async () => {
      const request = new NextRequest('http://localhost:3000/api/zapier', {
        method: 'POST',
        body: JSON.stringify({
          action: 'test_trigger',
          organization_id: 'test-org',
          trigger_id: 'price_change_detected'
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.sample_data).toBeDefined()
    })

    it('should generate API keys', async () => {
      const request = new NextRequest('http://localhost:3000/api/zapier', {
        method: 'POST',
        body: JSON.stringify({
          action: 'generate_api_key',
          organization_id: 'test-org'
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.api_key).toBeDefined()
      expect(data.api_key).toMatch(/^zap_/)
    })

    it('should validate required fields for connection setup', async () => {
      const request = new NextRequest('http://localhost:3000/api/zapier', {
        method: 'POST',
        body: JSON.stringify({
          action: 'setup_connection',
          organization_id: 'test-org'
          // Missing required fields
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierPOST(request)

      expect(response.status).toBe(400)
    })

    it('should handle unknown action IDs', async () => {
      const request = new NextRequest('http://localhost:3000/api/zapier', {
        method: 'POST',
        body: JSON.stringify({
          action: 'perform_action',
          organization_id: 'test-org',
          action_id: 'unknown_action',
          input_data: {}
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierPOST(request)

      expect(response.status).toBe(404)
    })

    it('should handle unknown trigger IDs', async () => {
      const request = new NextRequest('http://localhost:3000/api/zapier', {
        method: 'POST',
        body: JSON.stringify({
          action: 'test_trigger',
          organization_id: 'test-org',
          trigger_id: 'unknown_trigger'
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-zapier-auth': mockZapierAuth
        }
      })

      const response = await zapierPOST(request)

      expect(response.status).toBe(404)
    })
  })
})

describe('Error Handling', () => {
  it('should handle server errors gracefully', async () => {
    // Mock a function to throw an error
    jest.spyOn(console, 'error').mockImplementation(() => {})
    
    const request = new NextRequest('http://localhost:3000/api/shopify?action=stores&organizationId=test-org')

    // Force an error by mocking getServerSession to throw
    getServerSession.mockRejectedValue(new Error('Database connection failed'))

    const response = await shopifyGET(request)

    expect(response.status).toBe(500)
    expect(console.error).toHaveBeenCalled()

    jest.restoreAllMocks()
  })

  it('should handle invalid request URLs', async () => {
    const request = new NextRequest('invalid-url')

    try {
      await shopifyGET(request)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('should handle CORS preflight requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/zapier', {
      method: 'OPTIONS'
    })

    const { OPTIONS } = require('../src/app/api/zapier/route')
    const response = await OPTIONS(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://zapier.com')
  })
})

describe('Integration Tests', () => {
  it('should handle end-to-end Shopify store connection flow', async () => {
    // 1. Connect store
    const connectRequest = new NextRequest('http://localhost:3000/api/shopify', {
      method: 'POST',
      body: JSON.stringify({
        action: 'connect',
        organizationId: 'test-org',
        shopDomain: 'test-store.myshopify.com',
        accessToken: 'valid-token'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const connectResponse = await shopifyPOST(connectRequest)
    expect(connectResponse.status).toBe(200)

    // 2. Get stores list
    const storesRequest = new NextRequest('http://localhost:3000/api/shopify?action=stores&organizationId=test-org')
    const storesResponse = await shopifyGET(storesRequest)
    expect(storesResponse.status).toBe(200)

    // 3. Sync products
    const syncRequest = new NextRequest('http://localhost:3000/api/shopify', {
      method: 'POST',
      body: JSON.stringify({
        action: 'sync',
        organizationId: 'test-org',
        storeId: 'store-123'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const syncResponse = await shopifyPOST(syncRequest)
    expect(syncResponse.status).toBe(200)
  })

  it('should handle end-to-end Zapier integration flow', async () => {
    const zapierAuth = 'zap_test_org_123456_abc123'

    // 1. Get available triggers
    const triggersRequest = new NextRequest('http://localhost:3000/api/zapier?action=triggers&organization_id=test-org', {
      headers: { 'x-zapier-auth': zapierAuth }
    })
    const triggersResponse = await zapierGET(triggersRequest)
    expect(triggersResponse.status).toBe(200)

    // 2. Setup connection
    const setupRequest = new NextRequest('http://localhost:3000/api/zapier', {
      method: 'POST',
      body: JSON.stringify({
        action: 'setup_connection',
        organization_id: 'test-org',
        trigger_type: 'price_change_detected',
        target_app: 'slack',
        target_action: 'send_message'
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-zapier-auth': zapierAuth
      }
    })
    const setupResponse = await zapierPOST(setupRequest)
    expect(setupResponse.status).toBe(200)

    // 3. Test trigger
    const testRequest = new NextRequest('http://localhost:3000/api/zapier', {
      method: 'POST',
      body: JSON.stringify({
        action: 'test_trigger',
        organization_id: 'test-org',
        trigger_id: 'price_change_detected'
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-zapier-auth': zapierAuth
      }
    })
    const testResponse = await zapierPOST(testRequest)
    expect(testResponse.status).toBe(200)
  })
}) 