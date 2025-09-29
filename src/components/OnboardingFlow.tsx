'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircleIcon, 
  ArrowRightIcon, 
  PlayIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ReactNode
  isCompleted: boolean
  estimatedTime: string
  importance: 'critical' | 'important' | 'helpful'
}

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [showOnboarding, setShowOnboarding] = useState(true)
  const router = useRouter()

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to RevSnap! 🎉',
      description: 'Let\'s get you set up for pricing success in just 5 minutes',
      estimatedTime: '30 seconds',
      importance: 'critical',
      isCompleted: false,
      component: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <StarIcon className="h-10 w-10 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              You&apos;re about to unlock powerful pricing insights
            </h3>
            <p className="text-gray-600">
              RevSnap tracks your competitors automatically and suggests optimal prices using AI.
              Let&apos;s start with the basics.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Quick Setup:</strong> Add 3-5 products → Connect competitors → Get insights
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'add-products',
      title: 'Add Your First Products',
      description: 'Start with your top 3-5 best-selling products',
      estimatedTime: '2 minutes',
      importance: 'critical',
      isCompleted: false,
      component: (
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Product Information</h4>
              <p className="text-sm text-gray-600">
                Add your product name, SKU, current price, and category. We&apos;ll handle the rest!
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">💡 Pro Tips:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Start with your highest-revenue products</li>
              <li>• Include products with clear competitors</li>
              <li>• Use descriptive names for easy identification</li>
            </ul>
          </div>

          <button 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => router.push('/products/new')}
          >
            Add Your First Product →
          </button>
        </div>
      )
    },
    {
      id: 'setup-tracking',
      title: 'Connect Competitor Sources',
      description: 'Tell us where to track your competitors',
      estimatedTime: '1 minute',
      importance: 'critical',
      isCompleted: false,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {['Amazon', 'Walmart', 'Target', 'Best Buy'].map((source) => (
              <div key={source} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 cursor-pointer transition-colors">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm font-medium">{source}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Smart Tip:</strong> We&apos;ll automatically find your products on these platforms 
              and start tracking prices within 15 minutes.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'configure-alerts',
      title: 'Set Up Smart Alerts',
      description: 'Get notified when competitors change prices',
      estimatedTime: '1 minute',
      importance: 'important',
      isCompleted: false,
      component: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Price Drop Alert</h5>
                <p className="text-sm text-gray-600">When competitors drop prices by 10%+</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Pricing Opportunity</h5>
                <p className="text-sm text-gray-600">When you can increase prices safely</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Weekly Summary</h5>
                <p className="text-sm text-gray-600">Market overview every Monday</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <BellIcon className="h-5 w-5 text-blue-600 mb-2" />
            <p className="text-sm text-blue-800">
              You&apos;ll receive alerts via email and in your dashboard. You can customize these anytime.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'explore-features',
      title: 'Explore Your Dashboard',
      description: 'Take a quick tour of RevSnap\'s powerful features',
      estimatedTime: '1 minute',
      importance: 'helpful',
      isCompleted: false,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h5 className="font-medium text-gray-900">Analytics Dashboard</h5>
                <p className="text-sm text-gray-600">See market trends, competitor moves, and pricing opportunities</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h5 className="font-medium text-gray-900">CSV Optimizer</h5>
                <p className="text-sm text-gray-600">Upload your product catalog for instant pricing recommendations</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <CogIcon className="h-6 w-6 text-purple-600 mt-1" />
              <div>
                <h5 className="font-medium text-gray-900">ROI Tracking</h5>
                <p className="text-sm text-gray-600">See how much extra profit you&apos;re making with optimized pricing</p>
              </div>
            </div>
          </div>

          <button 
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => router.push('/dashboard')}
          >
            Explore Dashboard →
          </button>
        </div>
      )
    }
  ]

  const completeStep = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
    
    // Auto-advance to next step
    const currentIndex = steps.findIndex(step => step.id === stepId)
    if (currentIndex < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentIndex + 1)
      }, 500)
    } else {
      // Onboarding complete
      setTimeout(() => {
        setShowOnboarding(false)
        localStorage.setItem('onboardingCompleted', 'true')
      }, 1000)
    }
  }

  const skipOnboarding = () => {
    setShowOnboarding(false)
    localStorage.setItem('onboardingSkipped', 'true')
  }

  const progress = (completedSteps.size / steps.length) * 100

  if (!showOnboarding) return null

  const currentStepData = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
              <p className="text-gray-600">Step {currentStep + 1} of {steps.length}</p>
            </div>
            <button 
              onClick={skipOnboarding}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Skip setup
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                completedSteps.has(currentStepData.id) 
                  ? 'bg-green-100' 
                  : currentStepData.importance === 'critical' 
                    ? 'bg-red-100' 
                    : currentStepData.importance === 'important'
                      ? 'bg-yellow-100'
                      : 'bg-blue-100'
              }`}>
                {completedSteps.has(currentStepData.id) ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <span className={`text-sm font-semibold ${
                    currentStepData.importance === 'critical' 
                      ? 'text-red-600' 
                      : currentStepData.importance === 'important'
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                  }`}>
                    {currentStep + 1}
                  </span>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentStepData.description} • {currentStepData.estimatedTime}
                </p>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {currentStepData.component}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ← Previous
            </button>

            <div className="flex items-center space-x-3">
              {!completedSteps.has(currentStepData.id) && (
                <button 
                  onClick={() => completeStep(currentStepData.id)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>Mark Complete</span>
                  <CheckCircleIcon className="h-4 w-4" />
                </button>
              )}
              
              {currentStep < steps.length - 1 && (
                <button 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <PlayIcon className="h-4 w-4" />
              <span>Video Tutorial</span>
            </div>
            <div className="flex items-center space-x-1">
              <DocumentTextIcon className="h-4 w-4" />
              <span>Help Docs</span>
            </div>
            <div className="flex items-center space-x-1">
              <BellIcon className="h-4 w-4" />
              <span>Get Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 