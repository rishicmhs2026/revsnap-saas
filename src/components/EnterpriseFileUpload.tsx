'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  ArrowUpTrayIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface EnterpriseFileUploadProps {
  onFileUpload: (file: File) => void
  onAnalysisComplete: (results: any) => void
  isProcessing: boolean
}

export default function EnterpriseFileUpload({ 
  onFileUpload, 
  onAnalysisComplete, 
  isProcessing 
}: EnterpriseFileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Please upload a CSV file only.')
      } else if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File size must be less than 10MB.')
      } else {
        setError('Invalid file. Please try again.')
      }
      return
    }

    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setUploadProgress(0)
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            onFileUpload(file)
            return 100
          }
          return prev + 10
        })
      }, 100)
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  const removeFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="max-w-2xl mx-auto">
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? 'border-purple-500 bg-purple-900/20' 
              : uploadedFile
                ? 'border-green-500 bg-green-900/20'
                : 'border-gray-600 bg-gray-900/50 hover:border-gray-500 hover:bg-gray-800/50'
          }`}
        >
          <input {...getInputProps()} />
          
          {uploadedFile ? (
            <div className="space-y-4">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
              <div>
                <p className="text-lg font-medium text-white mb-2">File uploaded successfully!</p>
                <div className="flex items-center justify-center space-x-2">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-300">{uploadedFile.name}</span>
                  <button
                    onClick={removeFile}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              {uploadProgress < 100 && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <ArrowUpTrayIcon className={`mx-auto h-12 w-12 ${
                isDragActive ? 'text-purple-500' : 'text-gray-400'
              }`} />
              
              {isDragActive ? (
                <div>
                  <p className="text-lg font-medium text-purple-400 mb-2">
                    Drop your CSV file here...
                  </p>
                  <p className="text-sm text-gray-400">
                    Release to upload and start analysis
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-white mb-2">
                    Upload your sales data CSV
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Drag & drop your file here, or click to browse
                  </p>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 text-left max-w-md mx-auto">
                    <p className="text-xs font-medium text-gray-300 mb-2">Required columns:</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Product Name</li>
                      <li>• Current Price</li>
                      <li>• Cost/COGS</li>
                      <li>• Units Sold (optional)</li>
                      <li>• Category (optional)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-red-400">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="text-gray-300">Analyzing your data and generating insights...</span>
            </div>
            <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-600 to-yellow-500 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Sample Data Option */}
      {!uploadedFile && !isProcessing && (
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-4">
            Don't have a CSV file? Try our demo with sample data
          </p>
          <button
            onClick={() => {
              // Generate sample CSV data
              const sampleData = `Product Name,Current Price,Cost,Units Sold,Category
Premium Wireless Headphones,199.99,89.50,1250,Electronics
Organic Coffee Beans,24.99,12.30,890,Food & Beverage
Yoga Mat Pro,79.99,35.20,2100,Fitness
Smart Water Bottle,39.99,18.75,1800,Health
Leather Wallet,89.99,42.10,650,Accessories
Bluetooth Speaker,149.99,67.80,950,Electronics
Protein Powder,49.99,22.40,1200,Health
Running Shoes,129.99,58.90,1800,Fitness
Essential Oil Set,34.99,16.20,750,Wellness
Phone Case,19.99,8.50,3200,Accessories`
              
              const blob = new Blob([sampleData], { type: 'text/csv' })
              const file = new File([blob], 'sample-data.csv', { type: 'text/csv' })
              setUploadedFile(file)
              onFileUpload(file)
            }}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Use Sample Data
          </button>
        </div>
      )}
    </div>
  )
}
