/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://revsnap.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/api/*',
    '/auth/reset-password',
    '/offline',
    '/_not-found'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/reset-password', '/offline', '/_not-found']
      }
    ],
    additionalSitemaps: [
      'https://revsnap.com/sitemap.xml'
    ]
  },
  transform: async (config, path) => {
    // Custom transform for different page types
    const customConfig = {
      loc: path,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString()
    }

    // Homepage gets highest priority
    if (path === '/') {
      customConfig.priority = 1.0
      customConfig.changefreq = 'daily'
    }

    // Dashboard and main features get high priority
    if (path.includes('/dashboard') || path.includes('/competitor-tracking') || path.includes('/products')) {
      customConfig.priority = 0.9
      customConfig.changefreq = 'daily'
    }

    // Static pages get lower priority
    if (path.includes('/privacy-policy') || path.includes('/terms-of-service') || path.includes('/cookie-policy')) {
      customConfig.priority = 0.3
      customConfig.changefreq = 'monthly'
    }

    return customConfig
  }
}


