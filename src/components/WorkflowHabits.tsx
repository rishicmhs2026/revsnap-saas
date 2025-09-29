'use client'

import { useState, useEffect } from 'react'
import { 
  ClockIcon, 
  ChartBarIcon, 
  BellIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface DailyInsight {
  id: string
  type: 'opportunity' | 'alert' | 'milestone' | 'trend'
  title: string
  description: string
  value: string
  action: string
  priority: 'high' | 'medium' | 'low'
  isNew: boolean
}

interface HabitMetrics {
  streak: number
  totalInsights: number
  actionsCompleted: number
  profitImpact: number
}

export default function WorkflowHabits() {
  // Clean empty state - no fake insights
  const hasProducts = false // You can pass this as a prop later

  if (!hasProducts) {
    return (
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            Daily Insights & Workflow
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Get personalized daily insights, price alerts, and optimization recommendations once you start tracking products.
          </p>
          <div className="inline-flex items-center text-sm text-purple-300 bg-purple-900/30 px-4 py-2 rounded-full border border-purple-700/50">
            <ClockIcon className="w-4 h-4 mr-2" />
            Updates every 24 hours
          </div>
        </div>
      </div>
    )
  }

  return null // Show real insights when there are products
} 