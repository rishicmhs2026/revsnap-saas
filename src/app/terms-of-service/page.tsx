import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - RevSnap',
  description: 'Terms of Service for RevSnap SaaS platform - Legal terms and conditions for using our competitor tracking service.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using RevSnap (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="mb-4">
                RevSnap is a B2B SaaS platform that provides competitor tracking and market intelligence services. Our service includes:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Real-time competitor price monitoring</li>
                <li>Market intelligence and analytics</li>
                <li>AI-powered insights and recommendations</li>
                <li>Data export and reporting capabilities</li>
                <li>API access for integrations</li>
              </ul>
              <p className="mb-4">
                <strong>Important Notice:</strong> Our service collects publicly available pricing information from competitor websites for legitimate business intelligence purposes only. We respect all website terms of service and robots.txt files.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              <p className="mb-4">To use our Service, you must:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Be at least 18 years old or have parental consent</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
              <p className="mb-4">You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the Service or other users</li>
                <li>Use the Service for illegal or unethical purposes</li>
                <li>Resell or redistribute our data without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription and Payment Terms</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">5.1 Subscription Plans</h3>
              <p className="mb-4">We offer the following subscription plans:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Starter Plan:</strong> $49/month - Up to 25 products</li>
                <li><strong>Professional Plan:</strong> $149/month - Up to 200 products</li>
                <li><strong>Enterprise Plan:</strong> $399/month - Unlimited products</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">5.2 Payment Terms</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>All fees are billed in advance on a monthly basis</li>
                <li>Payments are processed securely through Stripe</li>
                <li>Failed payments may result in service suspension</li>
                <li>Price changes will be communicated 30 days in advance</li>
                <li>No refunds for partial months or unused services</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">5.3 Cancellation</h3>
              <p className="mb-4">
                You may cancel your subscription at any time through your account settings or by contacting support. Cancellation will take effect at the end of your current billing period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data and Privacy</h2>
              <p className="mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p className="mb-4">
                <strong>Competitor Data:</strong> We collect publicly available pricing information from competitor websites. This data is used solely for legitimate business intelligence purposes and in compliance with applicable laws and website terms of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="mb-4">
                The Service and its original content, features, and functionality are owned by RevSnap and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="mb-4">
                You retain ownership of any content you submit to the Service, but grant us a license to use, modify, and display such content in connection with providing the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
              <p className="mb-4">
                We strive to maintain high service availability but cannot guarantee uninterrupted access. We may temporarily suspend the Service for maintenance, updates, or other operational reasons.
              </p>
              <p className="mb-4">
                <strong>Uptime Guarantee:</strong> We target 99.5% uptime but do not guarantee specific availability levels.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">9.1 Service Disclaimers</h3>
              <p className="mb-4">The Service is provided &quot;as is&quot; without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Accuracy, completeness, or reliability of data</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement of third-party rights</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">9.2 Limitation of Liability</h3>
              <p className="mb-4">
                In no event shall RevSnap be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities.
              </p>
              <p className="mb-4">
                Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="mb-4">
                You agree to indemnify and hold harmless RevSnap from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="mb-4">We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.</p>
              <p className="mb-4">Upon termination, your right to use the Service will cease immediately, and we may delete your account and data.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the new Terms on this page and updating the &quot;Last updated&quot; date.
              </p>
              <p className="mb-4">
                Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="mb-4">If you have any questions about these Terms of Service, please contact us:</p>
              <ul className="list-none pl-6 mb-4">
                <li><strong>Email:</strong> legal@revsnap.com</li>
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
                    <strong>Legal Disclaimer:</strong> These terms of service are a template and should be reviewed by a qualified attorney before use. The information provided does not constitute legal advice.
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