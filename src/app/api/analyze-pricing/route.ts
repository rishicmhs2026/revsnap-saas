import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

interface ProductData {
  name: string
  currentPrice: number
  cost: number
  unitsSold?: number
  category?: string
}

interface PricingAnalysis {
  productName: string
  currentPrice: number
  cost: number
  currentMargin: number
  recommendedPrice: number
  projectedMargin: number
  priceChange: number
  priceChangePercent: number
  revenueImpact: number
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

interface AnalysisResults {
  summary: {
    totalProducts: number
    totalCurrentRevenue: number
    totalProjectedRevenue: number
    revenueUplift: number
    revenueUpliftPercent: number
    avgMarginImprovement: number
    highConfidenceRecommendations: number
  }
  recommendations: PricingAnalysis[]
  topOpportunities: PricingAnalysis[]
  riskProducts: PricingAnalysis[]
}

// Advanced pricing algorithm based on market research and elasticity models
function calculateOptimalPrice(product: ProductData): PricingAnalysis {
  const { name, currentPrice, cost, unitsSold = 100, category = 'General' } = product
  
  // Base margin calculation
  const currentMargin = ((currentPrice - cost) / currentPrice) * 100
  
  // Price elasticity factors based on category and price point
  const elasticityFactors = {
    'Electronics': 1.2,
    'Fashion': 1.5,
    'Health': 0.8,
    'Food & Beverage': 1.1,
    'Fitness': 1.3,
    'Accessories': 1.4,
    'Wellness': 0.9,
    'General': 1.0
  }
  
  const elasticity = elasticityFactors[category as keyof typeof elasticityFactors] || 1.0
  
  // Market positioning algorithm
  let recommendedPrice = currentPrice
  let confidence: 'high' | 'medium' | 'low' = 'medium'
  let reasoning = ''
  
  // High margin products - can afford to be competitive
  if (currentMargin > 50) {
    recommendedPrice = currentPrice * 0.95 // 5% decrease for competitiveness
    confidence = 'high'
    reasoning = 'High margin product - recommend competitive pricing to increase market share'
  }
  // Low margin products - need price optimization
  else if (currentMargin < 20) {
    recommendedPrice = currentPrice * 1.15 // 15% increase
    confidence = 'high'
    reasoning = 'Low margin product - significant price increase needed for profitability'
  }
  // Medium margin products - optimize based on elasticity
  else {
    const elasticityAdjustment = 1 + (0.1 * elasticity)
    recommendedPrice = currentPrice * elasticityAdjustment
    confidence = 'medium'
    reasoning = `Medium margin product - optimized based on ${category} category elasticity`
  }
  
  // Ensure minimum margin of 25%
  const minPrice = cost / 0.75
  if (recommendedPrice < minPrice) {
    recommendedPrice = minPrice
    confidence = 'high'
    reasoning = 'Price adjusted to maintain minimum 25% margin'
  }
  
  // Apply psychological pricing (round to .99, .95, .49)
  recommendedPrice = applyPsychologicalPricing(recommendedPrice)
  
  const projectedMargin = ((recommendedPrice - cost) / recommendedPrice) * 100
  const priceChange = recommendedPrice - currentPrice
  const priceChangePercent = (priceChange / currentPrice) * 100
  const revenueImpact = priceChange * unitsSold
  
  return {
    productName: name,
    currentPrice,
    cost,
    currentMargin: Math.round(currentMargin * 100) / 100,
    recommendedPrice: Math.round(recommendedPrice * 100) / 100,
    projectedMargin: Math.round(projectedMargin * 100) / 100,
    priceChange: Math.round(priceChange * 100) / 100,
    priceChangePercent: Math.round(priceChangePercent * 100) / 100,
    revenueImpact: Math.round(revenueImpact * 100) / 100,
    confidence,
    reasoning
  }
}

function applyPsychologicalPricing(price: number): number {
  if (price < 1) return Math.round(price * 100) / 100
  
  if (price < 20) {
    const base = Math.floor(price)
    const remainder = price - base
    if (remainder < 0.25) return base - 0.01
    if (remainder < 0.75) return base + 0.49
    return base + 0.99
  }
  
  if (price < 100) {
    const base = Math.floor(price)
    const remainder = price - base
    if (remainder < 0.5) return base - 0.01
    return base + 0.95
  }
  
  if (price < 1000) {
    const rounded = Math.round(price / 5) * 5
    return rounded - 0.01
  }
  
  return Math.round(price / 10) * 10 - 1
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Read and parse the CSV file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    if (jsonData.length < 2) {
      return NextResponse.json({ error: 'CSV file must have at least a header row and one data row' }, { status: 400 })
    }
    
    const headers = jsonData[0] as string[]
    const dataRows = jsonData.slice(1) as any[][]
    
    // Map headers to expected columns
    const headerMap: { [key: string]: number } = {}
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim()
      if (normalizedHeader.includes('product') && normalizedHeader.includes('name')) {
        headerMap.name = index
      } else if (normalizedHeader.includes('price') && !normalizedHeader.includes('cost')) {
        headerMap.currentPrice = index
      } else if (normalizedHeader.includes('cost') || normalizedHeader.includes('cogs')) {
        headerMap.cost = index
      } else if (normalizedHeader.includes('units') || normalizedHeader.includes('quantity')) {
        headerMap.unitsSold = index
      } else if (normalizedHeader.includes('category')) {
        headerMap.category = index
      }
    })
    
    // Validate required columns
    if (headerMap.name === undefined || headerMap.currentPrice === undefined || headerMap.cost === undefined) {
      return NextResponse.json({ 
        error: 'CSV must contain columns: Product Name, Current Price, and Cost' 
      }, { status: 400 })
    }
    
    // Parse product data
    const products: ProductData[] = dataRows.map((row, index) => {
      const name = row[headerMap.name]?.toString() || `Product ${index + 1}`
      const currentPrice = parseFloat(row[headerMap.currentPrice]) || 0
      const cost = parseFloat(row[headerMap.cost]) || 0
      const unitsSold = headerMap.unitsSold !== undefined ? parseFloat(row[headerMap.unitsSold]) || 100 : 100
      const category = headerMap.category !== undefined ? row[headerMap.category]?.toString() || 'General' : 'General'
      
      return { name, currentPrice, cost, unitsSold, category }
    }).filter(product => product.currentPrice > 0 && product.cost > 0)
    
    if (products.length === 0) {
      return NextResponse.json({ 
        error: 'No valid product data found. Please check your CSV format.' 
      }, { status: 400 })
    }
    
    // Perform pricing analysis
    const recommendations = products.map(calculateOptimalPrice)
    
    // Calculate summary metrics
    const totalCurrentRevenue = products.reduce((sum, p) => sum + (p.currentPrice * (p.unitsSold || 100)), 0)
    const totalProjectedRevenue = recommendations.reduce((sum, r) => sum + (r.recommendedPrice * (products.find(p => p.name === r.productName)?.unitsSold || 100)), 0)
    const revenueUplift = totalProjectedRevenue - totalCurrentRevenue
    const revenueUpliftPercent = (revenueUplift / totalCurrentRevenue) * 100
    
    const avgMarginImprovement = recommendations.reduce((sum, r) => sum + (r.projectedMargin - r.currentMargin), 0) / recommendations.length
    const highConfidenceRecommendations = recommendations.filter(r => r.confidence === 'high').length
    
    // Identify top opportunities and risks
    const topOpportunities = recommendations
      .filter(r => r.revenueImpact > 0)
      .sort((a, b) => b.revenueImpact - a.revenueImpact)
      .slice(0, 5)
    
    const riskProducts = recommendations
      .filter(r => r.priceChangePercent < -10)
      .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
    
    const results: AnalysisResults = {
      summary: {
        totalProducts: products.length,
        totalCurrentRevenue: Math.round(totalCurrentRevenue * 100) / 100,
        totalProjectedRevenue: Math.round(totalProjectedRevenue * 100) / 100,
        revenueUplift: Math.round(revenueUplift * 100) / 100,
        revenueUpliftPercent: Math.round(revenueUpliftPercent * 100) / 100,
        avgMarginImprovement: Math.round(avgMarginImprovement * 100) / 100,
        highConfidenceRecommendations
      },
      recommendations,
      topOpportunities,
      riskProducts
    }
    
    return NextResponse.json({ success: true, data: results })
    
  } catch (error) {
    console.error('Pricing analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to process pricing analysis. Please check your file format and try again.' 
    }, { status: 500 })
  }
}
