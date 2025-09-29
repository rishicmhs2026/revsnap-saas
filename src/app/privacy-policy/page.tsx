import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - RevSnap',
  description: 'Privacy Policy for RevSnap SaaS platform - Learn how we collect, use, and protect your data.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="mb-4">
                RevSnap (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our competitor tracking and market intelligence platform.
              </p>
              <p className="mb-4">
                <strong>Important Notice:</strong> Our service collects publicly available pricing information from competitor websites. We do not collect personal information from competitor websites or violate any website's terms of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Account information (name, email, company)</li>
                <li>Payment information (processed securely by Stripe)</li>
                <li>Product information you want to track</li>
                <li>Communication preferences</li>
                <li>Support requests and feedback</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">2.2 Information We Collect Automatically</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Usage data and analytics</li>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Cookies and similar technologies</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">2.3 Competitor Data Collection</h3>
              <p className="mb-4">
                Our service collects publicly available pricing and product information from competitor websites. This data includes:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Product prices and availability</li>
                <li>Product ratings and reviews</li>
                <li>Product specifications and descriptions</li>
                <li>Historical price trends</li>
              </ul>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Legal Notice:</strong> We only collect publicly available information and respect all website terms of service and robots.txt files. We do not collect personal information from competitor websites.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide and maintain our services</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send you important updates and notifications</li>
                <li>Provide customer support</li>
                <li>Improve our services and develop new features</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Service Providers:</strong> With trusted third-party service providers (Stripe, hosting providers)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> With your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="mb-4">We implement appropriate technical and organizational measures to protect your information:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">6.1 Access and Control</h3>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.2 GDPR Rights (EU Users)</h3>
              <p className="mb-4">If you are in the European Union, you have additional rights under GDPR:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Right to data portability</li>
                <li>Right to restrict processing</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
                <li>Right to lodge a complaint with supervisory authorities</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.3 CCPA Rights (California Users)</h3>
              <p className="mb-4">If you are a California resident, you have rights under CCPA:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know whether personal information is sold or disclosed</li>
                <li>Right to say no to the sale of personal information</li>
                <li>Right to access your personal information</li>
                <li>Right to equal service and price</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="mb-4">We retain your information for as long as necessary to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p className="mb-4">Account data is typically retained for 7 years after account deletion for legal compliance.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Standard contractual clauses</li>
                <li>Adequacy decisions</li>
                <li>Other appropriate safeguards</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies and Tracking Technologies</h2>
              <p className="mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Remember your preferences</li>
                <li>Analyze website usage</li>
                <li>Provide personalized content</li>
                <li>Improve our services</li>
              </ul>
              <p className="mb-4">You can control cookie settings through your browser preferences.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
              <p className="mb-4">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="mb-4">If you have any questions about this Privacy Policy, please contact us:</p>
              <ul className="list-none pl-6 mb-4">
                <li><strong>Email:</strong> privacy@revsnap.com</li>
                <li><strong>Address:</strong> [Your Business Address]</li>
                <li><strong>Phone:</strong> [Your Phone Number]</li>
              </ul>
            </section>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Legal Disclaimer:</strong> This privacy policy is a template and should be reviewed by a qualified attorney before use. The information provided does not constitute legal advice.
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