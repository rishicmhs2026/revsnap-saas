import Link from 'next/link'

export default function Home() {
  return (
    <div className="main-container">
      {/* Navigation Bar */}
      <nav className="nav-container">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <span className="font-bold text-white text-xl tracking-tight">RevSnap</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/pricing" className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors duration-200">Pricing</Link>
              <Link href="/demo" className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors duration-200">Demo</Link>
              <Link href="/auth/signin" className="px-6 py-2.5 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg font-medium transition-all duration-200">Sign in</Link>
              <Link href="/auth/signup" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-container">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="trust-badge">
            🔥 AI-powered pricing optimization • Limited time offer
          </div>

          <h1 className="main-title">
            Stop leaving money on the table
          </h1>
          
          <p className="main-subtitle">
            The AI-powered pricing platform that helps Shopify DTC brands 
            <span style={{ color: '#10b981', fontWeight: 'bold' }}> increase profits by 15-40% in 30 days</span> with real-time competitor intelligence.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-16 text-base">
            <div className="flex items-center bg-green-900/20 px-6 py-3 rounded-full border border-green-700/50 backdrop-blur-sm">
              <span className="text-green-400 mr-3 text-lg">🚀</span>
              <span className="font-semibold text-white">Real-time tracking</span>
            </div>
            <div className="flex items-center bg-blue-900/20 px-6 py-3 rounded-full border border-blue-700/50 backdrop-blur-sm">
              <span className="text-blue-400 mr-3 text-lg">🛡️</span>
              <span className="font-semibold text-white">Secure & reliable</span>
            </div>
            <div className="flex items-center bg-purple-900/20 px-6 py-3 rounded-full border border-purple-700/50 backdrop-blur-sm">
              <span className="text-purple-400 mr-3 text-lg">⏱️</span>
              <span className="font-semibold text-white">Setup in 30 seconds</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/pricing" className="btn-primary">
              🚀 Get Started with RevSnap
            </Link>
            <Link href="/demo" className="btn-secondary">
              ⚡ View Demo
            </Link>
          </div>
          
          {/* Urgency & Guarantee */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 rounded-full text-yellow-300 text-base mb-6 backdrop-blur-sm">
              <span className="animate-pulse mr-3 text-lg">⚠️</span>
              <span className="font-semibold">Limited time: Get audit worth $2,500 FREE (normally paid)</span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 text-base text-gray-300">
              <div className="flex items-center">
                <span className="text-green-400 mr-2 text-lg">💰</span>
                <span className="font-semibold text-white">Money-back guarantee</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-400 mr-2 text-lg">📈</span>
                <span className="font-semibold text-white">Smart pricing optimization</span>
              </div>
              <div className="flex items-center">
                <span className="text-purple-400 mr-2 text-lg">⏱️</span>
                <span className="font-semibold text-white">Results in 30 days</span>
              </div>
            </div>
          </div>

          {/* Social Proof Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="text-center bg-gradient-to-b from-gray-900/30 to-gray-800/30 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
              <div className="text-5xl font-bold text-green-400 mb-2">15-40%</div>
              <div className="text-lg text-white font-semibold">Profit increase potential</div>
              <div className="text-sm text-gray-400">with AI optimization</div>
            </div>
            <div className="text-center bg-gradient-to-b from-gray-900/30 to-gray-800/30 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
              <div className="text-5xl font-bold text-blue-400 mb-2">30 sec</div>
              <div className="text-lg text-white font-semibold">Quick setup</div>
              <div className="text-sm text-gray-400">start optimizing now</div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Notice & Trust Signals */}
      <section className="bg-black border-y border-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center p-6 bg-gradient-to-b from-gray-900/30 to-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                <span className="text-3xl mb-3">🛡️</span>
                <p className="text-base text-white font-semibold">SOC 2 Compliant</p>
                <p className="text-sm text-gray-400">Enterprise security</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-gradient-to-b from-gray-900/30 to-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                <span className="text-3xl mb-3">🔒</span>
                <p className="text-base text-white font-semibold">GDPR Compliant</p>
                <p className="text-sm text-gray-400">Privacy protected</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-gradient-to-b from-gray-900/30 to-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                <span className="text-3xl mb-3">⭐</span>
                <p className="text-base text-white font-semibold">Shopify Partner</p>
                <p className="text-sm text-gray-400">Official integration</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-gradient-to-b from-gray-900/30 to-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                <span className="text-3xl mb-3">💰</span>
                <p className="text-base text-white font-semibold">Money-back guarantee</p>
                <p className="text-sm text-gray-400">30-day guarantee</p>
              </div>
            </div>
            <div className="text-center mt-8 pt-8 border-t border-gray-800">
              <p className="text-base text-gray-300">
                100% legal and compliant data collection. We respect all website terms and robots.txt files.
                <Link href="/privacy-policy" className="px-4 py-2 ml-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">
              Everything you need to win on price
            </h2>
            <p className="text-xl text-gray-300 font-light leading-relaxed">
              Stop losing revenue to mispricing. Get instant optimization recommendations for your 10-50 SKU catalog.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center p-8 bg-gradient-to-b from-gray-900/30 to-gray-800/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart CSV optimizer</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Upload your product CSV and get instant pricing recommendations with real-time margin simulation in under 30 seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 bg-gradient-to-b from-gray-900/30 to-gray-800/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Proven results</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Our AI-powered platform helps DTC brands make data-driven pricing decisions to optimize their profit margins and stay competitive.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 bg-gradient-to-b from-gray-900/30 to-gray-800/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">3-minute setup</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Get a personalized pricing analysis of your Shopify store in just 3 minutes. No signup required for audit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to Transform Your DTC Business?
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Join the growing number of brands using AI-powered pricing intelligence to maximize their profit margins.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {/* Feature Highlight 1 */}
              <div className="p-8 bg-gradient-to-b from-gray-900/40 to-gray-800/40 rounded-2xl border-l-4 border-green-500 backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-4">
                  Real-Time Competitor Tracking
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Monitor competitor prices across Amazon, Shopify, and other platforms. Get instant alerts when competitors change their pricing strategy.
                </p>
                <div className="text-green-400 font-semibold">
                  ✓ Always stay competitive
                </div>
              </div>

              {/* Feature Highlight 2 */}
              <div className="p-8 bg-gradient-to-b from-gray-900/40 to-gray-800/40 rounded-2xl border-l-4 border-blue-500 backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-4">
                  AI-Powered Insights
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Our AI analyzes market trends, competitor behavior, and your sales data to recommend optimal pricing strategies for maximum profit.
                </p>
                <div className="text-blue-400 font-semibold">
                  ✓ Data-driven decisions
                </div>
              </div>

              {/* Feature Highlight 3 */}
              <div className="p-8 bg-gradient-to-b from-gray-900/40 to-gray-800/40 rounded-2xl border-l-4 border-purple-500 backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-4">
                  Advanced Analytics
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Upload your product data and get comprehensive reports on pricing opportunities, market positioning, and revenue optimization.
                </p>
                <div className="text-purple-400 font-semibold">
                  ✓ Actionable recommendations
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="section">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Calculate your revenue impact
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              See how much additional revenue you could generate with optimized pricing
            </p>
            
            <div className="card p-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Revenue</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
                    <input 
                      type="text" 
                      placeholder="50,000"
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of SKUs</label>
                  <input 
                    type="text" 
                    placeholder="25"
                    className="input"
                  />
                </div>
              </div>
              
              <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-6">
                <div className="text-2xl font-bold text-green-300 mb-1">+$9,500</div>
                <div className="text-green-400 text-sm">Potential monthly increase</div>
                <div className="text-xs text-green-400 mt-1">Based on 19% average improvement</div>
              </div>
              
              <Link 
                href="/pricing"
                className="btn btn-primary btn-lg w-full"
              >
                Start optimizing now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-green-900/20"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Urgency Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-700/50 rounded-full text-red-300 text-lg mb-8 animate-pulse backdrop-blur-sm">
              <span className="mr-3 text-xl">🔥</span>
              <span className="font-bold">LIMITED TIME: Free $2,500 audit ends soon</span>
            </div>
            
            <h2 className="text-6xl font-bold mb-8 text-white tracking-tight">
              Ready to add $50K+ to your monthly revenue?
            </h2>
            <p className="text-2xl text-gray-200 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
              Start using RevSnap&apos;s AI-powered platform to 
              <span className="text-green-400 font-bold"> increase profit margins by 15-40%</span>. 
              Begin optimizing your pricing strategy today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center mb-12">
              <Link 
                href="/pricing" 
                className="px-16 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-2xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-4">🚀</span>
                  Get Started Now
                </span>
              </Link>
              <Link 
                href="/pricing" 
                className="px-12 py-6 bg-gray-800 hover:bg-gray-700 text-white text-xl font-semibold rounded-2xl border border-gray-600 hover:border-gray-500 shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-3">💳</span>
                  View Pricing Plans
                </span>
              </Link>
            </div>
            
            {/* Triple Guarantee */}
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-white mb-4">Our Triple Guarantee</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <span className="text-green-400 mr-2">💰</span>
                  <span className="text-gray-300">Money-back guarantee</span>
                </div>
                <div className="text-center">
                  <span className="text-blue-400 mr-2">📈</span>
                  <span className="text-gray-300">Results in 30 days</span>
                </div>
                <div className="text-center">
                  <span className="text-purple-400 mr-2">🔒</span>
                  <span className="text-gray-300">No credit card required</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center">
                <span className="text-green-400 mr-1">✓</span>
                <span>Real-time tracking</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-400 mr-1">⚡</span>
                <span>Setup in 30 seconds</span>
              </div>
              <div className="flex items-center">
                <span className="text-purple-400 mr-1">🤖</span>
                <span>AI-powered optimization</span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-400 mr-1">🔒</span>
                <span>Secure & reliable</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-10 h-10 flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <span className="font-bold text-white text-xl tracking-tight">RevSnap</span>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/privacy-policy" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition-all duration-200">Privacy</Link>
              <Link href="/terms-of-service" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition-all duration-200">Terms</Link>
              <Link href="/contact" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
