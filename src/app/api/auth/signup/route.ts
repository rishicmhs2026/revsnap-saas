import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { databaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      organizationName,
      organizationSlug,
      industry,
      size
    } = body

    // Validate required fields
    if (!name || !email || !password || !organizationName || !organizationSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await databaseService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check if organization slug is already taken
    const existingOrg = await databaseService.getOrganizationBySlug(organizationSlug)
    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization URL is already taken' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await databaseService.createUser({
      name,
      email,
      password: hashedPassword
    })

    // Create organization
    const organization = await databaseService.createOrganization({
      name: organizationName,
      slug: organizationSlug,
      industry,
      size,
      userId: user.id
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug
        }
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
} 