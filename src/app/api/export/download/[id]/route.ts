import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get export record
    const exportRecord = await prisma.dataExport.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!exportRecord) {
      return NextResponse.json(
        { error: 'Export not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (exportRecord.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if export has expired (24 hours)
    const expiresAt = new Date(exportRecord.createdAt.getTime() + 24 * 60 * 60 * 1000)
    if (new Date() > expiresAt) {
      return NextResponse.json(
        { error: 'Export has expired' },
        { status: 410 }
      )
    }

    // Check if file exists
    if (!existsSync(exportRecord.filePath)) {
      return NextResponse.json(
        { error: 'Export file not found' },
        { status: 404 }
      )
    }

    try {
      // Read file
      const fileBuffer = await readFile(exportRecord.filePath)
      
      // Update download count
      await prisma.dataExport.update({
        where: { id },
        data: {
          downloadCount: { increment: 1 },
          lastDownloadedAt: new Date()
        }
      })

      // Determine content type
      const contentTypes = {
        csv: 'text/csv',
        json: 'application/json',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }

      const contentType = contentTypes[exportRecord.format as keyof typeof contentTypes] || 'application/octet-stream'

      // Return file
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${exportRecord.filename}"`,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'no-cache'
        }
      })

    } catch (fileError) {
      console.error('File read error:', fileError)
      return NextResponse.json(
        { error: 'Failed to read export file' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json(
      { error: 'Failed to download export' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove export
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get export record
    const exportRecord = await prisma.dataExport.findUnique({
      where: { id }
    })

    if (!exportRecord) {
      return NextResponse.json(
        { error: 'Export not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (exportRecord.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete file if it exists
    if (existsSync(exportRecord.filePath)) {
      try {
        await unlink(exportRecord.filePath)
      } catch (unlinkError) {
        console.error('Failed to delete export file:', unlinkError)
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete database record
    await prisma.dataExport.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Export deleted successfully'
    })

  } catch (error) {
    console.error('Delete export API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete export' },
      { status: 500 }
    )
  }
}



