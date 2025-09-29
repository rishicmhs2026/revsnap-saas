import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://revsnap.com'
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and API endpoints
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /auth/

# Allow important pages
Allow: /pricing
Allow: /demo
Allow: /learn-more
Allow: /privacy-policy
Allow: /terms-of-service
Allow: /cookie-policy
Allow: /acceptable-use-policy

# Crawl delay for respectful scraping
Crawl-delay: 1`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
} 