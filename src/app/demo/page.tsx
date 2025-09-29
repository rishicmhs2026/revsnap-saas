import Link from 'next/link'
import { 
  ArrowRightIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  MagnifyingGlassIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'

export default function DemoPage() {
  return (
    <div className="main-container">
      {/* Navigation */}
      <nav className="nav-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <span className="font-bold text-white text-xl tracking-tight">RevSnap</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors duration-200">Home</Link>
              <Link href="/dashboard" className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors duration-200">Dashboard</Link>
              <Link href="/pricing" className="btn-primary">Pricing</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            See RevSnap&apos;s Stand-Out Features in Action
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Experience how we help Shopify DTC brands with 10-50 SKUs achieve +23% profit uplift
          </p>
          <div className="flex justify-center">
            <Link 
              href="/pricing"
              className="btn-primary px-8 py-4 text-lg inline-flex items-center"
            >
              Get Started Now
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Demo */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The Complete DTC Pricing Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature built specifically for Shopify brands who need quick, profitable pricing decisions
            </p>
          </div>

          <div className="space-y-20">
            {/* Feature 1: Smart CSV Optimizer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🎯 Smart CSV Pricing Optimizer
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  The 10x feature that sets us apart. Upload your product catalog and get instant pricing recommendations 
                  with real-time margin simulation. Perfect for 10-50 SKU DTC brands who need quick decisions.
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Instant optimization in under 30 seconds
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Real-time margin simulation
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Downloadable optimized CSV
                  </li>
                </ul>
                <Link 
                  href="/pricing-optimizer"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center"
                >
                  Try CSV Optimizer
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    📊
                  </div>
                  <p className="text-gray-600 mb-4">Drag & drop your product CSV here</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>→ AI analyzes your catalog</p>
                    <p>→ Compares to market prices</p>
                    <p>→ Generates optimization report</p>
                    <p className="font-semibold text-green-600">→ Download optimized pricing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: ROI Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-white">
                  <div className="text-center">
                    <h4 className="text-lg font-medium opacity-90 mb-2">Profit Uplift This Month</h4>
                    <p className="text-5xl font-bold mb-4">+23%</p>
                    <div className="flex items-center justify-center space-x-4 text-sm opacity-90">
                      <span>+4% vs last month</span>
                      <span>•</span>
                      <span>$87,500 additional revenue</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  📈 Show Real ROI Results
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Dashboard that prominently displays "+23% profit uplift last month" style metrics. 
                  Track your success with real revenue impact numbers that matter to DTC brands.
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Real-time profit tracking
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Month-over-month comparisons
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Top performing product insights
                  </li>
                </ul>
                <Link 
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center"
                >
                  View ROI Dashboard
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Feature 3: Free Audit Tool */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <MagnifyingGlassIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🎁 Free Store Audit Tool
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Smart distribution through a free audit tool that serves as a lead magnet. 
                  Shopify DTC brands get instant value and see exactly how much revenue they&apos;re missing.
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    3-minute personalized analysis
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    No signup required
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Instant opportunity identification
                  </li>
                </ul>
                <Link 
                  href="/pricing"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center"
                >
                  Get Started
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">
                    Your Pricing Health Score
                  </h4>
                  <div className="text-5xl font-bold text-blue-600 mb-2">78/100</div>
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    NEEDS ATTENTION
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">$12,400</div>
                  <div className="text-sm text-gray-600">Estimated monthly opportunity</div>
                </div>
              </div>
            </div>

            {/* Feature 4: Habit Building */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Today&apos;s Action Items (2 new)</h4>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">7</div>
                      <div className="text-xs text-gray-500">Day Streak</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Price Gap Detected</h5>
                          <p className="text-sm text-gray-600">+$340/month opportunity</p>
                        </div>
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                          Take Action
                        </button>
                      </div>
                    </div>
                    <div className="p-3 rounded border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Weekly Goal Achieved</h5>
                          <p className="text-sm text-gray-600">8 products optimized</p>
                        </div>
                        <span className="text-green-600 text-sm font-medium">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <ClockIcon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🔄 Habit-Forming Workflow
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Build moats through workflow habits and data insights loops. Daily actionable insights 
                  keep users engaged and create a competitive advantage through consistent optimization.
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Daily insights delivered automatically
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Habit tracking with streaks
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Actionable recommendations
                  </li>
                </ul>
                <Link 
                  href="/dashboard"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center"
                >
                  See Daily Insights
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Stand Out in the Crowded SaaS Market?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ Shopify DTC brands using RevSnap&apos;s laser-focused pricing optimization to achieve +23% profit uplift
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/pricing"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Now
            </Link>
            <Link 
              href="/pricing-optimizer"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              CSV Optimizer Tool
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 