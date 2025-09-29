// import puppeteer from 'puppeteer'
import { CompetitorData, PriceAlert } from './competitor-tracking'

export interface ScrapingConfig {
  name: string
  baseUrl: string
  selectors: {
    price: string[]
    title: string[]
    availability: string[]
    rating?: string[]
    reviews?: string[]
  }
  rateLimit: number
  requiresAuth: boolean
  headers?: Record<string, string>
  waitForSelector?: string
}

export interface ScrapingResult {
  success: boolean
  data?: CompetitorData
  error?: string
  timestamp: Date
  responseTime: number
}

export class RealCompetitorTracker {
  // private browser: puppeteer.Browser | null = null
  private browser: any = null
  private rateLimitMap: Map<string, number[]> = new Map()
  private session: any

  // Real competitor configurations
  private readonly COMPETITOR_CONFIGS: Record<string, ScrapingConfig> = {
    amazon: {
      name: 'Amazon',
      baseUrl: 'https://www.amazon.com',
      selectors: {
        price: [
          '.a-price-whole',
          '.a-price .a-offscreen',
          '#priceblock_ourprice',
          '#priceblock_dealprice',
          '.a-price-range .a-offscreen'
        ],
        title: [
          '#productTitle',
          '.product-title',
          'h1[data-automation-id="product-title"]'
        ],
        availability: [
          '#availability',
          '#availability-brief',
          '.a-color-success',
          '.a-color-error'
        ],
        rating: [
          '.a-icon-alt',
          '[data-hook="rating-out-of-text"]',
          '.a-star-rating-text'
        ],
        reviews: [
          '#acrCustomerReviewText',
          '[data-hook="total-review-count"]',
          '.a-size-base'
        ]
      },
      rateLimit: 10,
      requiresAuth: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    },
    bestbuy: {
      name: 'Best Buy',
      baseUrl: 'https://www.bestbuy.com',
      selectors: {
        price: [
          '.priceView-customer-price span',
          '.priceView-layout-large .priceView-customer-price',
          '.priceView-hero-price',
          '[data-testid="customer-price"]'
        ],
        title: [
          '.heading-5',
          'h1.heading-5',
          '.sku-title',
          '[data-testid="product-title"]'
        ],
        availability: [
          '.fulfillment-add-to-cart-button',
          '.add-to-cart-button',
          '[data-testid="fulfillment-add-to-cart-button"]'
        ],
        rating: [
          '.c-ratings-reviews-v2 .c-ratings-reviews-v2__rating',
          '.ratings-reviews-v2__rating'
        ],
        reviews: [
          '.c-ratings-reviews-v2 .c-ratings-reviews-v2__reviews',
          '.ratings-reviews-v2__reviews'
        ]
      },
      rateLimit: 15,
      requiresAuth: false,
      waitForSelector: '.priceView-customer-price'
    },
    walmart: {
      name: 'Walmart',
      baseUrl: 'https://www.walmart.com',
      selectors: {
        price: [
          '[data-price-type="finalPrice"] .visuallyhidden',
          '.price-characteristic',
          '.price-main',
          '[data-testid="price-wrap"]'
        ],
        title: [
          '.prod-ProductTitle',
          'h1.prod-ProductTitle',
          '[data-testid="product-title"]'
        ],
        availability: [
          '.prod-ProductOffer',
          '.fulfillment-add-to-cart-button',
          '[data-testid="fulfillment-add-to-cart-button"]'
        ],
        rating: [
          '.stars-container .stars',
          '[data-testid="rating-stars"]'
        ],
        reviews: [
          '.stars-container .stars-count',
          '[data-testid="reviews-count"]'
        ]
      },
      rateLimit: 20,
      requiresAuth: false
    },
    target: {
      name: 'Target',
      baseUrl: 'https://www.target.com',
      selectors: {
        price: [
          '[data-test="product-price"]',
          '.styles__PriceFontSize',
          '.h-text-bold'
        ],
        title: [
          '[data-test="product-title"]',
          'h1[data-test="product-title"]'
        ],
        availability: [
          '[data-test="shipItButton"]',
          '[data-test="orderPickupButton"]'
        ]
      },
      rateLimit: 12,
      requiresAuth: false
    }
  }

  // Initialize browser
  private async initBrowser(): Promise<void> {
    // if (!this.browser) {
    //   this.browser = await puppeteer.launch({
    //     headless: true,
    //     args: [
    //       '--no-sandbox',
    //       '--disable-setuid-sandbox',
    //       '--disable-dev-shm-usage',
    //       '--disable-accelerated-2d-canvas',
    //       '--no-first-run',
    //       '--no-zygote',
    //       '--disable-gpu'
    //     ]
    //   })
    // }
  }

  // Check rate limit
  private checkRateLimit(competitor: string): boolean {
    const now = Date.now()
    const windowMs = 60000 // 1 minute window
    const config = this.COMPETITOR_CONFIGS[competitor]
    
    if (!config) return false

    if (!this.rateLimitMap.has(competitor)) {
      this.rateLimitMap.set(competitor, [])
    }

    const requests = this.rateLimitMap.get(competitor)!
    const recentRequests = requests.filter(time => now - time < windowMs)
    
    if (recentRequests.length >= config.rateLimit) {
      return false
    }

    recentRequests.push(now)
    this.rateLimitMap.set(competitor, recentRequests)
    return true
  }

  // Extract text from element
  private async extractText(page: any, selectors: string[]): Promise<string> {
    for (const selector of selectors) {
      try {
        const element = await page.$(selector)
        if (element) {
          const text = await page.evaluate((el: any) => el.textContent?.trim(), element)
          if (text) return text
        }
      } catch (error) {
        continue
      }
    }
    return ''
  }

  // Extract price from text
  private extractPrice(priceText: string): number {
    const priceMatch = priceText.match(/[\$]?([\d,]+\.?\d*)/)
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(/,/g, ''))
    }
    return 0
  }

  // Extract rating from text
  private extractRating(ratingText: string): number {
    const ratingMatch = ratingText.match(/(\d+\.?\d*)/)
    if (ratingMatch) {
      const rating = parseFloat(ratingMatch[1])
      return rating > 5 ? rating / 10 : rating // Handle 5-star vs 10-point scales
    }
    return 0
  }

  // Extract review count
  private extractReviewCount(reviewText: string): number {
    const reviewMatch = reviewText.match(/(\d+(?:,\d+)*)/)
    if (reviewMatch) {
      return parseInt(reviewMatch[1].replace(/,/g, ''))
    }
    return 0
  }

  // Scrape competitor data
  async scrapeCompetitor(
    url: string, 
    competitor: string, 
    productId: string
  ): Promise<ScrapingResult> {
    const startTime = Date.now()
    
    try {
      // Check rate limit
      if (!this.checkRateLimit(competitor)) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          timestamp: new Date(),
          responseTime: Date.now() - startTime
        }
      }

      await this.initBrowser()
      const page = await this.browser!.newPage()
      
      const config = this.COMPETITOR_CONFIGS[competitor]
      if (!config) {
        throw new Error(`Unsupported competitor: ${competitor}`)
      }

      // Set headers
      if (config.headers) {
        await page.setExtraHTTPHeaders(config.headers)
      }

      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

      // Navigate to page
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      })

      // Wait for specific selector if configured
      if (config.waitForSelector) {
        try {
          await page.waitForSelector(config.waitForSelector, { timeout: 10000 })
        } catch (error) {
          console.warn(`Selector ${config.waitForSelector} not found for ${competitor}`)
        }
      }

      // Extract data
      const title = await this.extractText(page, config.selectors.title)
      const priceText = await this.extractText(page, config.selectors.price)
      const availabilityText = await this.extractText(page, config.selectors.availability)
      const ratingText = config.selectors.rating ? await this.extractText(page, config.selectors.rating) : ''
      const reviewText = config.selectors.reviews ? await this.extractText(page, config.selectors.reviews) : ''

      // Process extracted data
      const currentPrice = this.extractPrice(priceText)
      const availability = availabilityText.toLowerCase().includes('in stock') || 
                          availabilityText.toLowerCase().includes('add to cart') ||
                          availabilityText.toLowerCase().includes('buy now')
      const rating = this.extractRating(ratingText)
      const reviewCount = this.extractReviewCount(reviewText)

      await page.close()

      if (!title || currentPrice === 0) {
        return {
          success: false,
          error: 'Could not extract product data',
          timestamp: new Date(),
          responseTime: Date.now() - startTime
        }
      }

      const data: CompetitorData = {
        id: `${competitor}-${productId}-${Date.now()}`,
        competitor: config.name,
        productName: title,
        currentPrice,
        previousPrice: 0, // Will be set by tracking service
        priceChange: 0, // Will be calculated by tracking service
        lastUpdated: new Date(),
        source: url,
        availability,
        currency: 'USD',
        rating: rating > 0 ? rating : undefined,
        reviewCount: reviewCount > 0 ? reviewCount : undefined,
        url
      }

      return {
        success: true,
        data,
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      }

    } catch (error) {
      console.error(`Error scraping ${competitor}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      }
    }
  }

  // API-based tracking for supported platforms
  async trackViaAPI(competitor: string, productId: string): Promise<ScrapingResult> {
    const startTime = Date.now()
    
    try {
      switch (competitor) {
        case 'shopify':
          return await this.trackShopify(productId)
        case 'amazon_api':
          return await this.trackAmazonAPI(productId)
        case 'ebay':
          return await this.trackEbay(productId)
        default:
          throw new Error(`Unsupported API competitor: ${competitor}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      }
    }
  }

  // Track Shopify store
  private async trackShopify(productId: string): Promise<ScrapingResult> {
    const [store, handle] = productId.split(':')
    const url = `https://${store}.myshopify.com/products/${handle}.js`
    
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch Shopify data')
      
      const data = await response.json()
      
      const result: CompetitorData = {
        id: `shopify-${productId}-${Date.now()}`,
        competitor: 'Shopify Store',
        productName: data.title,
        currentPrice: parseFloat(data.variants[0]?.price || '0'),
        previousPrice: 0,
        priceChange: 0,
        lastUpdated: new Date(),
        source: url,
        availability: data.variants[0]?.available || false,
        currency: 'USD',
        url: `https://${store}.myshopify.com/products/${handle}`
      }

      return {
        success: true,
        data: result,
        timestamp: new Date(),
        responseTime: Date.now()
      }
    } catch (error) {
      throw new Error(`Shopify tracking failed: ${error}`)
    }
  }

  // Track Amazon via API (requires Rainforest API key)
  private async trackAmazonAPI(asin: string): Promise<ScrapingResult> {
    const apiKey = process.env.RAINFOREST_API_KEY
    if (!apiKey) {
      throw new Error('Rainforest API key not configured')
    }

    const url = `https://api.rainforestapi.com/request?api_key=${apiKey}&type=product&amazon_domain=amazon.com&asin=${asin}`
    
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch Amazon API data')
      
      const data = await response.json()
      
      const result: CompetitorData = {
        id: `amazon-api-${asin}-${Date.now()}`,
        competitor: 'Amazon',
        productName: data.product.title,
        currentPrice: parseFloat(data.product.price?.value || '0'),
        previousPrice: 0,
        priceChange: 0,
        lastUpdated: new Date(),
        source: data.product.link,
        availability: data.product.availability_status === 'in_stock',
        currency: 'USD',
        rating: parseFloat(data.product.rating || '0'),
        reviewCount: parseInt(data.product.ratings_total || '0'),
        url: data.product.link
      }

      return {
        success: true,
        data: result,
        timestamp: new Date(),
        responseTime: Date.now()
      }
    } catch (error) {
      throw new Error(`Amazon API tracking failed: ${error}`)
    }
  }

  // Track eBay via API
  private async trackEbay(itemId: string): Promise<ScrapingResult> {
    const apiKey = process.env.EBAY_API_KEY
    if (!apiKey) {
      throw new Error('eBay API key not configured')
    }

    const url = `https://api.ebay.com/buy/browse/v1/item/${itemId}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY-US'
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch eBay API data')
      
      const data = await response.json()
      
      const result: CompetitorData = {
        id: `ebay-${itemId}-${Date.now()}`,
        competitor: 'eBay',
        productName: data.title,
        currentPrice: parseFloat(data.price?.value || '0'),
        previousPrice: 0,
        priceChange: 0,
        lastUpdated: new Date(),
        source: data.itemWebUrl,
        availability: data.buyingOptions?.includes('FIXED_PRICE') || false,
        currency: data.price?.currency || 'USD',
        rating: parseFloat(data.seller?.feedbackScore || '0'),
        url: data.itemWebUrl
      }

      return {
        success: true,
        data: result,
        timestamp: new Date(),
        responseTime: Date.now()
      }
    } catch (error) {
      throw new Error(`eBay API tracking failed: ${error}`)
    }
  }

  // Batch tracking with error handling
  async trackMultipleCompetitors(
    products: Array<{id: string, competitors: string[], urls?: Record<string, string>}>
  ): Promise<CompetitorData[]> {
    const results: CompetitorData[] = []
    
    for (const product of products) {
      for (const competitor of product.competitors) {
        try {
          let result: ScrapingResult
          
          if (competitor.includes('_api')) {
            // API-based tracking
            result = await this.trackViaAPI(competitor, product.id)
          } else {
            // Web scraping
            const url = product.urls?.[competitor] || this.generateCompetitorUrl(competitor, product.id)
            result = await this.scrapeCompetitor(url, competitor, product.id)
          }
          
          if (result.success && result.data) {
            results.push(result.data)
          } else {
            console.warn(`Failed to track ${competitor} for product ${product.id}: ${result.error}`)
          }
          
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (error) {
          console.error(`Error tracking ${competitor} for product ${product.id}:`, error)
        }
      }
    }
    
    return results
  }

  // Generate competitor URL
  private generateCompetitorUrl(competitor: string, productId: string): string {
    const config = this.COMPETITOR_CONFIGS[competitor]
    if (!config) {
      throw new Error(`Unsupported competitor: ${competitor}`)
    }
    
    return `${config.baseUrl}/dp/${productId}`
  }

  // Cleanup
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

export const realCompetitorTracker = new RealCompetitorTracker() 