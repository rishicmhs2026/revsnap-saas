import { NextRequest, NextResponse } from 'next/server'
import { ZapierIntegrationService, handleZapierPolling } from '@/lib/zapier-integration'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const triggerType = searchParams.get('trigger_type')
    const organizationId = searchParams.get('organization_id')

    // Zapier authentication check
    const zapierKey = request.headers.get('x-zapier-auth')
    if (!zapierKey) {
      return NextResponse.json({ error: 'Zapier authentication required' }, { status: 401 })
    }

    const isValidKey = await validateZapierKey(zapierKey, organizationId)
    if (!isValidKey) {
      return NextResponse.json({ error: 'Invalid Zapier key' }, { status: 401 })
    }

    switch (action) {
      case 'triggers':
        // Return available triggers
        return NextResponse.json({
          success: true,
          triggers: ZapierIntegrationService.TRIGGERS
        })

      case 'actions':
        // Return available actions
        return NextResponse.json({
          success: true,
          actions: ZapierIntegrationService.ACTIONS
        })

      case 'poll':
        // Handle trigger polling
        if (!triggerType || !organizationId) {
          return NextResponse.json({ error: 'trigger_type and organization_id required' }, { status: 400 })
        }

        const config = Object.fromEntries(searchParams.entries())
        const events = await handleZapierPolling(triggerType, organizationId, config)
        
        return NextResponse.json(events)

      case 'dynamic':
        // Handle dynamic dropdowns
        const field = searchParams.get('field')
        if (!field || !organizationId) {
          return NextResponse.json({ error: 'field and organization_id required' }, { status: 400 })
        }

        const options = await ZapierIntegrationService.getDynamicData(organizationId, field)
        return NextResponse.json(options)

      case 'templates':
        // Return workflow templates
        return NextResponse.json({
          success: true,
          templates: ZapierIntegrationService.WORKFLOW_TEMPLATES
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Zapier API GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, organization_id } = body

    // Zapier authentication check
    const zapierKey = request.headers.get('x-zapier-auth')
    if (!zapierKey) {
      return NextResponse.json({ error: 'Zapier authentication required' }, { status: 401 })
    }

    const isValidKey = await validateZapierKey(zapierKey, organization_id)
    if (!isValidKey) {
      return NextResponse.json({ error: 'Invalid Zapier key' }, { status: 401 })
    }

    switch (action) {
      case 'setup_connection':
        const { trigger_type, target_app, target_action, config } = body
        if (!trigger_type || !target_app || !target_action) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const connectionResult = await ZapierIntegrationService.setupZapConnection(
          organization_id,
          {
            triggerType: trigger_type,
            targetApp: target_app,
            targetAction: target_action,
            config: config || {}
          }
        )

        return NextResponse.json(connectionResult)

      case 'perform_action':
        const { action_id, input_data } = body
        if (!action_id || !input_data) {
          return NextResponse.json({ error: 'action_id and input_data required' }, { status: 400 })
        }

        const zapierAction = ZapierIntegrationService.ACTIONS.find(a => a.id === action_id)
        if (!zapierAction) {
          return NextResponse.json({ error: 'Action not found' }, { status: 404 })
        }

        const actionResult = await zapierAction.performAction(input_data)
        return NextResponse.json({
          success: true,
          result: actionResult
        })

      case 'test_trigger':
        const { trigger_id } = body
        if (!trigger_id) {
          return NextResponse.json({ error: 'trigger_id required' }, { status: 400 })
        }

        const trigger = ZapierIntegrationService.TRIGGERS.find(t => t.id === trigger_id)
        if (!trigger) {
          return NextResponse.json({ error: 'Trigger not found' }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          sample_data: trigger.sampleData
        })

      case 'generate_api_key':
        // Generate new Zapier API key for organization
        if (!organization_id) {
          return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
        }

        const apiKey = await generateZapierApiKey(organization_id)
        return NextResponse.json({
          success: true,
          api_key: apiKey,
          instructions: 'Use this key in the X-Zapier-Auth header for all requests'
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Zapier API POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Authentication endpoint for Zapier app setup
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://zapier.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Zapier-Auth',
    },
  })
}

// Helper functions
async function validateZapierKey(key: string, organizationId: string | null): Promise<boolean> {
  // In real implementation, validate against stored API keys
  // For now, accept any key that starts with 'zap_'
  return key.startsWith('zap_') && organizationId !== null
}

async function generateZapierApiKey(organizationId: string): Promise<string> {
  // Generate secure API key for Zapier integration
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  const apiKey = `zap_${organizationId}_${timestamp}_${random}`
  
  // Store in database with organization
  await storeZapierApiKey(organizationId, apiKey)
  
  return apiKey
}

async function storeZapierApiKey(organizationId: string, _apiKey: string): Promise<void> {
  // Mock implementation - in real version, store in database
  console.log('Storing Zapier API key for organization:', organizationId)
} 