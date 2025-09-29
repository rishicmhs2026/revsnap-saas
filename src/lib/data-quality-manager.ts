// Data quality and competitor URL guidance system
export interface CompetitorGuidance {
  platform: string
  urlPattern: string
  instructions: string
  dataQuality: 'high' | 'medium' | 'low'
  apiAvailable: boolean
}

export interface DataQualityIndicator {
  score: number
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'insufficient'
  color: string
  message: string
  recommendations: string[]
}

export class DataQualityManager {
  private competitorGuidance: CompetitorGuidance[] = [
    {
      platform: 'Amazon',
      urlPattern: 'https://www.amazon.com/dp/{ASIN}',
      instructions: 'Copy the product URL from Amazon product page. Look for the ASIN in the URL.',
      dataQuality: 'high',
      apiAvailable: true
    },
    {
      platform: 'Walmart',
      urlPattern: 'https://www.walmart.com/ip/{product-name}/{item-id}',
      instructions: 'Copy the product URL from Walmart product page. The item ID is in the URL.',
      dataQuality: 'high',
      apiAvailable: true
    },
    {
      platform: 'Target',
      urlPattern: 'https://www.target.com/p/{product-name}/-/{tcin}',
      instructions: 'Copy the product URL from Target product page. The TCIN is the product identifier.',
      dataQuality: 'medium',
      apiAvailable: false
    },
    {
      platform: 'Best Buy',
      urlPattern: 'https://www.bestbuy.com/site/{product-name}/{sku}.p',
      instructions: 'Copy the product URL from Best Buy product page. The SKU is in the URL.',
      dataQuality: 'medium',
      apiAvailable: false
    },
    {
      platform: 'eBay',
      urlPattern: 'https://www.ebay.com/itm/{item-id}',
      instructions: 'Copy the product URL from eBay listing. Note: eBay prices may vary significantly.',
      dataQuality: 'low',
      apiAvailable: false
    }
  ]

  // Calculate data quality score and provide recommendations
  calculateDataQuality(
    sources: Array<{
      type: 'api' | 'scraping' | 'manual' | 'historical'
      reliability: number
      lastUpdated: Date
      price?: number
    }>
  ): DataQualityIndicator {
    if (sources.length === 0) {
      return {
        score: 0,
        level: 'insufficient',
        color: 'red',
        message: 'No data sources available',
        recommendations: [
          'Provide competitor product URLs for automated data collection',
          'Manually enter competitor prices as a fallback',
          'Consider using official APIs (Amazon SP-API, Walmart API)'
        ]
      }
    }

    // Calculate weighted score based on source types and reliability
    let totalScore = 0
    let totalWeight = 0

    sources.forEach(source => {
      let weight = 1
      let baseScore = source.reliability

      // Weight by source type
      switch (source.type) {
        case 'api':
          weight = 3
          baseScore = Math.min(source.reliability * 1.2, 100)
          break
        case 'historical':
          weight = 2
          baseScore = source.reliability * 0.9
          break
        case 'scraping':
          weight = 1.5
          baseScore = source.reliability * 0.7
          break
        case 'manual':
          weight = 1
          baseScore = source.reliability * 0.8
          break
      }

      // Weight by data freshness
      const hoursOld = (Date.now() - source.lastUpdated.getTime()) / (1000 * 60 * 60)
      const freshnessMultiplier = Math.max(0.5, 1 - hoursOld / 48) // 48 hours = 50% score
      
      totalScore += baseScore * weight * freshnessMultiplier
      totalWeight += weight
    })

    const finalScore = Math.round(totalScore / totalWeight)
    
    return this.getQualityLevel(finalScore, sources)
  }

  private getQualityLevel(score: number, sources: any[]): DataQualityIndicator {
    let level: DataQualityIndicator['level']
    let color: string
    let message: string
    let recommendations: string[] = []

    if (score >= 80) {
      level = 'excellent'
      color = 'green'
      message = 'High-quality data from reliable sources'
    } else if (score >= 60) {
      level = 'good'
      color = 'blue'
      message = 'Good data quality with minor improvements possible'
      recommendations.push('Consider adding more data sources for better accuracy')
    } else if (score >= 40) {
      level = 'fair'
      color = 'yellow'
      message = 'Fair data quality - results may have some uncertainty'
      recommendations.push('Add more reliable data sources', 'Consider using official APIs')
    } else if (score >= 20) {
      level = 'poor'
      color = 'orange'
      message = 'Poor data quality - results should be used with caution'
      recommendations.push('Provide competitor URLs for automated collection', 'Use official APIs where available', 'Manually verify key competitor prices')
    } else {
      level = 'insufficient'
      color = 'red'
      message = 'Insufficient data quality - cannot provide reliable recommendations'
      recommendations.push('Provide competitor product URLs', 'Manually enter competitor prices', 'Consider using third-party data providers')
    }

    // Add specific recommendations based on source types
    const hasApi = sources.some(s => s.type === 'api')
    const hasManual = sources.some(s => s.type === 'manual')
    const hasScraping = sources.some(s => s.type === 'scraping')

    if (!hasApi) {
      recommendations.push('Consider using official APIs (Amazon SP-API, Walmart API) for better data quality')
    }
    if (hasScraping && !hasApi) {
      recommendations.push('Web scraping data may be unreliable - consider manual verification')
    }
    if (hasManual && sources.length === 1) {
      recommendations.push('Add more data sources beyond manual entry for better accuracy')
    }

    return {
      score,
      level,
      color,
      message,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    }
  }

  // Get competitor guidance for a specific platform
  getCompetitorGuidance(platform?: string): CompetitorGuidance[] {
    if (platform) {
      return this.competitorGuidance.filter(g => 
        g.platform.toLowerCase().includes(platform.toLowerCase())
      )
    }
    return this.competitorGuidance
  }

  // Validate competitor URL
  validateCompetitorUrl(url: string): {
    isValid: boolean
    platform?: string
    productId?: string
    guidance?: CompetitorGuidance
  } {
    for (const guidance of this.competitorGuidance) {
      const pattern = guidance.urlPattern.replace(/\{[^}]+\}/g, '[^/]+')
      const regex = new RegExp(pattern)
      
      if (regex.test(url)) {
        // Extract product ID based on platform
        let productId: string | undefined
        
        if (guidance.platform === 'Amazon') {
          const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/)
          productId = asinMatch?.[1]
        } else if (guidance.platform === 'Walmart') {
          const itemMatch = url.match(/\/ip\/[^/]+\/(\d+)/)
          productId = itemMatch?.[1]
        } else if (guidance.platform === 'Target') {
          const tcinMatch = url.match(/\/-\/(\d+)/)
          productId = tcinMatch?.[1]
        } else if (guidance.platform === 'Best Buy') {
          const skuMatch = url.match(/\/(\d+)\.p/)
          productId = skuMatch?.[1]
        } else if (guidance.platform === 'eBay') {
          const itemMatch = url.match(/\/itm\/(\d+)/)
          productId = itemMatch?.[1]
        }

        return {
          isValid: true,
          platform: guidance.platform,
          productId,
          guidance
        }
      }
    }

    return { isValid: false }
  }

  // Generate data quality report
  generateDataQualityReport(sources: any[]): string {
    const quality = this.calculateDataQuality(sources)
    
    let report = `Data Quality Report\n`
    report += `==================\n\n`
    report += `Overall Score: ${quality.score}/100 (${quality.level})\n`
    report += `Status: ${quality.message}\n\n`
    
    if (quality.recommendations.length > 0) {
      report += `Recommendations:\n`
      quality.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`
      })
    }
    
    return report
  }
}
