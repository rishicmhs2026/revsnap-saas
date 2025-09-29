'use client'

import { WifiIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiIcon className="h-10 w-10 text-blue-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You&apos;re Offline
        </h1>
        
        <p className="text-gray-600 mb-8">
          No worries! You can still access your cached data and use RevSnap offline.
        </p>

        {/* Offline Features */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 text-left">
            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">View cached competitor data</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Browse your product catalog</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Use CSV pricing optimizer</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">View analytics dashboard</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Try to Reconnect</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue Offline
          </button>
        </div>

        {/* Status */}
        <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            Your data will automatically sync when connection is restored
          </p>
        </div>
      </div>
    </div>
  )
} 