import Link from 'next/link'
import { ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ShieldCheckIcon, CheckIcon, StarIcon, UsersIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

export default function LearnMore() {
  return (
    <div className="min-h-screen bg-apple-black">
      {/* Navigation */}
      <nav className="relative z-10 bg-apple-black/80 backdrop-blur-sm border-b border-apple-gray-800 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-playfair font-bold text-white">
              RevSnap
            </Link>
            <Link href="/demo" className="bg-white text-apple-black px-6 py-2 rounded-full text-sm font-medium hover:bg-apple-gray-100 transition-all duration-200">
              Try Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 spotlight"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold text-white leading-tight tracking-tight mb-8">
              Revenue optimization, reimagined
            </h1>
            <p className="text-xl text-apple-gray-300 font-sans leading-relaxed max-w-3xl mx-auto">
              Discover how RevSnap transforms your pricing strategy with AI-powered insights, competitive intelligence, and data-driven recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-white mb-6">
              How RevSnap Works
            </h2>
            <p className="text-lg text-apple-gray-300 max-w-2xl mx-auto">
              Our platform uses advanced analytics and machine learning to optimize your pricing strategy in three simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-apple-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-playfair font-semibold text-white mb-4">1. Analyze Your Data</h3>
              <p className="text-apple-gray-300">
                Connect your existing systems and let our AI analyze your pricing history, customer behavior, and market trends.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-apple-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <ArrowTrendingUpIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-playfair font-semibold text-white mb-4">2. Get AI Recommendations</h3>
              <p className="text-apple-gray-300">
                Receive personalized pricing recommendations based on competitive analysis, demand forecasting, and profit optimization.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-apple-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <ArrowUpIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-playfair font-semibold text-white mb-4">3. Optimize & Scale</h3>
              <p className="text-apple-gray-300">
                Implement optimized pricing strategies and watch your revenue grow with continuous monitoring and adjustments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-apple-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-lg text-apple-gray-300 max-w-2xl mx-auto">
              Everything you need to optimize your pricing strategy and maximize profits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-apple-gray-800 rounded-lg p-2">
                  <ChartBarIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-playfair font-semibold text-white mb-3">Advanced Analytics</h3>
                  <p className="text-lg text-apple-gray-300">
                    Deep insights into your pricing performance with break-even analysis, margin optimization, and revenue forecasting.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-apple-gray-800 rounded-lg p-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-playfair font-semibold text-white mb-3">Competitive Intelligence</h3>
                  <p className="text-lg text-apple-gray-300">
                    Real-time monitoring of competitor pricing strategies with automated alerts and market positioning insights.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-apple-gray-800 rounded-lg p-2">
                  <CurrencyDollarIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-playfair font-semibold text-white mb-3">Dynamic Pricing</h3>
                  <p className="text-lg text-apple-gray-300">
                    AI-powered pricing recommendations that adapt to market conditions, demand fluctuations, and customer segments.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-apple-gray-800 rounded-lg p-2">
                  <ShieldCheckIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-playfair font-semibold text-white mb-3">Risk Management</h3>
                  <p className="text-lg text-apple-gray-300">
                    Comprehensive risk assessment and mitigation strategies to protect your margins and market position.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-apple-gray-800 rounded-lg p-2">
                  <UsersIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-playfair font-semibold text-white mb-3">Customer Segmentation</h3>
                  <p className="text-lg text-apple-gray-300">
                    Intelligent customer grouping for targeted pricing strategies that maximize value from each segment.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-apple-gray-800 rounded-lg p-2">
                  <StarIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-playfair font-semibold text-white mb-3">Performance Tracking</h3>
                  <p className="text-lg text-apple-gray-300">
                    Real-time dashboards and automated reporting to track the impact of your pricing decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-white mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-apple-gray-300 max-w-2xl mx-auto">
              Choose the plan that fits your business needs. All plans include our core optimization tools.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-apple-gray-800 rounded-2xl p-8 border border-apple-gray-700">
              <h3 className="text-2xl font-playfair font-bold text-white mb-2">Starter</h3>
              <p className="text-apple-gray-400 mb-6">Perfect for small businesses</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-apple-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-apple-gray-300">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  Up to 100 products
                </li>
                <li className="flex items-center text-apple-gray-300">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  Basic analytics
                </li>
                <li className="flex items-center text-apple-gray-300">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  Email support
                </li>
                <li className="flex items-center text-apple-gray-300">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  Monthly reports
                </li>
              </ul>
              <Link href="/demo" className="block w-full bg-white text-apple-black text-center py-3 rounded-full font-semibold hover:bg-apple-gray-100 transition-colors">
                Get Started
              </Link>
            </div>
            
            {/* Professional Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-apple-black text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <h3 className="text-2xl font-playfair font-bold text-apple-black mb-2">Professional</h3>
              <p className="text-apple-gray-600 mb-6">For growing businesses</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-apple-black">$299</span>
                <span className="text-apple-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-apple-gray-700">
                  <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                  Unlimited products
                </li>
                <li className="flex items-center text-apple-gray-700">
                  <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                  Advanced analytics
                </li>
                <li className="flex items-center text-apple-gray-700">
                  <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                  Competitive intelligence
                </li>
                <li className="flex items-center text-apple-gray-700">
                  <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                  Priority support
                </li>
                <li className="flex items-center text-apple-gray-700">
                  <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                  Custom integrations
                </li>
              </ul>
              <Link href="/demo" className="block w-full bg-apple-black text-white text-center py-3 rounded-full font-semibold hover:bg-apple-gray-800 transition-colors">
                Get Started
              </Link>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-apple-gray-800 rounded-2xl p-8 border border-apple-gray-700">
              <h3 className="text-2xl font-playfair font-bold text-white mb-2">Enterprise</h3>
              <p className="text-apple-gray-400 mb-6">For large organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$599</span>
                <span className="text-apple-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-apple-gray-300">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  Everything in Professional
                </li>
                <li className="flex items-center text-apple-gray-300">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  Dedicated account manager
                </li>
                <li className="flex items-center text-apple-gray-300">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  Custom AI models
                </li>
                <li className="flex items-center text-apple-gray-300">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  24/7 phone support
                </li>
                <li className="flex items-center text-apple-gray-300">
                  <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                  SLA guarantees
                </li>
              </ul>
              <Link href="/demo" className="block w-full bg-white text-apple-black text-center py-3 rounded-full font-semibold hover:bg-apple-gray-100 transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-apple-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-white mb-6">
              Ready to optimize your revenue?
            </h2>
            <p className="text-lg text-apple-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that have increased their profit margins by 15-40% using RevSnap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo" className="bg-white text-apple-black font-semibold rounded-full px-8 py-4 text-lg hover:bg-apple-gray-100 transition-all duration-300">
                Start Free Trial
              </Link>
              <Link href="/" className="border-2 border-white text-white font-semibold rounded-full px-8 py-4 text-lg hover:bg-white hover:text-apple-black transition-all duration-300">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 