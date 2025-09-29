'use client'

import { useState, useEffect } from 'react'
import { 
  QuestionMarkCircleIcon,
  XMarkIcon,
  PlayCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftIcon,
  LightBulbIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface HelpArticle {
  id: string
  title: string
  description: string
  category: 'getting-started' | 'features' | 'pricing' | 'integrations' | 'troubleshooting'
  readTime: string
  popularity: number
  tags: string[]
}

interface VideoTutorial {
  id: string
  title: string
  duration: string
  thumbnail: string
  category: string
  views: number
}

export default function InAppHelpSystem() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'help' | 'tutorials' | 'support'>('help')
  const [searchQuery, setSearchQuery] = useState('')
  const [showTooltips, setShowTooltips] = useState(false)

  const helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with RevSnap',
      description: 'Learn the basics of setting up competitor tracking',
      category: 'getting-started',
      readTime: '3 min',
      popularity: 95,
      tags: ['basics', 'setup', 'onboarding']
    },
    {
      id: '2',
      title: 'Understanding Price Alerts',
      description: 'How to set up and customize pricing alerts',
      category: 'features',
      readTime: '2 min',
      popularity: 88,
      tags: ['alerts', 'notifications', 'pricing']
    },
    {
      id: '3',
      title: 'CSV Upload Guide',
      description: 'Bulk upload products using CSV files',
      category: 'features',
      readTime: '4 min',
      popularity: 82,
      tags: ['csv', 'bulk', 'import']
    },
    {
      id: '4',
      title: 'Plan Limits and Upgrades',
      description: 'Understanding your plan features and upgrade options',
      category: 'pricing',
      readTime: '3 min',
      popularity: 75,
      tags: ['plans', 'limits', 'upgrade']
    },
    {
      id: '5',
      title: 'Connecting Shopify Store',
      description: 'Integrate RevSnap with your Shopify store',
      category: 'integrations',
      readTime: '5 min',
      popularity: 90,
      tags: ['shopify', 'integration', 'ecommerce']
    },
    {
      id: '6',
      title: 'Troubleshooting Common Issues',
      description: 'Solutions to frequently encountered problems',
      category: 'troubleshooting',
      readTime: '6 min',
      popularity: 70,
      tags: ['problems', 'fixes', 'support']
    }
  ]

  const videoTutorials: VideoTutorial[] = [
    {
      id: '1',
      title: 'RevSnap Overview - 2 Minute Tour',
      duration: '2:15',
      thumbnail: '/placeholder-video.jpg',
      category: 'Overview',
      views: 1205
    },
    {
      id: '2',
      title: 'Setting Up Your First Product',
      duration: '3:42',
      thumbnail: '/placeholder-video.jpg',
      category: 'Getting Started',
      views: 967
    },
    {
      id: '3',
      title: 'Advanced Analytics Deep Dive',
      duration: '5:28',
      thumbnail: '/placeholder-video.jpg',
      category: 'Analytics',
      views: 743
    },
    {
      id: '4',
      title: 'Pricing Strategy Best Practices',
      duration: '4:16',
      thumbnail: '/placeholder-video.jpg',
      category: 'Strategy',
      views: 892
    }
  ]

  const filteredArticles = helpArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const categoryColors = {
    'getting-started': 'bg-green-100 text-green-800',
    'features': 'bg-blue-100 text-blue-800',
    'pricing': 'bg-purple-100 text-purple-800',
    'integrations': 'bg-orange-100 text-orange-800',
    'troubleshooting': 'bg-red-100 text-red-800'
  }

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        title="Get Help"
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
      </button>

      {/* Feature Discovery Tooltips Toggle */}
      <button
        onClick={() => setShowTooltips(!showTooltips)}
        className="fixed bottom-20 right-6 bg-yellow-500 text-white p-2 rounded-full shadow-lg hover:bg-yellow-600 transition-colors z-40"
        title="Toggle Feature Tips"
      >
        <LightBulbIcon className="h-5 w-5" />
      </button>

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">RevSnap Help Center</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'help', label: 'Help Articles', icon: BookOpenIcon },
                  { id: 'tutorials', label: 'Video Tutorials', icon: PlayCircleIcon },
                  { id: 'support', label: 'Contact Support', icon: ChatBubbleLeftIcon }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'help' && (
                <div className="p-6 h-full flex flex-col">
                  {/* Search */}
                  <div className="relative mb-6">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search help articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Popular Articles */}
                  {!searchQuery && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Popular Articles</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {helpArticles
                          .sort((a, b) => b.popularity - a.popularity)
                          .slice(0, 4)
                          .map(article => (
                            <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{article.title}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[article.category]}`}>
                                  {article.category.replace('-', ' ')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{article.readTime} read</span>
                                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* All Articles */}
                  <div className="flex-1 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {searchQuery ? `Search Results (${filteredArticles.length})` : 'All Articles'}
                    </h3>
                    <div className="space-y-3">
                      {filteredArticles.map(article => (
                        <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{article.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[article.category]}`}>
                              {article.category.replace('-', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{article.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-gray-500">{article.readTime} read</span>
                              <div className="flex space-x-1">
                                {article.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tutorials' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Video Tutorials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {videoTutorials.map(video => (
                      <div key={video.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 cursor-pointer transition-colors">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                          <PlayCircleIcon className="h-12 w-12 text-blue-600" />
                          <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            {video.duration}
                          </span>
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-1">{video.title}</h4>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{video.category}</span>
                            <span>{video.views.toLocaleString()} views</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'support' && (
                <div className="p-6">
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Support</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="border border-gray-200 rounded-lg p-6 text-center">
                        <ChatBubbleLeftIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900 mb-2">Live Chat</h4>
                        <p className="text-sm text-gray-600 mb-4">Get instant help from our support team</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Start Chat
                        </button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-6 text-center">
                        <BookOpenIcon className="h-8 w-8 text-green-600 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900 mb-2">Email Support</h4>
                        <p className="text-sm text-gray-600 mb-4">Send us a detailed message</p>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                          Send Email
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">Support Hours</h5>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>Monday - Friday: 9 AM - 6 PM EST</p>
                        <p>Saturday: 10 AM - 4 PM EST</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feature Discovery Tooltips */}
      {showTooltips && (
        <div className="fixed inset-0 pointer-events-none z-30">
          {/* Example tooltips that would be positioned dynamically */}
          <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-2 rounded-lg shadow-lg max-w-xs">
            <p className="text-sm">💡 <strong>Tip:</strong> Click here to add your first product and start tracking competitors!</p>
          </div>
        </div>
      )}
    </>
  )
} 