import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@revsnap.com' },
    update: {
      role: 'super_admin',
      isAdmin: true,
    },
    create: {
      email: 'admin@revsnap.com',
      name: 'Admin User',
      password: hashedPassword,
      emailVerified: new Date(),
      role: 'super_admin',
      isAdmin: true,
    },
  })

  // Create a test organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Company',
      slug: 'demo-company',
      description: 'A demo organization for testing',
      industry: 'Technology',
      size: 'medium',
      userId: user.id,
    },
  })

  // Create test products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'demo-product-1' },
      update: {},
      create: {
        id: 'demo-product-1',
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        sku: 'WH-001',
        category: 'Electronics',
        brand: 'AudioTech',
        yourPrice: 89.99,
        currency: 'USD',
        organizationId: organization.id,
        userId: user.id,
      },
    }),
    prisma.product.upsert({
      where: { id: 'demo-product-2' },
      update: {},
      create: {
        id: 'demo-product-2',
        name: 'Smartphone',
        description: 'Latest smartphone with advanced features',
        sku: 'SP-002',
        category: 'Electronics',
        brand: 'TechCorp',
        yourPrice: 699.99,
        currency: 'USD',
        organizationId: organization.id,
        userId: user.id,
      },
    }),
    prisma.product.upsert({
      where: { id: 'demo-product-3' },
      update: {},
      create: {
        id: 'demo-product-3',
        name: 'Laptop',
        description: 'Professional laptop for business use',
        sku: 'LP-003',
        category: 'Electronics',
        brand: 'CompTech',
        yourPrice: 899.99,
        currency: 'USD',
        organizationId: organization.id,
        userId: user.id,
      },
    }),
  ])

  // Create sample competitor data
  const competitorData = await Promise.all([
    // Headphones competitor data
    prisma.competitorData.create({
      data: {
        competitor: 'Amazon',
        productName: 'Wireless Headphones',
        currentPrice: 94.99,
        previousPrice: 89.99,
        priceChange: 5.00,
        source: 'Amazon',
        availability: true,
        currency: 'USD',
        rating: 4.2,
        reviewCount: 1250,
        url: 'https://amazon.com/dp/123456789',
        productId: 'demo-product-1',
      },
    }),
    prisma.competitorData.create({
      data: {
        competitor: 'Best Buy',
        productName: 'Wireless Headphones',
        currentPrice: 99.99,
        previousPrice: 94.99,
        priceChange: 5.00,
        source: 'Best Buy',
        availability: true,
        currency: 'USD',
        rating: 4.0,
        reviewCount: 890,
        url: 'https://bestbuy.com/site/123456789',
        productId: 'demo-product-1',
      },
    }),
    // Smartphone competitor data
    prisma.competitorData.create({
      data: {
        competitor: 'Amazon',
        productName: 'Smartphone',
        currentPrice: 679.99,
        previousPrice: 699.99,
        priceChange: -20.00,
        source: 'Amazon',
        availability: true,
        currency: 'USD',
        rating: 4.5,
        reviewCount: 2100,
        url: 'https://amazon.com/dp/987654321',
        productId: 'demo-product-2',
      },
    }),
    prisma.competitorData.create({
      data: {
        competitor: 'Walmart',
        productName: 'Smartphone',
        currentPrice: 649.99,
        previousPrice: 679.99,
        priceChange: -30.00,
        source: 'Walmart',
        availability: true,
        currency: 'USD',
        rating: 4.1,
        reviewCount: 1560,
        url: 'https://walmart.com/ip/987654321',
        productId: 'demo-product-2',
      },
    }),
  ])

  // Create sample price alerts
  const priceAlerts = await Promise.all([
    prisma.priceAlert.create({
      data: {
        competitor: 'Amazon',
        productName: 'Smartphone',
        oldPrice: 699.99,
        newPrice: 679.99,
        changePercent: -2.86,
        severity: 'medium',
        threshold: 5,
        productId: 'demo-product-2',
        userId: user.id,
      },
    }),
    prisma.priceAlert.create({
      data: {
        competitor: 'Walmart',
        productName: 'Smartphone',
        oldPrice: 679.99,
        newPrice: 649.99,
        changePercent: -4.41,
        severity: 'medium',
        threshold: 5,
        productId: 'demo-product-2',
        userId: user.id,
      },
    }),
  ])

  // Create tracking jobs
  const trackingJobs = await Promise.all([
    prisma.trackingJob.create({
      data: {
        productId: 'demo-product-1',
        competitors: JSON.stringify(['Amazon', 'Best Buy', 'Walmart']),
        intervalMinutes: 15,
        isActive: true,
        nextRun: new Date(Date.now() + 15 * 60 * 1000),
      },
    }),
    prisma.trackingJob.create({
      data: {
        productId: 'demo-product-2',
        competitors: JSON.stringify(['Amazon', 'Walmart']),
        intervalMinutes: 30,
        isActive: true,
        nextRun: new Date(Date.now() + 30 * 60 * 1000),
      },
    }),
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Created user: ${user.email}`)
  console.log(`🏢 Created organization: ${organization.name}`)
  console.log(`📦 Created ${products.length} products`)
  console.log(`📊 Created ${competitorData.length} competitor data entries`)
  console.log(`🚨 Created ${priceAlerts.length} price alerts`)
  console.log(`🔄 Created ${trackingJobs.length} tracking jobs`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 