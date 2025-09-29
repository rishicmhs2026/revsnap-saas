import { NextRequest, NextResponse } from 'next/server'
import { ShopifyIntegrationService } from '@/lib/shopify-integration'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity
    const body = await request.text()
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256')
    const topic = request.headers.get('x-shopify-topic')
    const shopDomain = request.headers.get('x-shopify-shop-domain')

    if (!hmacHeader || !topic || !shopDomain) {
      return NextResponse.json({ error: 'Missing required headers' }, { status: 400 })
    }

    // Verify webhook signature
    const isValid = verifyShopifyWebhook(body, hmacHeader)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    // Parse payload
    const payload = JSON.parse(body)

    // Handle webhook event
    await ShopifyIntegrationService.handleWebhook(topic, payload, shopDomain)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Shopify webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

function verifyShopifyWebhook(body: string, hmacHeader: string): boolean {
  if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
    console.warn('SHOPIFY_WEBHOOK_SECRET not configured')
    return false
  }

  const hmac = crypto.createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
  hmac.update(body, 'utf8')
  const calculatedHmac = hmac.digest('base64')

  return crypto.timingSafeEqual(
    Buffer.from(calculatedHmac),
    Buffer.from(hmacHeader)
  )
} 