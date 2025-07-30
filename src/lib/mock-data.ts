import { CompetitorData, PriceAlert } from './competitor-tracking'

// Mock competitor data generator
export class MockDataService {
  private static instance: MockDataService
  private mockPrices: Map<string, number> = new Map()

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService()
    }
    return MockDataService.instance
  }

  // Generate realistic price variations
  private generatePriceVariation(basePrice: number, volatility: number = 0.05): number {
    const variation = (Math.random() - 0.5) * 2 * volatility * basePrice
    return Math.max(basePrice + variation, basePrice * 0.8) // Don't go below 80% of base price
  }

  // Get or create base price for a competitor
  private getBasePrice(competitor: string, productName: string): number {
    const key = `${competitor}-${productName}`
    
    if (!this.mockPrices.has(key)) {
      // Set realistic base prices
      const basePrices: Record<string, number> = {
        'Amazon-Wireless Headphones': 89.99,
        'Best Buy-Wireless Headphones': 94.99,
        'Walmart-Wireless Headphones': 79.99,
        'Amazon-Smartphone': 699.99,
        'Best Buy-Smartphone': 749.99,
        'Walmart-Smartphone': 649.99,
        'Amazon-Laptop': 899.99,
        'Best Buy-Laptop': 949.99,
        'Walmart-Laptop': 849.99,
      }
      
      this.mockPrices.set(key, basePrices[key] || 99.99)
    }
    
    return this.mockPrices.get(key)!
  }

  // Generate mock competitor data
  generateCompetitorData(
    competitor: string, 
    productName: string, 
    productId: string
  ): CompetitorData {
    const basePrice = this.getBasePrice(competitor, productName)
    const currentPrice = this.generatePriceVariation(basePrice)
    
    // Update base price with some persistence
    const key = `${competitor}-${productName}`
    this.mockPrices.set(key, currentPrice)

    return {
      id: `${competitor}-${productId}-${Date.now()}`,
      competitor,
      productName,
      currentPrice: Math.round(currentPrice * 100) / 100, // Round to 2 decimal places
      previousPrice: 0, // Will be set by tracking service
      priceChange: 0, // Will be calculated by tracking service
      lastUpdated: new Date(),
      source: this.getCompetitorUrl(competitor, productId),
      availability: Math.random() > 0.1, // 90% availability
      currency: 'USD',
      rating: 3.5 + Math.random() * 1.5, // 3.5-5.0 rating
      reviewCount: Math.floor(Math.random() * 1000) + 50, // 50-1050 reviews
      url: this.getCompetitorUrl(competitor, productId)
    }
  }

  // Generate mock price alerts
  generatePriceAlerts(currentPrices: CompetitorData[], previousPrices: CompetitorData[]): PriceAlert[] {
    const alerts: PriceAlert[] = []
    
    for (const current of currentPrices) {
      const previous = previousPrices.find(p => 
        p.competitor === current.competitor && p.productName === current.productName
      )
      
      if (previous && Math.abs(current.currentPrice - previous.currentPrice) > 1) {
        const changePercent = ((current.currentPrice - previous.currentPrice) / previous.currentPrice) * 100
        
        let severity: 'high' | 'medium' | 'low' = 'low'
        if (Math.abs(changePercent) >= 10) {
          severity = 'high'
        } else if (Math.abs(changePercent) >= 5) {
          severity = 'medium'
        }
        
        alerts.push({
          id: `alert-${current.id}-${Date.now()}`,
          competitor: current.competitor,
          productName: current.productName,
          oldPrice: previous.currentPrice,
          newPrice: current.currentPrice,
          changePercent: Math.round(changePercent * 100) / 100,
          timestamp: new Date(),
          severity,
          threshold: severity === 'high' ? 10 : severity === 'medium' ? 5 : 2
        })
      }
    }
    
    return alerts
  }

  // Get competitor URL
  private getCompetitorUrl(competitor: string, productId: string): string {
    const baseUrls: Record<string, string> = {
      'Amazon': 'https://www.amazon.com/dp',
      'Best Buy': 'https://www.bestbuy.com/site',
      'Walmart': 'https://www.walmart.com/ip'
    }
    
    return `${baseUrls[competitor] || 'https://example.com'}/${productId}`
  }

  // Simulate network delay
  async simulateDelay(minMs: number = 500, maxMs: number = 2000): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // Simulate occasional failures
  async simulateFailure(probability: number = 0.05): Promise<boolean> {
    if (Math.random() < probability) {
      throw new Error('Simulated network error')
    }
    return false
  }
}

export const mockDataService = MockDataService.getInstance() 