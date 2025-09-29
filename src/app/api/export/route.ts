import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
// import { createWriteStream } from 'fs' // Unused import
import * as XLSX from 'xlsx'

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
    const { 
      dataType, 
      format, 
      organizationId, 
      dateFrom, 
      dateTo,
      includeMetadata = false,
      filters = {}
    } = body

    if (!dataType || !format) {
      return NextResponse.json(
        { error: 'Data type and format are required' },
        { status: 400 }
      )
    }

    // Check user's subscription and plan limits
    const subscription = await prisma.subscription.findFirst({
      where: { 
        organizationId: organizationId || undefined,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    })

    const planId = subscription?.stripePriceId?.includes('starter') ? 'starter' :
                   subscription?.stripePriceId?.includes('professional') ? 'professional' :
                   subscription?.stripePriceId?.includes('enterprise') ? 'enterprise' : 'free'

    // Check if user has export permissions
    if (planId === 'free') {
      return NextResponse.json(
        { 
          error: 'Data export is a premium feature',
          upgradeRequired: true,
          minimumPlan: 'starter'
        },
        { status: 403 }
      )
    }

    // Check monthly export limits
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const exportsThisMonth = await prisma.dataExport.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: currentMonth }
      }
    })

    const exportLimits = {
      starter: 5,
      professional: 50,
      enterprise: 500
    }

    const monthlyLimit = exportLimits[planId as keyof typeof exportLimits] || 0
    
    if (exportsThisMonth >= monthlyLimit) {
      return NextResponse.json(
        { 
          error: `Monthly export limit reached (${monthlyLimit} exports)`,
          upgradeRequired: planId !== 'enterprise',
          currentUsage: exportsThisMonth,
          limit: monthlyLimit
        },
        { status: 429 }
      )
    }

    // Generate export data based on type
    let exportData: any[] = []
    let filename = ''
    let totalRecords = 0

    switch (dataType) {
      case 'products':
        const products = await exportProducts(session.user.id, organizationId, dateFrom, dateTo, filters, includeMetadata)
        exportData = products.data
        totalRecords = products.total
        filename = `products_export_${new Date().toISOString().split('T')[0]}`
        break

      case 'competitor_data':
        if (planId === 'starter') {
          return NextResponse.json(
            { error: 'Competitor data export requires Professional+ plan' },
            { status: 403 }
          )
        }
        const competitorData = await exportCompetitorData(session.user.id, organizationId, dateFrom, dateTo, filters, includeMetadata)
        exportData = competitorData.data
        totalRecords = competitorData.total
        filename = `competitor_data_export_${new Date().toISOString().split('T')[0]}`
        break

      case 'price_alerts':
        const alerts = await exportPriceAlerts(session.user.id, organizationId, dateFrom, dateTo, filters, includeMetadata)
        exportData = alerts.data
        totalRecords = alerts.total
        filename = `price_alerts_export_${new Date().toISOString().split('T')[0]}`
        break

      case 'analytics':
        if (planId !== 'enterprise') {
          return NextResponse.json(
            { error: 'Analytics export requires Enterprise plan' },
            { status: 403 }
          )
        }
        const analytics = await exportAnalytics(session.user.id, organizationId, dateFrom, dateTo, filters, includeMetadata)
        exportData = analytics.data
        totalRecords = analytics.total
        filename = `analytics_export_${new Date().toISOString().split('T')[0]}`
        break

      case 'full_backup':
        if (planId !== 'enterprise') {
          return NextResponse.json(
            { error: 'Full backup export requires Enterprise plan' },
            { status: 403 }
          )
        }
        const backup = await exportFullBackup(session.user.id, organizationId, includeMetadata)
        exportData = (backup.data as any) || []
        totalRecords = backup.total
        filename = `full_backup_${new Date().toISOString().split('T')[0]}`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid data type' },
          { status: 400 }
        )
    }

    if (exportData.length === 0) {
      return NextResponse.json(
        { error: 'No data found for export' },
        { status: 404 }
      )
    }

    // Generate file based on format
    const exportDir = join(process.cwd(), 'temp', 'exports')
    await mkdir(exportDir, { recursive: true })

    let filePath = ''
    let mimeType = ''

    switch (format.toLowerCase()) {
      case 'csv':
        filePath = join(exportDir, `${filename}.csv`)
        mimeType = 'text/csv'
        await generateCSV(exportData, filePath)
        break

      case 'json':
        filePath = join(exportDir, `${filename}.json`)
        mimeType = 'application/json'
        await generateJSON(exportData, filePath, includeMetadata)
        break

      case 'excel':
        if (planId === 'starter') {
          return NextResponse.json(
            { error: 'Excel export requires Professional+ plan' },
            { status: 403 }
          )
        }
        filePath = join(exportDir, `${filename}.xlsx`)
        // mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // Unused variable
        await generateExcel(exportData, filePath, dataType)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid format. Supported: csv, json, excel' },
          { status: 400 }
        )
    }

    // Log the export in database
    const exportRecord = await prisma.dataExport.create({
      data: {
        userId: session.user.id,
        organizationId: organizationId || null,
        dataType,
        format,
        filename: `${filename}.${format}`,
        recordCount: totalRecords,
        filePath,
        status: 'completed',
        metadata: JSON.stringify({
          filters,
          includeMetadata,
          dateFrom,
          dateTo,
          fileSize: await getFileSize(filePath)
        })
      }
    })

    // Generate download URL (in production, this would be a signed URL to cloud storage)
    const downloadUrl = `/api/export/download/${exportRecord.id}`

    return NextResponse.json({
      success: true,
      data: {
        exportId: exportRecord.id,
        filename: `${filename}.${format}`,
        recordCount: totalRecords,
        downloadUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        remainingExports: monthlyLimit - exportsThisMonth - 1
      }
    })

  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    )
  }
}

// Helper functions for different export types
async function exportProducts(userId: string, organizationId: string | undefined, dateFrom: string | undefined, dateTo: string | undefined, filters: any, includeMetadata: boolean) {
  const where: any = { userId }
  if (organizationId) where.organizationId = organizationId
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) where.createdAt.lte = new Date(dateTo)
  }
  if (filters.category) where.category = filters.category
  if (filters.isActive !== undefined) where.isActive = filters.isActive

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: includeMetadata ? {
        competitorData: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        priceAlerts: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      } : undefined,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where })
  ])

  return {
    data: products.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      sku: p.sku,
      category: p.category,
      brand: p.brand,
      url: p.url,
      yourPrice: p.yourPrice,
      currency: p.currency,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      ...(includeMetadata && {
        latestCompetitorPrice: p.competitorData?.[0]?.price || null,
        recentAlerts: p.priceAlerts?.length || 0
      })
    })),
    total
  }
}

async function exportCompetitorData(userId: string, organizationId: string | undefined, dateFrom: string | undefined, dateTo: string | undefined, filters: any, includeMetadata: boolean) {
  const where: any = {
    product: { userId }
  }
  if (organizationId) where.product.organizationId = organizationId
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) where.createdAt.lte = new Date(dateTo)
  }
  if (filters.competitor) where.competitor = filters.competitor
  if (filters.source) where.source = filters.source

  const [data, total] = await Promise.all([
    prisma.competitorData.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10000 // Limit for performance
    }),
    prisma.competitorData.count({ where })
  ])

  return {
    data: data.map((d: any) => ({
      id: d.id,
      productName: d.product.name,
      productSku: d.product.sku,
      productCategory: d.product.category,
      competitor: d.competitor,
      price: d.price,
      currency: d.currency,
      availability: d.availability,
      source: d.source,
      url: d.url,
      confidence: d.confidence,
      isValidated: d.isValidated,
      createdAt: d.createdAt,
      ...(includeMetadata && {
        metadata: d.metadata
      })
    })),
    total
  }
}

async function exportPriceAlerts(userId: string, organizationId: string | undefined, dateFrom: string | undefined, dateTo: string | undefined, filters: any, includeMetadata: boolean) {
  const where: any = {
    product: { userId }
  }
  if (organizationId) where.product.organizationId = organizationId
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) where.createdAt.lte = new Date(dateTo)
  }
  if (filters.type) where.type = filters.type
  if (filters.acknowledged !== undefined) where.acknowledged = filters.acknowledged

  const [alerts, total] = await Promise.all([
    prisma.priceAlert.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.priceAlert.count({ where })
  ])

  return {
    data: alerts.map((a: any) => ({
      id: a.id,
      productName: a.product.name,
      productSku: a.product.sku,
      type: a.type,
      title: a.title,
      message: a.message,
      oldPrice: a.oldPrice,
      newPrice: a.newPrice,
      priceChange: a.priceChange,
      competitor: a.competitor,
      acknowledged: a.acknowledged,
      createdAt: a.createdAt,
      ...(includeMetadata && {
        metadata: a.metadata
      })
    })),
    total
  }
}

async function exportAnalytics(userId: string, organizationId: string | undefined, dateFrom: string | undefined, dateTo: string | undefined, filters: any, includeMetadata: boolean) {
  // This would include comprehensive analytics data
  // Implementation depends on your analytics schema
  return {
    data: [],
    total: 0
  }
}

async function exportFullBackup(userId: string, organizationId: string | undefined, includeMetadata: boolean) {
  // Full backup would include all user data
  const [products, organizations, alerts, exports] = await Promise.all([
    prisma.product.findMany({ where: { userId } }),
    prisma.organization.findMany({ where: { userId } }),
    prisma.priceAlert.findMany({ where: { product: { userId } } }),
    prisma.dataExport.findMany({ where: { userId } })
  ])

  return {
    data: {
      products,
      organizations,
      priceAlerts: alerts,
      dataExports: exports,
      exportedAt: new Date().toISOString(),
      userId
    },
    total: products.length + organizations.length + alerts.length + exports.length
  }
}

// File generation functions
async function generateCSV(data: any[], filePath: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') 
        ? `"${value.replace(/"/g, '""')}"` 
        : value
    ).join(',')
  ).join('\n')

  await writeFile(filePath, `${headers}\n${rows}`)
}

async function generateJSON(data: any[], filePath: string, includeMetadata: boolean) {
  const exportData = {
    data,
    metadata: includeMetadata ? {
      exportedAt: new Date().toISOString(),
      totalRecords: data.length,
      version: '1.0'
    } : undefined
  }

  await writeFile(filePath, JSON.stringify(exportData, null, 2))
}

async function generateExcel(data: any[], filePath: string, dataType: string) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  XLSX.utils.book_append_sheet(workbook, worksheet, dataType)
  XLSX.writeFile(workbook, filePath)
}

async function getFileSize(filePath: string): Promise<number> {
  try {
    const fs = await import('fs/promises')
    const stats = await fs.stat(filePath)
    return stats.size
  } catch {
    return 0
  }
}
