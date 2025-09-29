import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔍 CREDENTIALS PROVIDER CALLED!', { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            console.log('❌ User not found or no password')
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValid) {
            console.log('❌ Invalid password')
            return null
          }

          console.log('✅ AUTHENTICATION SUCCESS!', { id: user.id, email: user.email })
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('❌ Error in authorize:', error)
          return null
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : [])
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Create new user with Google OAuth
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || profile?.name || '',
                image: user.image || (profile as any)?.picture || '',
                emailVerified: new Date(),
                provider: 'google',
                providerId: account.providerAccountId
              }
            })

            // Create default organization for new user
            const organization = await prisma.organization.create({
              data: {
                name: `${newUser.name || 'My'} Organization`,
                slug: `${newUser.name?.toLowerCase().replace(/\s+/g, '-') || 'my'}-org`,
                isPersonal: true
              }
            })

            // Add user to organization
            await prisma.organizationMember.create({
              data: {
                organizationId: organization.id,
                userId: newUser.id,
                role: 'owner'
              }
            })

            console.log('✅ Created new user and organization:', { userId: newUser.id, orgId: organization.id })
          } else {
            // Update existing user with Google info if needed
            if (!existingUser.image && user.image) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { 
                  image: user.image,
                  provider: 'google',
                  providerId: account.providerAccountId
                }
              })
            }
          }
        } catch (error) {
          console.error('Error in Google OAuth signIn callback:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
}

// Export function to check which OAuth providers are available
export const getAvailableOAuthProviders = () => {
  return {
    google: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    github: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
  }
} 