// Demo data for testing the pricing optimization system
export const generateDemoCSV = () => {
  const demoProducts = [
    {
      name: 'Premium Wireless Headphones',
      currentPrice: 199.99,
      cost: 89.50,
      unitsSold: 1250,
      category: 'Electronics'
    },
    {
      name: 'Organic Coffee Beans (1lb)',
      currentPrice: 24.99,
      cost: 12.30,
      unitsSold: 890,
      category: 'Food & Beverage'
    },
    {
      name: 'Yoga Mat Pro',
      currentPrice: 79.99,
      cost: 35.20,
      unitsSold: 2100,
      category: 'Fitness'
    },
    {
      name: 'Smart Water Bottle',
      currentPrice: 39.99,
      cost: 18.75,
      unitsSold: 1800,
      category: 'Health'
    },
    {
      name: 'Leather Wallet',
      currentPrice: 89.99,
      cost: 42.10,
      unitsSold: 650,
      category: 'Accessories'
    },
    {
      name: 'Bluetooth Speaker',
      currentPrice: 149.99,
      cost: 67.80,
      unitsSold: 950,
      category: 'Electronics'
    },
    {
      name: 'Protein Powder (2lb)',
      currentPrice: 49.99,
      cost: 22.40,
      unitsSold: 1200,
      category: 'Health'
    },
    {
      name: 'Running Shoes',
      currentPrice: 129.99,
      cost: 58.90,
      unitsSold: 1800,
      category: 'Fitness'
    },
    {
      name: 'Essential Oil Set',
      currentPrice: 34.99,
      cost: 16.20,
      unitsSold: 750,
      category: 'Wellness'
    },
    {
      name: 'Phone Case',
      currentPrice: 19.99,
      cost: 8.50,
      unitsSold: 3200,
      category: 'Accessories'
    },
    {
      name: 'Laptop Stand',
      currentPrice: 69.99,
      cost: 28.90,
      unitsSold: 1100,
      category: 'Electronics'
    },
    {
      name: 'Resistance Bands Set',
      currentPrice: 29.99,
      cost: 13.20,
      unitsSold: 1600,
      category: 'Fitness'
    },
    {
      name: 'Aromatherapy Diffuser',
      currentPrice: 54.99,
      cost: 24.80,
      unitsSold: 850,
      category: 'Wellness'
    },
    {
      name: 'Travel Backpack',
      currentPrice: 119.99,
      cost: 52.30,
      unitsSold: 720,
      category: 'Accessories'
    },
    {
      name: 'Green Tea Extract',
      currentPrice: 39.99,
      cost: 18.60,
      unitsSold: 980,
      category: 'Health'
    }
  ]

  const headers = 'Product Name,Current Price,Cost,Units Sold,Category'
  const rows = demoProducts.map(product => 
    `${product.name},${product.currentPrice},${product.cost},${product.unitsSold},${product.category}`
  )
  
  return [headers, ...rows].join('\n')
}

export const generateDemoAnalysisResults = () => {
  return {
    summary: {
      totalProducts: 15,
      totalCurrentRevenue: 1250000,
      totalProjectedRevenue: 1487500,
      revenueUplift: 237500,
      revenueUpliftPercent: 19.0,
      avgMarginImprovement: 8.5,
      highConfidenceRecommendations: 12
    },
    recommendations: [
      {
        productName: 'Premium Wireless Headphones',
        currentPrice: 199.99,
        cost: 89.50,
        currentMargin: 55.2,
        recommendedPrice: 189.99,
        projectedMargin: 52.9,
        priceChange: -10.00,
        priceChangePercent: -5.0,
        revenueImpact: -12500,
        confidence: 'high' as const,
        reasoning: 'High margin product - recommend competitive pricing to increase market share'
      },
      {
        productName: 'Organic Coffee Beans (1lb)',
        currentPrice: 24.99,
        cost: 12.30,
        currentMargin: 50.8,
        recommendedPrice: 26.95,
        projectedMargin: 54.4,
        priceChange: 1.96,
        priceChangePercent: 7.8,
        revenueImpact: 1744,
        confidence: 'high' as const,
        reasoning: 'Premium organic product with strong brand positioning - can support price increase'
      },
      {
        productName: 'Yoga Mat Pro',
        currentPrice: 79.99,
        cost: 35.20,
        currentMargin: 56.0,
        recommendedPrice: 84.95,
        projectedMargin: 58.5,
        priceChange: 4.96,
        priceChangePercent: 6.2,
        revenueImpact: 10416,
        confidence: 'high' as const,
        reasoning: 'High-quality fitness product with strong customer loyalty - optimal for price increase'
      },
      {
        productName: 'Smart Water Bottle',
        currentPrice: 39.99,
        cost: 18.75,
        currentMargin: 53.1,
        recommendedPrice: 42.95,
        projectedMargin: 56.3,
        priceChange: 2.96,
        priceChangePercent: 7.4,
        revenueImpact: 5328,
        confidence: 'medium' as const,
        reasoning: 'Health-focused product with growing market demand - moderate price increase recommended'
      },
      {
        productName: 'Leather Wallet',
        currentPrice: 89.99,
        cost: 42.10,
        currentMargin: 53.2,
        recommendedPrice: 94.95,
        projectedMargin: 55.6,
        priceChange: 4.96,
        priceChangePercent: 5.5,
        revenueImpact: 3224,
        confidence: 'high' as const,
        reasoning: 'Premium leather product with high perceived value - supports price increase'
      }
    ],
    topOpportunities: [
      {
        productName: 'Yoga Mat Pro',
        currentPrice: 79.99,
        cost: 35.20,
        currentMargin: 56.0,
        recommendedPrice: 84.95,
        projectedMargin: 58.5,
        priceChange: 4.96,
        priceChangePercent: 6.2,
        revenueImpact: 10416,
        confidence: 'high' as const,
        reasoning: 'High-quality fitness product with strong customer loyalty - optimal for price increase'
      },
      {
        productName: 'Leather Wallet',
        currentPrice: 89.99,
        cost: 42.10,
        currentMargin: 53.2,
        recommendedPrice: 94.95,
        projectedMargin: 55.6,
        priceChange: 4.96,
        priceChangePercent: 5.5,
        revenueImpact: 3224,
        confidence: 'high' as const,
        reasoning: 'Premium leather product with high perceived value - supports price increase'
      },
      {
        productName: 'Organic Coffee Beans (1lb)',
        currentPrice: 24.99,
        cost: 12.30,
        currentMargin: 50.8,
        recommendedPrice: 26.95,
        projectedMargin: 54.4,
        priceChange: 1.96,
        priceChangePercent: 7.8,
        revenueImpact: 1744,
        confidence: 'high' as const,
        reasoning: 'Premium organic product with strong brand positioning - can support price increase'
      }
    ],
    riskProducts: [
      {
        productName: 'Premium Wireless Headphones',
        currentPrice: 199.99,
        cost: 89.50,
        currentMargin: 55.2,
        recommendedPrice: 189.99,
        projectedMargin: 52.9,
        priceChange: -10.00,
        priceChangePercent: -5.0,
        revenueImpact: -12500,
        confidence: 'high' as const,
        reasoning: 'High margin product - recommend competitive pricing to increase market share'
      }
    ]
  }
}

export const generateEnterpriseDemoData = () => {
  return {
    companyName: 'TechCorp Enterprises',
    industry: 'Technology',
    annualRevenue: 50000000,
    productCount: 150,
    currentAnalysis: {
      totalProducts: 15,
      totalCurrentRevenue: 1250000,
      totalProjectedRevenue: 1487500,
      revenueUplift: 237500,
      revenueUpliftPercent: 19.0,
      avgMarginImprovement: 8.5,
      highConfidenceRecommendations: 12
    },
    historicalPerformance: [
      { month: 'Jan', revenue: 1200000, margin: 45.2 },
      { month: 'Feb', revenue: 1180000, margin: 44.8 },
      { month: 'Mar', revenue: 1250000, margin: 45.5 },
      { month: 'Apr', revenue: 1300000, margin: 46.1 },
      { month: 'May', revenue: 1280000, margin: 45.8 },
      { month: 'Jun', revenue: 1350000, margin: 46.5 }
    ],
    competitiveAnalysis: {
      marketPosition: 'Premium',
      averageCompetitorPrice: 165.50,
      priceElasticity: 1.2,
      marketShare: 12.5
    }
  }
}

export const generateCFODemoData = () => {
  return {
    executiveSummary: {
      totalRevenueImpact: 237500,
      implementationCost: 0,
      paybackPeriod: 0,
      roi: 'Infinite',
      riskLevel: 'Low'
    },
    financialProjections: {
      year1: {
        revenue: 1487500,
        margin: 54.3,
        profit: 807656
      },
      year2: {
        revenue: 1561875,
        margin: 55.1,
        profit: 860593
      },
      year3: {
        revenue: 1639969,
        margin: 55.8,
        profit: 915103
      }
    },
    implementationPlan: {
      phase1: {
        name: 'High-Confidence Products',
        duration: '2 weeks',
        products: 12,
        expectedImpact: 195000
      },
      phase2: {
        name: 'Market Testing',
        duration: '4 weeks',
        products: 3,
        expectedImpact: 42500
      }
    }
  }
}
