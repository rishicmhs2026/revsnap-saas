import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceptable Use Policy - RevSnap',
  description: 'Acceptable Use Policy for RevSnap SaaS platform - Guidelines for responsible use of our competitor tracking service.',
}

export default function AcceptableUsePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Acceptable Use Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="mb-4">
                This Acceptable Use Policy (&quot;Policy&quot;) outlines the rules and guidelines for using RevSnap&apos;s competitor tracking and market intelligence platform. By using our Service, you agree to comply with this Policy.
              </p>
              <p className="mb-4">
                <strong>Purpose:</strong> This Policy ensures that all users can enjoy a safe, secure, and productive experience while using our platform for legitimate business intelligence purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Permitted Uses</h2>
              <p className="mb-4">You may use our Service for the following legitimate business purposes:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Competitive Intelligence:</strong> Monitoring competitor pricing and market positioning</li>
                <li><strong>Market Research:</strong> Analyzing industry trends and market dynamics</li>
                <li><strong>Pricing Strategy:</strong> Developing and optimizing your pricing strategies</li>
                <li><strong>Business Planning:</strong> Making informed business decisions based on market data</li>
                <li><strong>Performance Analysis:</strong> Evaluating your competitive position and performance</li>
                <li><strong>Regulatory Compliance:</strong> Ensuring compliance with pricing regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Prohibited Uses</h2>
              <p className="mb-4">You are strictly prohibited from using our Service for any of the following purposes:</p>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">3.1 Illegal Activities</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Any activity that violates applicable laws or regulations</li>
                <li>Price fixing or anti-competitive practices</li>
                <li>Intellectual property infringement</li>
                <li>Fraud, deception, or misrepresentation</li>
                <li>Money laundering or financial crimes</li>
                <li>Export control violations</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.2 Unauthorized Access</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Bypassing security measures or authentication</li>
                <li>Using automated tools to access our Service</li>
                <li>Sharing account credentials with unauthorized users</li>
                <li>Creating multiple accounts to circumvent limits</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.3 System Abuse</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Excessive use that impacts system performance</li>
                <li>Attempting to overload or crash our servers</li>
                <li>Using the Service for denial-of-service attacks</li>
                <li>Interfering with other users&apos; access to the Service</li>
                <li>Reverse engineering or attempting to copy our technology</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.4 Data Misuse</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Reselling or redistributing our data without permission</li>
                <li>Using data for harassment or stalking</li>
                <li>Creating derivative works without authorization</li>
                <li>Sharing data with unauthorized third parties</li>
                <li>Using data for personal attacks or defamation</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.5 Content Violations</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Uploading malicious content or malware</li>
                <li>Transmitting spam or unsolicited communications</li>
                <li>Posting offensive, discriminatory, or harmful content</li>
                <li>Impersonating others or creating false identities</li>
                <li>Sharing confidential or proprietary information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Collection Guidelines</h2>
              <p className="mb-4">
                Our Service collects publicly available pricing information from competitor websites. When using our Service, you must:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Only track publicly available information</li>
                <li>Respect website terms of service and robots.txt files</li>
                <li>Use data for legitimate business purposes only</li>
                <li>Comply with applicable data protection laws</li>
                <li>Not attempt to circumvent rate limiting or access controls</li>
                <li>Report any suspected violations of website terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Rate Limiting and Fair Use</h2>
              <p className="mb-4">To ensure fair access for all users, we implement rate limiting and fair use policies:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>API Limits:</strong> Respect the API rate limits for your subscription tier</li>
                <li><strong>Data Requests:</strong> Avoid excessive data requests that may impact performance</li>
                <li><strong>Concurrent Sessions:</strong> Limit concurrent sessions to reasonable numbers</li>
                <li><strong>Resource Usage:</strong> Use system resources responsibly</li>
                <li><strong>Monitoring:</strong> We monitor usage patterns to ensure fair access</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Account Security</h2>
              <p className="mb-4">You are responsible for maintaining the security of your account:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Use strong, unique passwords</li>
                <li>Enable two-factor authentication when available</li>
                <li>Keep your login credentials confidential</li>
                <li>Log out from shared or public computers</li>
                <li>Report any suspicious account activity immediately</li>
                <li>Update your contact information regularly</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Compliance with Laws</h2>
              <p className="mb-4">You must comply with all applicable laws and regulations, including:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Data Protection:</strong> GDPR, CCPA, and other privacy laws</li>
                <li><strong>Competition Law:</strong> Anti-trust and competition regulations</li>
                <li><strong>Intellectual Property:</strong> Copyright and trademark laws</li>
                <li><strong>Export Controls:</strong> International trade regulations</li>
                <li><strong>Industry-Specific:</strong> Regulations applicable to your industry</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Reporting Violations</h2>
              <p className="mb-4">
                If you become aware of any violations of this Policy, please report them immediately:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Email:</strong> abuse@revsnap.com</li>
                <li><strong>Support:</strong> Through our customer support channels</li>
                <li><strong>Legal:</strong> legal@revsnap.com for legal matters</li>
              </ul>
              <p className="mb-4">
                Please provide as much detail as possible, including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Description of the violation</li>
                <li>Evidence or documentation</li>
                <li>User account information (if applicable)</li>
                <li>Date and time of the incident</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Enforcement and Consequences</h2>
              <p className="mb-4">Violations of this Policy may result in:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Warning:</strong> Formal notice of the violation</li>
                <li><strong>Suspension:</strong> Temporary suspension of account access</li>
                <li><strong>Termination:</strong> Permanent termination of account</li>
                <li><strong>Legal Action:</strong> Pursuit of legal remedies if necessary</li>
                <li><strong>Reporting:</strong> Reporting to law enforcement if required</li>
              </ul>
              <p className="mb-4">
                We reserve the right to take appropriate action based on the severity and nature of the violation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Updates to This Policy</h2>
              <p className="mb-4">
                We may update this Acceptable Use Policy from time to time to reflect changes in our services, legal requirements, or industry best practices. We will notify users of material changes by posting the updated policy on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="mb-4">If you have questions about this Acceptable Use Policy, please contact us:</p>
              <ul className="list-none pl-6 mb-4">
                <li><strong>General Questions:</strong> support@revsnap.com</li>
                <li><strong>Abuse Reports:</strong> abuse@revsnap.com</li>
                <li><strong>Legal Matters:</strong> legal@revsnap.com</li>
                <li><strong>Address:</strong> [Your Business Address]</li>
                <li><strong>Phone:</strong> [Your Phone Number]</li>
              </ul>
            </section>

            <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>Important:</strong> Violations of this Acceptable Use Policy may result in immediate account termination and legal action. We take compliance seriously to ensure a safe and productive environment for all users.
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