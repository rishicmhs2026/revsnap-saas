import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

export function generatePDFReport(results: AnalysisResults, companyName: string = 'Demo Company') {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const { fontSize = 12, color = '#000000', align = 'left', maxWidth = contentWidth } = options
    doc.setFontSize(fontSize)
    doc.setTextColor(color)
    
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, y, { align })
    return y + (lines.length * (fontSize * 0.4))
  }

  // Helper function to draw a line
  const drawLine = (x1: number, y1: number, x2: number, y2: number, color = '#E5E7EB') => {
    doc.setDrawColor(color)
    doc.line(x1, y1, x2, y2)
  }

  // Helper function to add a colored box
  const addColoredBox = (x: number, y: number, width: number, height: number, color: string, text: string, textColor = '#FFFFFF') => {
    doc.setFillColor(color)
    doc.rect(x, y, width, height, 'F')
    doc.setTextColor(textColor)
    doc.setFontSize(10)
    doc.text(text, x + 5, y + height/2 + 2)
  }

  let currentY = margin

  // Header with logo and company info
  doc.setFillColor(139, 92, 246) // Purple
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  // Logo placeholder
  doc.setFillColor(255, 255, 255)
  doc.rect(margin, 10, 20, 20, 'F')
  doc.setTextColor(139, 92, 246)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('R', margin + 7, 23)
  
  // Company name and title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('RevSnap', margin + 30, 20)
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text('AI-Powered Pricing Optimization Report', margin + 30, 28)
  
  doc.setFontSize(12)
  doc.text(`Generated for: ${companyName}`, margin + 30, 35)
  
  currentY = 50

  // Executive Summary
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  currentY = addText('Executive Summary', margin, currentY + 10)
  
  drawLine(margin, currentY, pageWidth - margin, currentY)
  currentY += 10

  // Summary metrics in boxes
  const boxWidth = (contentWidth - 20) / 4
  const boxHeight = 25
  
  // Revenue Uplift
  addColoredBox(margin, currentY, boxWidth, boxHeight, '#10B981', 
    `Revenue Uplift\n${formatCurrency(results.summary.revenueUplift)}\n+${results.summary.revenueUpliftPercent.toFixed(1)}%`)
  
  // Margin Improvement
  addColoredBox(margin + boxWidth + 5, currentY, boxWidth, boxHeight, '#3B82F6',
    `Margin Improvement\n+${results.summary.avgMarginImprovement.toFixed(1)}%\nAverage across products`)
  
  // High Confidence
  addColoredBox(margin + (boxWidth + 5) * 2, currentY, boxWidth, boxHeight, '#8B5CF6',
    `High Confidence\n${results.summary.highConfidenceRecommendations}\nRecommendations`)
  
  // Total Products
  addColoredBox(margin + (boxWidth + 5) * 3, currentY, boxWidth, boxHeight, '#F59E0B',
    `Total Products\n${results.summary.totalProducts}\nAnalyzed`)

  currentY += boxHeight + 20

  // Key Insights
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  currentY = addText('Key Insights', margin, currentY + 10)
  
  drawLine(margin, currentY, pageWidth - margin, currentY)
  currentY += 10

  const insights = [
    `• ${results.summary.highConfidenceRecommendations} products have high-confidence pricing recommendations`,
    `• Average margin improvement of +${results.summary.avgMarginImprovement.toFixed(1)}% across all products`,
    `• Potential revenue uplift of ${formatCurrency(results.summary.revenueUplift)} annually`,
    `• ${results.topOpportunities.length} products identified as top revenue opportunities`
  ]

  insights.forEach(insight => {
    currentY = addText(insight, margin + 10, currentY + 8, { fontSize: 11 })
  })

  currentY += 20

  // Top Opportunities
  if (results.topOpportunities.length > 0) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    currentY = addText('Top Revenue Opportunities', margin, currentY + 10)
    
    drawLine(margin, currentY, pageWidth - margin, currentY)
    currentY += 10

    results.topOpportunities.slice(0, 5).forEach((opp, index) => {
      if (currentY > pageHeight - 60) {
        doc.addPage()
        currentY = margin
      }

      // Opportunity header
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      currentY = addText(`${index + 1}. ${opp.productName}`, margin, currentY + 10)
      
      // Confidence badge
      const confidenceColor = opp.confidence === 'high' ? '#10B981' : opp.confidence === 'medium' ? '#F59E0B' : '#EF4444'
      addColoredBox(pageWidth - margin - 30, currentY - 15, 25, 8, confidenceColor, opp.confidence.toUpperCase(), '#FFFFFF')
      
      // Details
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      currentY = addText(opp.reasoning, margin + 10, currentY + 5, { fontSize: 10 })
      
      // Metrics
      const metrics = [
        `Current Price: ${formatCurrency(opp.currentPrice)}`,
        `Recommended: ${formatCurrency(opp.recommendedPrice)}`,
        `Change: +${opp.priceChangePercent.toFixed(1)}%`,
        `Impact: +${formatCurrency(opp.revenueImpact)}`
      ]
      
      metrics.forEach(metric => {
        currentY = addText(metric, margin + 20, currentY + 4, { fontSize: 9 })
      })
      
      currentY += 10
    })
  }

  // Risk Products (if any)
  if (results.riskProducts.length > 0) {
    if (currentY > pageHeight - 100) {
      doc.addPage()
      currentY = margin
    }

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    currentY = addText('Products Requiring Review', margin, currentY + 10)
    
    drawLine(margin, currentY, pageWidth - margin, currentY)
    currentY += 10

    results.riskProducts.slice(0, 3).forEach((risk, index) => {
      if (currentY > pageHeight - 60) {
        doc.addPage()
        currentY = margin
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      currentY = addText(`${index + 1}. ${risk.productName}`, margin, currentY + 10)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      currentY = addText(risk.reasoning, margin + 10, currentY + 5, { fontSize: 10 })
      
      const metrics = [
        `Current Price: ${formatCurrency(risk.currentPrice)}`,
        `Recommended: ${formatCurrency(risk.recommendedPrice)}`,
        `Change: ${risk.priceChangePercent.toFixed(1)}%`,
        `Impact: ${formatCurrency(risk.revenueImpact)}`
      ]
      
      metrics.forEach(metric => {
        currentY = addText(metric, margin + 20, currentY + 4, { fontSize: 9 })
      })
      
      currentY += 10
    })
  }

  // Footer
  const footerY = pageHeight - 20
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('Generated by RevSnap AI-Powered Pricing Optimization', margin, footerY)
  doc.text(`Report generated on ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, footerY)

  // Save the PDF
  const fileName = `RevSnap-Pricing-Report-${companyName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

export function generatePDFFromElement(elementId: string, companyName: string = 'Demo Company') {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error('Element not found for PDF generation')
    return
  }

  html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#000000'
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png')
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const imgWidth = pageWidth - 40
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Add header
    doc.setFillColor(139, 92, 246)
    doc.rect(0, 0, pageWidth, 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('RevSnap Pricing Report', 20, 20)
    doc.setFontSize(12)
    doc.text(`Generated for: ${companyName}`, 20, 26)

    // Add the image
    doc.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight)

    // Add footer
    const footerY = pageHeight - 10
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text('Generated by RevSnap AI-Powered Pricing Optimization', 20, footerY)
    doc.text(`Report generated on ${new Date().toLocaleDateString()}`, pageWidth - 80, footerY)

    const fileName = `RevSnap-Pricing-Report-${companyName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }).catch(error => {
    console.error('Error generating PDF:', error)
  })
}
