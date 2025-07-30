import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await databaseService.getUserByEmail(email)
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save reset token to database
    await databaseService.savePasswordResetToken({
      userId: user.id,
      token: resetToken,
      expiresAt: resetTokenExpiry
    })

    // In a real application, you would send an email here
    // For now, we'll just return the token (in production, this would be sent via email)
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent to your email',
      // Remove this in production - only for development
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    // Validate reset token
    const resetToken = await databaseService.validatePasswordResetToken(token)
    
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user password
    await databaseService.updateUser(resetToken.userId, {
      password: hashedPassword
    })

    // Delete the used reset token
    await databaseService.deletePasswordResetToken(token)

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
} 