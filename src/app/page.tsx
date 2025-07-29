import Link from 'next/link'
import { ArrowRightIcon, ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">RevSnap</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Features
                </Link>
                <Link href="#pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Pricing
                </Link>
                <Link href="/demo" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Try Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Optimize Your Revenue,
              <span className="text-blue-600"> Maximize Your Profits</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Data-driven revenue optimization platform for small businesses. 
              Increase your profit margins by 15-40% with our advanced analytics and competitive insights.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/demo"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Start Free Trial
              </Link>
              <Link href="#how-it-works" className="text-sm font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Advanced Analytics</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to optimize your pricing strategy
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our platform combines market data, competitor analysis, and profit modeling to help you make informed pricing decisions.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <ChartBarIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Profit Analytics
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Advanced profit modeling with break-even analysis, margin optimization, and revenue forecasting.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <ArrowTrendingUpIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Competitive Intelligence
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Real-time market analysis and competitor pricing insights to stay ahead of the competition.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <CurrencyDollarIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Dynamic Pricing
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    AI-powered pricing recommendations based on market conditions, demand, and profitability goals.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose the plan that fits your business needs. All plans include our core pricing optimization tools.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 sm:max-w-none sm:grid-cols-3">
            {/* Starter Plan */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-8 text-gray-900">Starter</h3>
                <p className="rounded-full bg-gray-900/5 px-2.5 py-1 text-xs font-semibold leading-5 text-gray-900">
                  Most popular
                </p>
              </div>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">$70</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
              </p>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                Perfect for small businesses getting started with pricing optimization.
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Basic profit analytics
                </li>
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Up to 50 products
                </li>
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Basic competitor analysis
                </li>
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Email support
                </li>
              </ul>
              <Link
                href="/demo"
                className="mt-8 block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get started
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-8 text-gray-900">Professional</h3>
              </div>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">$150</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
              </p>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                Advanced features for growing businesses with complex pricing needs.
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Advanced profit analytics
                </li>
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Unlimited products
                </li>
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Real-time competitor tracking
                </li>
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  AI-powered recommendations
                </li>
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Priority support
                </li>
              </ul>
              <Link
                href="/demo"
                className="mt-8 block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get started
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-8 text-gray-900">Enterprise</h3>
              </div>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">$200</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
              </p>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                Complete solution for large businesses with multiple locations and complex pricing strategies.
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Everything in Professional
                </li>
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Multi-location support
                </li>
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Custom integrations
                </li>
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Dedicated account manager
                </li>
                <li className="flex gap-x-3">
                  <ShieldCheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Custom reporting
                </li>
              </ul>
              <Link
                href="/demo"
                className="mt-8 block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to optimize your revenue strategy?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-200">
              Join hundreds of businesses that have increased their profit margins by 15-40% using our platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/demo"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start Free Trial
              </Link>
              <Link href="/contact" className="text-sm font-semibold leading-6 text-white">
                Contact Sales <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="/privacy" className="text-gray-400 hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-gray-300">
              Terms of Service
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; 2024 RevSnap. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
