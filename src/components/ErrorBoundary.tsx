'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-900/20 border border-red-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h2>
            
            <p className="text-gray-400 mb-8">
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-medium text-red-400 mb-2">Error Details:</h3>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-yellow-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-yellow-600 transition-all"
              >
                <ArrowPathIcon className="h-5 w-5" />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-800 hover:text-white transition-all"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for handling async errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error('Async error caught:', error, errorInfo)
    
    // You can integrate with error reporting services here
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }
}

// Component for displaying file upload errors
interface FileUploadErrorProps {
  error: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function FileUploadError({ error, onRetry, onDismiss }: FileUploadErrorProps) {
  const getErrorMessage = (error: string) => {
    if (error.includes('file-invalid-type')) {
      return 'Please upload a CSV file only. Other file types are not supported.'
    }
    if (error.includes('file-too-large')) {
      return 'File size must be less than 10MB. Please compress your file and try again.'
    }
    if (error.includes('network')) {
      return 'Network error occurred. Please check your connection and try again.'
    }
    if (error.includes('parse')) {
      return 'Unable to parse the CSV file. Please check the format and try again.'
    }
    return error
  }

  return (
    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-400 mb-1">
            Upload Error
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            {getErrorMessage(error)}
          </p>
          <div className="flex space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-gray-400 hover:text-gray-300 font-medium"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Component for displaying API errors
interface APIErrorProps {
  error: string
  onRetry?: () => void
}

export function APIError({ error, onRetry }: APIErrorProps) {
  const getErrorMessage = (error: string) => {
    if (error.includes('network')) {
      return 'Unable to connect to our servers. Please check your internet connection and try again.'
    }
    if (error.includes('timeout')) {
      return 'The request timed out. Please try again with a smaller file or check your connection.'
    }
    if (error.includes('server')) {
      return 'Our servers are experiencing issues. Please try again in a few minutes.'
    }
    if (error.includes('rate limit')) {
      return 'Too many requests. Please wait a moment before trying again.'
    }
    return error
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-400 mb-1">
            Analysis Error
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            {getErrorMessage(error)}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-yellow-400 hover:text-yellow-300 font-medium"
            >
              Retry Analysis
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
