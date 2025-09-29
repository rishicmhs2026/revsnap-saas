// import * as puppeteer from 'puppeteer'
import { mockDataService } from './mock-data'

// Types
export interface CompetitorData {
  id: string
  competitor: string
  productName: string
  currentPrice: number
  previousPrice: number
  priceChange: number
  lastUpdated: Date
  source: string
  availability: boolean
  currency: string
  shipping?: number
  rating?: number
  reviewCount?: number
  url: string
}

export interface PriceAlert {
  id: string
  competitor: string
  productName: string
  oldPrice: number
  newPrice: number
  changePercent: number
  timestamp: Date
  severity: 'high' | 'medium' | 'low'
  threshold: number
}

export interface CompetitorConfig {
  name: string
  baseUrl: string
  selectors: {
    price: string
    title?: string
    availability?: string
    rating?: string
    reviews?: string
  }
  rateLimit: number // requests per minute
  requiresAuth: boolean
  apiKey?: string
}

// Competitor configurations
const COMPETITOR_CONFIGS: Record<string, CompetitorConfig> = {
  amazon: {
    name: 'Amazon',
    baseUrl: 'https://www.amazon.com',
    selectors: {
      price: '.a-price-whole, .a-price .a-offscreen',
      title: '#productTitle',
      availability: '#availability',
      rating: '.a-icon-alt',
      reviews: '#acrCustomerReviewText'
    },
    rateLimit: 10,
    requiresAuth: false
  },
  bestbuy: {
    name: 'Best Buy',
    baseUrl: 'https://www.bestbuy.com',
    selectors: {
      price: '.priceView-customer-price span',
      title: '.heading-5',
      availability: '.fulfillment-add-to-cart-button'
    },
    rateLimit: 15,
    requiresAuth: false
  },
  walmart: {
    name: 'Walmart',
    baseUrl: 'https://www.walmart.com',
    selectors: {
      price: '[data-price-type="finalPrice"] .visuallyhidden',
      title: '.prod-ProductTitle',
      availability: '.prod-ProductOffer'
    },
    rateLimit: 20,
    requiresAuth: false
  }
}

// API integrations
const API_ENDPOINTS = {
  shopify: (store: string, productHandle: string) => 
    `https://${store}.myshopify.com/products/${productHandle}.js`,
  amazon: (asin: string) => 
    `https://api.rainforestapi.com/request?api_key=${process.env.RAINFOREST_API_KEY}&type=product&amazon_domain=amazon.com&asin=${asin}`,
  ebay: (itemId: string) => 
    `https://api.ebay.com/buy/browse/v1/item/${itemId}`
}

export class CompetitorTracker {
  // private browser: puppeteer.Browser | null = null
  private browser: any = null
  private rateLimiters: Map<string, number[]> = new Map()

  async initialize() {
    // this.browser = await puppeteer.launch({
    //   headless: true,
    //   args: ['--no-sandbox', '--disable-setuid-sandbox']
    // })
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  // Rate limiting
  private async checkRateLimit(competitor: string): Promise<boolean> {
    const now = Date.now()
    const oneMinute = 60 * 1000
    
    if (!this.rateLimiters.has(competitor)) {
      this.rateLimiters.set(competitor, [])
    }
    
    const requests = this.rateLimiters.get(competitor)!
    const config = COMPETITOR_CONFIGS[competitor]
    
    // Remove old requests
    const recentRequests = requests.filter(time => now - time < oneMinute)
    this.rateLimiters.set(competitor, recentRequests)
    
    if (recentRequests.length >= config.rateLimit) {
      return false
    }
    
    recentRequests.push(now)
    return true
  }

  // Web scraping with Puppeteer
  async scrapeCompetitor(url: string, competitor: string): Promise<CompetitorData | null> {
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    const config = COMPETITOR_CONFIGS[competitor]
    if (!config) {
      throw new Error(`Unknown competitor: ${competitor}`)
    }

    // Check rate limit
    if (!(await this.checkRateLimit(competitor))) {
      throw new Error(`Rate limit exceeded for ${competitor}`)
    }

    try {
      const page = await this.browser.newPage()
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      
      // Add random delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))
      
      await page.goto(url, { waitUntil: 'networkidle2' })
      
      // Extract price
      const priceElement = await page.$(config.selectors.price)
      if (!priceElement) {
        throw new Error('Price element not found')
      }
      
      const priceText = await priceElement.evaluate((el: Element) => el.textContent)
      const price = this.extractPrice(priceText || '')
      
      // Extract other data
      const title = config.selectors.title ? 
        await page.$eval(config.selectors.title, (el: Element) => el.textContent?.trim()) : 
        'Unknown Product'
      
      const availability = config.selectors.availability ?
        await page.$(config.selectors.availability) !== null : true
      
      await page.close()
      
      return {
        id: `${competitor}-${Date.now()}`,
        competitor: config.name,
        productName: title || 'Unknown Product',
        currentPrice: price,
        previousPrice: 0, // Will be updated from database
        priceChange: 0,
        lastUpdated: new Date(),
        source: url,
        availability,
        currency: 'USD',
        url
      }
      
    } catch (error) {
      console.error(`Error scraping ${competitor}:`, error)
      return null
    }
  }

  // API-based competitor tracking
  async trackViaAPI(competitor: string, productId: string): Promise<CompetitorData | null> {
    try {
      let data: any
      
      switch (competitor) {
        case 'shopify':
          const [store, handle] = productId.split(':')
          const response = await fetch(API_ENDPOINTS.shopify(store, handle))
          data = await response.json()
          
          return {
            id: `shopify-${productId}`,
            competitor: 'Shopify Store',
            productName: data.title,
            currentPrice: parseFloat(data.variants[0]?.price || '0'),
            previousPrice: 0,
            priceChange: 0,
            lastUpdated: new Date(),
            source: `https://${store}.myshopify.com/products/${handle}`,
            availability: data.variants[0]?.available || false,
            currency: 'USD',
            url: `https://${store}.myshopify.com/products/${handle}`
          }
          
        case 'amazon':
          const amazonResponse = await fetch(API_ENDPOINTS.amazon(productId))
          const amazonData = await amazonResponse.json()
          
          return {
            id: `amazon-${productId}`,
            competitor: 'Amazon',
            productName: amazonData.product.title,
            currentPrice: parseFloat(amazonData.product.price?.value || '0'),
            previousPrice: 0,
            priceChange: 0,
            lastUpdated: new Date(),
            source: amazonData.product.link,
            availability: amazonData.product.availability_status === 'in_stock',
            currency: 'USD',
            rating: parseFloat(amazonData.product.rating || '0'),
            reviewCount: parseInt(amazonData.product.ratings_total || '0'),
            url: amazonData.product.link
          }
          
        default:
          throw new Error(`Unsupported API competitor: ${competitor}`)
      }
    } catch (error) {
      console.error(`Error tracking via API ${competitor}:`, error)
      return null
    }
  }

  // Batch tracking
  async trackMultipleCompetitors(products: Array<{id: string, competitors: string[]}>): Promise<CompetitorData[]> {
    const results: CompetitorData[] = []
    
    for (const product of products) {
      for (const competitor of product.competitors) {
        try {
          // For demo purposes, use mock data instead of real scraping
          // In production, this would use the real tracking logic below
          if (process.env.NODE_ENV === 'development' || process.env.USE_MOCK_DATA === 'true') {
            // Simulate network delay
            await mockDataService.simulateDelay(200, 800)
            
            // Simulate occasional failures
            await mockDataService.simulateFailure(0.02) // 2% failure rate
            
            // Generate mock data
            const mockData = mockDataService.generateCompetitorData(
              competitor, 
              'Wireless Headphones', // You can make this dynamic based on product
              product.id
            )
            
            results.push(mockData)
            continue
          }
          
          // Real tracking logic (commented out for demo)
          // Try API first, then fallback to scraping
          let data = await this.trackViaAPI(competitor, product.id)
          
          if (!data) {
            // Fallback to scraping
            const url = this.buildCompetitorUrl(competitor, product.id)
            data = await this.scrapeCompetitor(url, competitor)
          }
          
          if (data) {
            results.push(data)
          }
        } catch (error) {
          console.error(`Error tracking ${competitor} for product ${product.id}:`, error)
        }
      }
    }
    
    return results
  }

  // Price alert generation
  generatePriceAlerts(
    currentPrices: CompetitorData[], 
    previousPrices: CompetitorData[],
    thresholds: { high: number, medium: number, low: number } = { high: 10, medium: 5, low: 2 }
  ): PriceAlert[] {
    const alerts: PriceAlert[] = []
    
    for (const current of currentPrices) {
      const previous = previousPrices.find(p => 
        p.competitor === current.competitor && p.productName === current.productName
      )
      
      if (previous && previous.currentPrice !== current.currentPrice) {
        const changePercent = ((current.currentPrice - previous.currentPrice) / previous.currentPrice) * 100
        
        let severity: 'high' | 'medium' | 'low' = 'low'
        if (Math.abs(changePercent) >= thresholds.high) {
          severity = 'high'
        } else if (Math.abs(changePercent) >= thresholds.medium) {
          severity = 'medium'
        }
        
        alerts.push({
          id: `alert-${current.id}-${Date.now()}`,
          competitor: current.competitor,
          productName: current.productName,
          oldPrice: previous.currentPrice,
          newPrice: current.currentPrice,
          changePercent,
          timestamp: new Date(),
          severity,
          threshold: thresholds[severity]
        })
      }
    }
    
    return alerts
  }

  // Market analysis
  analyzeMarketPosition(prices: CompetitorData[], yourPrice: number) {
    const validPrices = prices.filter(p => p.currentPrice > 0)
    
    if (validPrices.length === 0) return null
    
    const sortedPrices = validPrices.sort((a, b) => a.currentPrice - b.currentPrice)
    const lowestPrice = sortedPrices[0]
    const highestPrice = sortedPrices[sortedPrices.length - 1]
    const averagePrice = validPrices.reduce((sum, p) => sum + p.currentPrice, 0) / validPrices.length
    
    const yourPosition = sortedPrices.findIndex(p => p.currentPrice >= yourPrice) + 1
    const percentile = (yourPosition / sortedPrices.length) * 100
    
    return {
      lowestPrice,
      highestPrice,
      averagePrice,
      yourPosition,
      percentile,
      priceRange: highestPrice.currentPrice - lowestPrice.currentPrice,
      recommendations: this.generateRecommendations(yourPrice, averagePrice, lowestPrice.currentPrice)
    }
  }

  // AI-powered recommendations
  private generateRecommendations(yourPrice: number, averagePrice: number, lowestPrice: number) {
    const recommendations = []
    
    if (yourPrice > averagePrice * 1.1) {
      recommendations.push({
        type: 'price_adjustment',
        priority: 'high',
        message: `Consider lowering price to $${(averagePrice * 0.95).toFixed(2)} to be competitive`,
        suggestedPrice: averagePrice * 0.95
      })
    }
    
    if (yourPrice < lowestPrice * 0.9) {
      recommendations.push({
        type: 'price_increase',
        priority: 'medium',
        message: `You can increase price to $${(lowestPrice * 1.05).toFixed(2)} and still be competitive`,
        suggestedPrice: lowestPrice * 1.05
      })
    }
    
    if (yourPrice > averagePrice) {
      recommendations.push({
        type: 'value_proposition',
        priority: 'medium',
        message: 'Focus on value-add services to justify premium pricing',
        suggestedPrice: yourPrice
      })
    }
    
    return recommendations
  }

  // Utility methods
  private extractPrice(priceText: string): number {
    const match = priceText.match(/[\d,]+\.?\d*/)
    return match ? parseFloat(match[0].replace(/,/g, '')) : 0
  }

  private buildCompetitorUrl(competitor: string, productId: string): string {
    const config = COMPETITOR_CONFIGS[competitor]
    if (!config) throw new Error(`Unknown competitor: ${competitor}`)
    
    switch (competitor) {
      case 'amazon':
        return `${config.baseUrl}/dp/${productId}`
      case 'bestbuy':
        return `${config.baseUrl}/site/${productId}`
      case 'walmart':
        return `${config.baseUrl}/ip/${productId}`
      default:
        throw new Error(`Cannot build URL for competitor: ${competitor}`)
    }
  }

  // Database operations - now handled by database service
async saveCompetitorData(data: CompetitorData): Promise<void> {
  // This is now handled by the database service in API routes
  console.log('Saving competitor data:', data)
}

async getPreviousPrices(competitor: string, productName: string): Promise<CompetitorData[]> {
  // This is now handled by the database service in API routes
  return []
}

async savePriceAlert(alert: PriceAlert): Promise<void> {
  // This is now handled by the database service in API routes
  console.log('Saving price alert:', alert)
}
}

// Singleton instance
export const competitorTracker = new CompetitorTracker()

// Initialize on module load
if (typeof window === 'undefined') {
  competitorTracker.initialize().catch(console.error)
} 