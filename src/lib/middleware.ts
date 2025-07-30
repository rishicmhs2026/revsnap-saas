import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
  
  return { session }
}

export async function requireApiKey(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      )
    }
  }
  
  const apiKey = authHeader.substring(7)
  
  // Import here to avoid circular dependencies
  const { databaseService } = await import('./database')
  const apiKeyData = await databaseService.validateApiKey(apiKey)
  
  if (!apiKeyData) {
    return {
      error: NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }
  }
  
  return { apiKeyData }
}

export function validateOrganizationAccess(
  userId: string, 
  organizationId: string, 
  organizations: any[]
) {
  const hasAccess = organizations.some(org => 
    org.id === organizationId && 
    (org.userId === userId || org.members.some((m: any) => m.userId === userId))
  )
  
  if (!hasAccess) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
  }
  
  return { hasAccess: true }
}

export async function validateProductAccess(
  userId: string, 
  productId: string
) {
  // Import here to avoid circular dependencies
  const { databaseService } = await import('./database')
  
  const product = await databaseService.getProductById(productId)
  
  if (!product) {
    return {
      error: NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
  }
  
  // Check if user owns the product or has access through organization
  const userOrgs = await databaseService.getUserOrganizations(userId)
  const hasAccess = product.userId === userId || 
    userOrgs.some((org: any) => org.id === product.organizationId)
  
  if (!hasAccess) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
  }
  
  return { hasAccess: true, product }
}

 