import Link from 'next/link'
// import { ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ShieldCheckIcon, CheckIcon, StarIcon, UsersIcon, ArrowUpIcon } from '@heroicons/react/24/outline' // Unused imports

export default function LearnMore() {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#111827', minHeight: '100vh'}}>
      {/* Navigation */}
      <nav className="relative z-10 backdrop-blur-sm border-b border-gray-700 sticky top-0" style={{backgroundColor: 'rgba(31, 41, 55, 0.8)'}}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-3xl font-bold text-white" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.875rem', letterSpacing: '0.1em', color: 'white'}}>
              RevSnap
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/demo" className="text-gray-300 hover:text-white transition-colors duration-200 tracking-wider" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>
                Demo
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200 tracking-wider" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>
                Dashboard
              </Link>
              <Link href="/competitor-tracking" className="text-gray-300 hover:text-white transition-colors duration-200 tracking-wider" style={{fontSize: '1rem', letterSpacing: '0.05em', color: '#d1d5db'}}>
                Competitor Tracking
              </Link>
              <Link href="/demo" className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-all duration-200">
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 spotlight"></div>
        <div className="max-w-4xl mx-auto px-4 relative">
          <div className="text-center space-y-16">
            <div>
                          <h1 className="text-4xl md:text-6xl font-semibold text-white mb-4" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '3rem', letterSpacing: '0.2em', color: 'white'}}>
              Revenue optimization, reimagined
            </h1>
              <p className="text-2xl text-gray-300 font-sans leading-relaxed max-w-3xl mx-auto" style={{fontSize: '1.5rem', letterSpacing: '0.1em', color: '#d1d5db'}}>
                Discover how RevSnap transforms your pricing strategy with AI-powered insights, competitive intelligence, and data-driven recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center space-y-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-semibold text-white mb-4" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.5rem', letterSpacing: '0.15em', color: 'white'}}>
                How RevSnap Works
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto font-sans" style={{fontSize: '1.25rem', letterSpacing: '0.1em', color: '#d1d5db'}}>
                Our platform uses advanced analytics and machine learning to optimize your pricing strategy in three simple steps.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
              <div className="text-center">
                <div className="bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6" style={{width: '5rem', height: '5rem', padding: '1rem', backgroundColor: '#374151'}}>
                  <span className="text-white" style={{fontSize: '2.5rem'}}>📊</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.25rem', letterSpacing: '0.1em', color: 'white'}}>1. Analyze Your Data</h3>
                <p className="text-gray-300 font-sans text-lg" style={{fontSize: '1.125rem', letterSpacing: '0.05em', color: '#d1d5db'}}>
                  Connect your existing systems and let our AI analyze your pricing history, customer behavior, and market trends.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6" style={{width: '5rem', height: '5rem', padding: '1rem', backgroundColor: '#374151'}}>
                  <span className="text-white" style={{fontSize: '2.5rem'}}>📈</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.25rem', letterSpacing: '0.1em', color: 'white'}}>2. Get AI Recommendations</h3>
                <p className="text-gray-300 font-sans text-lg" style={{fontSize: '1.125rem', letterSpacing: '0.05em', color: '#d1d5db'}}>
                  Receive personalized pricing recommendations based on competitive analysis, demand forecasting, and profit optimization.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6" style={{width: '5rem', height: '5rem', padding: '1rem', backgroundColor: '#374151'}}>
                  <span className="text-white" style={{fontSize: '2.5rem'}}>🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.25rem', letterSpacing: '0.1em', color: 'white'}}>3. Optimize & Scale</h3>
                <p className="text-gray-300 font-sans text-lg" style={{fontSize: '1.125rem', letterSpacing: '0.05em', color: '#d1d5db'}}>
                  Implement optimized pricing strategies and watch your revenue grow with continuous monitoring and adjustments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-16">
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-serif font-semibold text-white mb-4 tracking-wider">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto tracking-wide font-sans">
                Everything you need to optimize your pricing strategy and maximize profits.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              <div className="space-y-16">
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <span className="text-white text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-semibold text-white mb-3 tracking-wide">Advanced Analytics</h3>
                    <p className="text-xl text-gray-300 tracking-wide font-sans">
                      Deep insights into your pricing performance with break-even analysis, margin optimization, and revenue forecasting.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <span className="text-white text-2xl">📈</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-semibold text-white mb-3 tracking-wide">Competitive Intelligence</h3>
                    <p className="text-xl text-gray-300 tracking-wide font-sans">
                      Real-time monitoring of competitor pricing strategies with automated alerts and market positioning insights.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <span className="text-white text-2xl">💰</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-semibold text-white mb-3 tracking-wide">Dynamic Pricing</h3>
                    <p className="text-xl text-gray-300 tracking-wide font-sans">
                      AI-powered pricing recommendations that adapt to market conditions, demand fluctuations, and customer segments.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-16">
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <span className="text-white text-2xl">🛡️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-semibold text-white mb-3 tracking-wide">Risk Management</h3>
                    <p className="text-xl text-gray-300 tracking-wide font-sans">
                      Comprehensive risk assessment and mitigation strategies to protect your margins and market position.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <span className="text-white text-2xl">👥</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-semibold text-white mb-3 tracking-wide">Customer Segmentation</h3>
                    <p className="text-xl text-gray-300 tracking-wide font-sans">
                      Intelligent customer grouping for targeted pricing strategies that maximize value from each segment.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <span className="text-white text-2xl">⭐</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-semibold text-white mb-3 tracking-wide">Performance Tracking</h3>
                    <p className="text-xl text-gray-300 tracking-wide font-sans">
                      Real-time dashboards and automated reporting to track the impact of your pricing decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-16">
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-serif font-semibold text-white mb-4 tracking-wider">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto tracking-wide font-sans">
                Choose the plan that fits your business needs. All plans include our core optimization tools.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
              {/* Starter Plan */}
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <h3 className="text-2xl font-serif font-bold text-white mb-2 tracking-wide">Starter</h3>
                <p className="text-gray-400 mb-6 tracking-wide font-sans text-lg">Perfect for small businesses</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$99</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-300 tracking-wide font-sans text-lg">
                    <span className="text-green-400 mr-3 text-lg">✓</span>
                    Up to 100 products
                  </li>
                  <li className="flex items-center text-gray-300 tracking-wide font-sans text-lg">
                    <span className="text-green-400 mr-3 text-lg">✓</span>
                    Basic analytics
                  </li>
                  <li className="flex items-center text-gray-300 tracking-wide font-sans text-lg">
                    <span className="text-green-400 mr-3 text-lg">✓</span>
                    Email support
                  </li>
                  <li className="flex items-center text-gray-300 tracking-wide font-sans text-lg">
                    <span className="text-green-400 mr-3 text-lg">✓</span>
                    Monthly reports
                  </li>
                </ul>
                <Link href="/demo" className="block w-full bg-white text-gray-900 text-center py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors tracking-wide">
                  Get Started
                </Link>
              </div>
              
              {/* Professional Plan */}
              <div className="bg-white rounded-2xl p-8 border-2 border-white relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-semibold tracking-wide">Most Popular</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2 tracking-wide">Professional</h3>
                <p className="text-gray-600 mb-6 tracking-wide font-sans text-lg">For growing businesses</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$299</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-700 tracking-wide font-sans text-lg">
                    <span className="text-green-600 mr-3 text-lg">✓</span>
                    Unlimited products
                  </li>
                  <li className="flex items-center text-gray-700 tracking-wide font-sans text-lg">
                    <span className="text-green-600 mr-3 text-lg">✓</span>
                    Advanced analytics
                  </li>
                  <li className="flex items-center text-gray-700 tracking-wide font-sans text-lg">
                    <span className="text-green-600 mr-3 text-lg">✓</span>
                    Competitive intelligence
                  </li>
                  <li className="flex items-center text-gray-700 tracking-wide font-sans text-lg">
                    <span className="text-green-600 mr-3 text-lg">✓</span>
                    Priority support
                  </li>
                  <li className="flex items-center text-gray-700 tracking-wide font-sans text-lg">
                    <span className="text-green-600 mr-3 text-lg">✓</span>
                    Custom integrations
                  </li>
                </ul>
                <Link href="/demo" className="block w-full bg-gray-900 text-white text-center py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors tracking-wide">
                  Get Started
                </Link>
              </div>
              
              {/* Enterprise Plan */}
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <h3 className="text-2xl font-serif font-bold text-white mb-2 tracking-wide">Enterprise</h3>
                <p className="text-gray-400 mb-6 tracking-wide font-sans text-lg">For large organizations</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$599</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-300 tracking-wide font-sans text-lg">
                    <span className="text-green-400 mr-3 text-lg">✓</span>
                    Everything in Professional
                  </li>
                  <li className="flex items-center text-gray-300 tracking-wide font-sans text-lg">
                    <span className="text-green-400 mr-3 text-lg">✓</span>
                    Dedicated account manager
                  </li>
                  <li className="flex items-center text-gray-300 tracking-wide font-sans text-lg">
                    <span className="text-green-400 mr-3 text-lg">✓</span>
                    Custom AI models
                  </li>
                  <li className="flex items-center text-gray-300 tracking-wide font-sans text-lg">
                    <span className="text-green-400 mr-3 text-lg">✓</span>
                    24/7 phone support
                  </li>
                  <li className="flex items-center text-gray-300 tracking-wide font-sans text-lg">
                    <span className="text-green-400 mr-3 text-lg">✓</span>
                    SLA guarantees
                  </li>
                </ul>
                <Link href="/demo" className="block w-full bg-white text-gray-900 text-center py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors tracking-wide">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center space-y-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-semibold text-white mb-4 tracking-wider">
                Ready to optimize your revenue?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto tracking-wide font-sans">
                Join thousands of businesses that have increased their profit margins by 15-40% using RevSnap.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing" className="bg-white text-gray-900 font-semibold rounded-full px-8 py-4 text-lg hover:bg-gray-100 transition-all duration-300 tracking-wide">
                Get Started
              </Link>
              <Link href="/" className="border-2 border-white text-white font-semibold rounded-full px-8 py-4 text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 tracking-wide">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 