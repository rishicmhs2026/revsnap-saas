'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

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
            💬 Get in touch with our team
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Contact RevSnap
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Have questions about pricing optimization? Need help with your DTC strategy? 
            <span className="text-white font-medium"> Our team is here to help you succeed.</span>
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Message sent!</h3>
                  <p className="text-gray-300 mb-6">
                    Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false)
                      setFormData({ name: '', email: '', company: '', subject: '', message: '' })
                    }}
                    className="btn btn-secondary"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="input"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="input"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="input"
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Select a topic</option>
                      <option value="pricing">Pricing & Plans</option>
                      <option value="demo">Request Demo</option>
                      <option value="support">Technical Support</option>
                      <option value="integration">Integration Help</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="input resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* Quick Contact */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-lg">📧</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Email</p>
                      <p className="text-gray-300 text-sm">support@revsnap.com</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-lg">💬</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Live Chat</p>
                      <p className="text-gray-300 text-sm">Available 9 AM - 6 PM EST</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-lg">📱</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Response Time</p>
                      <p className="text-gray-300 text-sm">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Links */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Answers</h3>
                <div className="space-y-3">
                  <Link href="/pricing" className="block p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <p className="text-white font-medium">💰 Pricing & Plans</p>
                    <p className="text-gray-400 text-sm">View all pricing options</p>
                  </Link>
                  <Link href="/demo" className="block p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <p className="text-white font-medium">🎯 Product Demo</p>
                    <p className="text-gray-400 text-sm">See RevSnap in action</p>
                  </Link>
                  <Link href="/free-audit" className="block p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <p className="text-white font-medium">🎁 Free Store Audit</p>
                    <p className="text-gray-400 text-sm">Get instant analysis</p>
                  </Link>
                </div>
              </div>

              {/* Support Hours */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Support Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Monday - Friday</span>
                    <span className="text-white">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Saturday</span>
                    <span className="text-white">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sunday</span>
                    <span className="text-gray-400">Closed</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-3">
                    <p className="text-gray-300">
                      <span className="text-green-400">✓</span> Enterprise customers get 24/7 priority support
                    </p>
                  </div>
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
            Ready to optimize your pricing?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Don&apos;t wait for a response - start your free trial today and see results immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="btn btn-primary btn-lg"
            >
              🚀 Start Free Trial
            </Link>
            <Link
              href="/pricing-optimizer"
              className="btn btn-secondary btn-lg"
            >
              📊 Try CSV Optimizer
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            No credit card required • Instant access • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
}

