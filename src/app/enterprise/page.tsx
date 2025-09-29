import Link from 'next/link'
import { 
  ArrowTrendingUpIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export default function EnterpriseLandingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-white text-xl">RevSnap</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/pricing" className="text-gray-300 hover:text-white font-medium transition-colors">Pricing</Link>
              <Link href="/demo" className="text-gray-300 hover:text-white font-medium transition-colors">Demo</Link>
              <Link href="/auth/signin" className="text-gray-300 hover:text-white font-medium transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-yellow-500 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-yellow-600 transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-yellow-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-900/20 border border-green-700/50 rounded-full text-green-300 text-sm font-medium mb-8">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Enterprise-ready AI pricing optimization
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Unlock millions in
              <span className="bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent"> hidden revenue</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              AI-powered pricing optimization that helps enterprise CFOs and revenue teams 
              <span className="text-green-400 font-semibold"> increase profits by 15-40%</span> with data-driven insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link 
                href="/pricing-optimizer" 
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-yellow-500 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 shadow-2xl"
              >
                Upload Your Data & See Results
              </Link>
              <Link 
                href="/demo" 
                className="px-8 py-4 border-2 border-gray-600 text-white text-lg font-semibold rounded-xl hover:border-gray-500 hover:bg-gray-800 transition-all duration-200"
              >
                View Live Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">$2.3M+</div>
                <div className="text-gray-300">Average annual revenue uplift</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">30 sec</div>
                <div className="text-gray-300">Setup time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">95%</div>
                <div className="text-gray-300">Implementation success rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Enterprise-Grade Pricing Intelligence
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built for CFOs, revenue teams, and pricing managers who need actionable insights, not just data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-6">
                <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Revenue Uplift Analysis</h3>
              <p className="text-gray-300 leading-relaxed">
                Get precise revenue projections with confidence intervals. See exactly how much additional revenue 
                each pricing change will generate.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 hover:border-yellow-500/50 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center mb-6">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Advanced Analytics</h3>
              <p className="text-gray-300 leading-relaxed">
                Deep-dive into price elasticity, market positioning, and competitive analysis with 
                enterprise-grade reporting.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 hover:border-green-500/50 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Enterprise Security</h3>
              <p className="text-gray-300 leading-relaxed">
                SOC 2 compliant with end-to-end encryption. Your pricing data stays secure and private.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-6">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Real-Time Insights</h3>
              <p className="text-gray-300 leading-relaxed">
                Get instant pricing recommendations as market conditions change. No waiting for batch processing.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-6">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Executive Reports</h3>
              <p className="text-gray-300 leading-relaxed">
                Generate board-ready PDF reports with branded insights and actionable recommendations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 hover:border-yellow-500/50 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center mb-6">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">ROI Guarantee</h3>
              <p className="text-gray-300 leading-relaxed">
                See positive ROI within 30 days or get your money back. We're confident in our results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Enterprise Teams
            </h2>
            <p className="text-xl text-gray-300">
              Join forward-thinking companies already using RevSnap to optimize their pricing strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">
                "RevSnap helped us identify $1.2M in additional revenue opportunities we never knew existed. 
                The ROI was immediate and the insights were actionable."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">JS</span>
                </div>
                <div className="ml-3">
                  <div className="text-white font-medium">Jennifer Smith</div>
                  <div className="text-gray-400 text-sm">CFO, TechCorp</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">
                "The enterprise features and security compliance made it easy to get approval from our board. 
                Setup was seamless and results were visible within days."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">MR</span>
                </div>
                <div className="ml-3">
                  <div className="text-white font-medium">Michael Rodriguez</div>
                  <div className="text-gray-400 text-sm">VP Revenue, GrowthCo</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">
                "Finally, a pricing tool that speaks the language of finance. The reports are board-ready 
                and the insights are backed by solid data science."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">AL</span>
                </div>
                <div className="ml-3">
                  <div className="text-white font-medium">Amanda Lee</div>
                  <div className="text-gray-400 text-sm">Head of Pricing, ScaleUp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-yellow-900/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Pricing Strategy?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join enterprise teams who are already seeing 15-40% profit improvements with AI-powered pricing optimization.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/pricing-optimizer" 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-yellow-500 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              Start Your Analysis Now
            </Link>
            <Link 
              href="/pricing" 
              className="px-8 py-4 border-2 border-gray-600 text-white text-lg font-semibold rounded-xl hover:border-gray-500 hover:bg-gray-800 transition-all duration-200"
            >
              View Enterprise Pricing
            </Link>
          </div>
          
          <p className="text-sm text-gray-400 mt-8">
            No credit card required • 30-day money-back guarantee • Enterprise support included
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-white text-lg">RevSnap</span>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
