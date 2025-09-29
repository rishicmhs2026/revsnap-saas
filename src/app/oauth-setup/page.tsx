import Link from 'next/link'

export default function OAuthSetupPage() {
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
              <Link href="/auth/signin" className="btn-primary">Back to Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              OAuth Setup Guide
            </h1>
            <p className="text-xl text-gray-300">
              Configure Google and GitHub OAuth for social login
            </p>
          </div>

          <div className="space-y-8">
            {/* Google OAuth Setup */}
            <div className="card p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Google OAuth Setup</h2>
              </div>

              <div className="space-y-4 text-gray-300">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Step 1: Create Google Cloud Project</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Google Cloud Console</a></li>
                    <li>Create a new project or select an existing one</li>
                    <li>Enable the Google+ API in the API Library</li>
                  </ol>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Step 2: Create OAuth Credentials</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to &quot;APIs & Services&quot; → &quot;Credentials&quot;</li>
                    <li>Click &quot;Create Credentials&quot; → &quot;OAuth 2.0 Client IDs&quot;</li>
                    <li>Choose &quot;Web application&quot;</li>
                    <li>Add authorized redirect URIs:
                      <div className="bg-gray-900 p-2 rounded mt-2 font-mono text-xs">
                        http://localhost:3001/api/auth/callback/google<br/>
                        https://yourdomain.com/api/auth/callback/google
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Step 3: Add to Environment Variables</h3>
                  <p className="text-sm mb-2">Add these to your <code className="bg-gray-900 px-1 rounded">.env.local</code> file:</p>
                  <div className="bg-gray-900 p-3 rounded font-mono text-xs">
                    GOOGLE_CLIENT_ID=your_google_client_id_here<br/>
                    GOOGLE_CLIENT_SECRET=your_google_client_secret_here
                  </div>
                </div>
              </div>
            </div>

            {/* GitHub OAuth Setup */}
            <div className="card p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🐙</span>
                </div>
                <h2 className="text-2xl font-bold text-white">GitHub OAuth Setup</h2>
              </div>

              <div className="space-y-4 text-gray-300">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Step 1: Create GitHub OAuth App</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">GitHub Developer Settings</a></li>
                    <li>Click &quot;New OAuth App&quot;</li>
                    <li>Fill in the application details</li>
                  </ol>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Step 2: Configure URLs</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Homepage URL:</strong>
                      <div className="bg-gray-900 p-2 rounded mt-1 font-mono text-xs">
                        http://localhost:3001
                      </div>
                    </div>
                    <div>
                      <strong>Authorization callback URL:</strong>
                      <div className="bg-gray-900 p-2 rounded mt-1 font-mono text-xs">
                        http://localhost:3001/api/auth/callback/github
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Step 3: Add to Environment Variables</h3>
                  <p className="text-sm mb-2">Add these to your <code className="bg-gray-900 px-1 rounded">.env.local</code> file:</p>
                  <div className="bg-gray-900 p-3 rounded font-mono text-xs">
                    GITHUB_CLIENT_ID=your_github_client_id_here<br/>
                    GITHUB_CLIENT_SECRET=your_github_client_secret_here
                  </div>
                </div>
              </div>
            </div>

            {/* Environment Variables Template */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Complete .env.local Template</h2>
              <div className="bg-gray-900 p-4 rounded-lg">
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
{`# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
GITHUB_CLIENT_ID="your_github_client_id_here"
GITHUB_CLIENT_SECRET="your_github_client_secret_here"

# Development settings
NODE_ENV="development"`}
                </pre>
              </div>
            </div>

            {/* Restart Instructions */}
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="text-yellow-400 text-2xl mr-3">⚠️</span>
                <h3 className="text-lg font-semibold text-white">Important: Restart Required</h3>
              </div>
              <p className="text-gray-300 mb-4">
                After adding your OAuth credentials to <code className="bg-gray-800 px-1 rounded">.env.local</code>, 
                you must restart your development server for the changes to take effect.
              </p>
              <div className="bg-gray-900 p-3 rounded font-mono text-sm text-gray-300">
                # Kill the current server<br/>
                pkill -f "next"<br/><br/>
                # Restart the server<br/>
                PORT=3001 npm run dev
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              href="/auth/signin"
              className="btn btn-primary btn-lg"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

