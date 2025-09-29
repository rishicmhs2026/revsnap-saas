import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy - RevSnap',
  description: 'Cookie Policy for RevSnap SaaS platform - Learn how we use cookies and similar technologies.',
}

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="mb-4">
                This Cookie Policy explains how RevSnap (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) uses cookies and similar technologies when you visit our website and use our services. This policy should be read alongside our Privacy Policy.
              </p>
              <p className="mb-4">
                By using our website, you consent to the use of cookies in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. What Are Cookies?</h2>
              <p className="mb-4">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember information about your visit, such as your preferred language and other settings, which can make your next visit easier and more useful.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">3.1 Essential Cookies</h3>
              <p className="mb-4">These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and form submissions.</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Authentication cookies:</strong> Remember your login status</li>
                <li><strong>Security cookies:</strong> Protect against fraud and security threats</li>
                <li><strong>Session cookies:</strong> Maintain your session during your visit</li>
                <li><strong>Load balancing cookies:</strong> Distribute traffic across servers</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.2 Functional Cookies</h3>
              <p className="mb-4">These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Language preferences:</strong> Remember your preferred language</li>
                <li><strong>Theme settings:</strong> Remember your display preferences</li>
                <li><strong>Form data:</strong> Remember information you&apos;ve entered</li>
                <li><strong>User preferences:</strong> Remember your dashboard settings</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.3 Analytics Cookies</h3>
              <p className="mb-4">These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Google Analytics:</strong> Track website usage and performance</li>
                <li><strong>Vercel Analytics:</strong> Monitor page views and user behavior</li>
                <li><strong>Performance monitoring:</strong> Track loading times and errors</li>
                <li><strong>User journey analysis:</strong> Understand how users navigate our site</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.4 Marketing Cookies</h3>
              <p className="mb-4">These cookies are used to track visitors across websites to display relevant and engaging advertisements.</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Facebook Pixel:</strong> Track conversions and optimize ads</li>
                <li><strong>LinkedIn Insight Tag:</strong> Measure campaign performance</li>
                <li><strong>Google Ads:</strong> Track advertising effectiveness</li>
                <li><strong>Retargeting cookies:</strong> Show relevant ads to returning visitors</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Cookies</h2>
              <p className="mb-4">We use third-party services that may set their own cookies:</p>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 Payment Processing</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Stripe:</strong> Process payments securely</li>
                <li><strong>PayPal:</strong> Alternative payment method</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">4.2 Analytics and Monitoring</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Sentry:</strong> Error tracking and performance monitoring</li>
                <li><strong>LogRocket:</strong> Session replay and debugging</li>
                <li><strong>Hotjar:</strong> User behavior analysis</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">4.3 Marketing and Communication</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Mailchimp:</strong> Email marketing campaigns</li>
                <li><strong>HubSpot:</strong> CRM and marketing automation</li>
                <li><strong>Intercom:</strong> Customer support and chat</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookie Duration</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">5.1 Session Cookies</h3>
              <p className="mb-4">These cookies are temporary and are deleted when you close your browser.</p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">5.2 Persistent Cookies</h3>
              <p className="mb-4">These cookies remain on your device for a set period or until you delete them:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Authentication:</strong> Up to 30 days</li>
                <li><strong>Preferences:</strong> Up to 1 year</li>
                <li><strong>Analytics:</strong> Up to 2 years</li>
                <li><strong>Marketing:</strong> Up to 2 years</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Managing Your Cookie Preferences</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">6.1 Browser Settings</h3>
              <p className="mb-4">You can control cookies through your browser settings:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.2 Cookie Consent</h3>
              <p className="mb-4">When you first visit our website, you&apos;ll see a cookie consent banner. You can:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Accept all cookies</li>
                <li>Reject non-essential cookies</li>
                <li>Customize your preferences</li>
                <li>Change your settings at any time</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.3 Third-Party Opt-Outs</h3>
              <p className="mb-4">You can opt out of third-party cookies:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:underline">Google Analytics Opt-out</a></li>
                <li><strong>Facebook:</strong> <a href="https://www.facebook.com/settings?tab=ads" className="text-blue-600 hover:underline">Facebook Ad Preferences</a></li>
                <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/psettings/guest-controls" className="text-blue-600 hover:underline">LinkedIn Ad Preferences</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Impact of Disabling Cookies</h2>
              <p className="mb-4">If you disable cookies, some features of our website may not function properly:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>You may need to log in repeatedly</li>
                <li>Some features may not work as expected</li>
                <li>Your preferences may not be saved</li>
                <li>Analytics data may be incomplete</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Updates to This Policy</h2>
              <p className="mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
              <p className="mb-4">If you have any questions about our use of cookies, please contact us:</p>
              <ul className="list-none pl-6 mb-4">
                <li><strong>Email:</strong> privacy@revsnap.com</li>
                <li><strong>Address:</strong> [Your Business Address]</li>
                <li><strong>Phone:</strong> [Your Phone Number]</li>
              </ul>
            </section>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Cookie Management:</strong> You can manage your cookie preferences at any time by clicking the &quot;Cookie Settings&quot; link in the footer of our website.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 