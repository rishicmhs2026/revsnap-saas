'use client'

// import { useState } from 'react' // Unused import
import Link from 'next/link'
import FreeAuditTool from '@/components/FreeAuditTool'

export default function FreeAuditPage() {
  return (
    <div className="main-container">
      {/* Navigation */}
      <nav className="nav-container">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <span className="font-semibold text-white">RevSnap</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors duration-200">Home</Link>
              <Link href="/pricing" className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors duration-200">Pricing</Link>
              <Link href="/demo" className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors duration-200">Demo</Link>
              <Link href="/dashboard" className="px-6 py-2.5 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg font-medium transition-all duration-200">Dashboard</Link>
              <Link href="/auth/signup" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="trust-badge mb-6">
            🎁 100% Free • No Signup Required • Instant Results
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Free Shopify Store Pricing Audit
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover how much revenue you&apos;re leaving on the table with our 3-minute pricing analysis. 
            <span className="text-white font-medium"> Get personalized optimization recommendations instantly.</span>
          </p>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-1 mb-8">
            <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
            <span className="ml-2 text-gray-400 text-sm">500+ DTC brands audited</span>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400 mb-12">
            <div className="flex items-center">
              <span className="text-green-400 mr-1">✓</span>
              <span>No signup required</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-400 mr-1">⚡</span>
              <span>3-minute analysis</span>
            </div>
            <div className="flex items-center">
              <span className="text-purple-400 mr-1">🎯</span>
              <span>Instant results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Free Audit Tool */}
      <section className="container mx-auto px-4 pb-16">
        <FreeAuditTool />
      </section>

      {/* Benefits */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                What You&apos;ll Discover
              </h2>
              <p className="text-lg text-gray-300">
                Our AI-powered audit reveals hidden pricing opportunities
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-900 rounded-lg flex items-center justify-center border border-blue-800">
                  <span className="text-xl">💰</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Revenue Opportunities</h3>
                <p className="text-gray-300 text-sm">
                  Identify underpriced products and pricing gaps that could boost your monthly revenue
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-900 rounded-lg flex items-center justify-center border border-green-800">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Competitive Positioning</h3>
                <p className="text-gray-300 text-sm">
                  See how your prices compare to competitors and find your optimal market position
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-900 rounded-lg flex items-center justify-center border border-purple-800">
                  <span className="text-xl">🎯</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Actionable Insights</h3>
                <p className="text-gray-300 text-sm">
                  Get specific recommendations you can implement immediately to increase profits
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-12">
              What DTC Brands Are Saying
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    S
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-white">Sarah Chen</p>
                    <p className="text-sm text-gray-400">Founder, EcoBeauty Co.</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  "The free audit showed us we were leaving $8,400/month on the table. 
                  Implemented their suggestions and saw a 28% profit increase within 3 weeks!"
                </p>
                <div className="flex items-center mt-3">
                  <span className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</span>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    M
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-white">Mike Rodriguez</p>
                    <p className="text-sm text-gray-400">CEO, FitGear Direct</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  "Finally, a tool that understands DTC pricing! The audit took 2 minutes 
                  and gave us insights that increased our margins by 15% across 23 products."
                </p>
                <div className="flex items-center mt-3">
                  <span className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to unlock your pricing potential?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join 500+ successful DTC brands who&apos;ve increased their profits with data-driven pricing optimization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="btn btn-primary btn-lg"
            >
              🚀 Get Full Access
            </Link>
            <Link
              href="/pricing-optimizer"
              className="btn btn-secondary btn-lg"
            >
              📊 Try CSV Optimizer
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            No setup fees • Cancel anytime • 14-day free trial
          </p>
        </div>
      </section>
    </div>
  )
}

