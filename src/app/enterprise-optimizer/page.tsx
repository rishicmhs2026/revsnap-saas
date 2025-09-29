'use client'

import { useState } from 'react'
import EnterpriseDashboard from '@/components/EnterpriseDashboard'
import EnterpriseFileUpload from '@/components/EnterpriseFileUpload'
import RevenueUpliftReport from '@/components/RevenueUpliftReport'
import { generatePDFReport } from '@/lib/pdfGenerator'
import { generateDemoAnalysisResults } from '@/lib/demoData'
import ErrorBoundary from '@/components/ErrorBoundary'

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
  recommendations: any[]
  topOpportunities: any[]
  riskProducts: any[]
}

export default function EnterpriseOptimizerPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/analyze-pricing', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      const data = await response.json()
      setResults(data.data)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Analysis failed')
      
      // Fallback to demo data for testing
      console.log('Using demo data for testing...')
      setResults(generateDemoAnalysisResults())
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportPDF = () => {
    if (results) {
      generatePDFReport(results, 'Demo Company')
    }
  }

  const handleNewAnalysis = () => {
    setResults(null)
    setError(null)
  }

  return (
    <ErrorBoundary>
      <EnterpriseDashboard>
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Enterprise Pricing Optimizer
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Upload your sales data and get AI-powered pricing recommendations with detailed revenue impact analysis.
            </p>
          </div>

          {/* File Upload or Results */}
          {!results ? (
            <EnterpriseFileUpload
              onFileUpload={handleFileUpload}
              onAnalysisComplete={setResults}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="space-y-6">
              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleNewAnalysis}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    New Analysis
                  </button>
                  <span className="text-sm text-gray-400">
                    {results.summary.totalProducts} products analyzed
                  </span>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-yellow-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-yellow-600 transition-all"
                >
                  Export PDF Report
                </button>
              </div>

              {/* Results */}
              <RevenueUpliftReport
                results={results}
                onExportPDF={handleExportPDF}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-red-400 mt-0.5">⚠️</div>
                <div>
                  <h3 className="text-sm font-medium text-red-400 mb-1">
                    Analysis Error
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">{error}</p>
                  <p className="text-xs text-gray-400">
                    Demo data is being used for testing purposes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-300 text-sm">
                Advanced algorithms analyze price elasticity, market positioning, and competitive dynamics.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise Reporting</h3>
              <p className="text-gray-300 text-sm">
                Generate board-ready PDF reports with detailed insights and implementation recommendations.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure & Compliant</h3>
              <p className="text-gray-300 text-sm">
                Enterprise-grade security with SOC 2 compliance and end-to-end encryption.
              </p>
            </div>
          </div>
        </div>
      </EnterpriseDashboard>
    </ErrorBoundary>
  )
}
