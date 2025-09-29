import SmartCSVOptimizer from '@/components/SmartCSVOptimizer'

export default function PricingOptimizerPage() {
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
              <a href="/" className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors duration-200">Home</a>
              <a href="/pricing" className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors duration-200">Pricing</a>
              <a href="/demo" className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors duration-200">Demo</a>
              <a href="/dashboard" className="px-6 py-2.5 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg font-medium transition-all duration-200">Dashboard</a>
              <a href="/auth/signup" className="btn-primary">Get Started</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <SmartCSVOptimizer />
      </main>

      {/* Features Section */}
      <section className="py-16" style={{ background: 'rgba(55, 65, 81, 0.2)', backdropFilter: 'blur(15px)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Shopify DTC Brands Choose Our Optimizer
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Built specifically for direct-to-consumer brands with 10-50 SKUs who need quick, data-driven pricing decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-b from-gray-900/30 to-gray-800/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">DTC-Focused</h3>
              <p className="text-gray-300">
                Tailored for Shopify brands with 10-50 products who need rapid pricing optimization
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-900 rounded-lg flex items-center justify-center border border-green-800">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant Results</h3>
              <p className="text-gray-300">
                Upload your CSV and get optimized pricing recommendations in under 30 seconds
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-900 rounded-lg flex items-center justify-center border border-purple-800">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Proven ROI</h3>
              <p className="text-gray-300">
                Our clients typically see 15-40% profit improvements within the first month
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 