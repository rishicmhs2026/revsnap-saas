'use client';

import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  PlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  EyeIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';
import Button from './Button';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  recipients: EmailRecipient[];
  metrics: EmailMetrics[];
}

interface EmailRecipient {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
}

interface EmailMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

interface EmailMarketingDashboardProps {
  organizationId: string;
}

export default function EmailMarketingDashboard({ organizationId }: EmailMarketingDashboardProps) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);

  // Form state for creating campaigns
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    template: '',
    scheduledAt: '',
    recipients: [] as string[],
  });

  useEffect(() => {
    fetchCampaigns();
  }, [organizationId]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`/api/marketing/email-campaigns?organizationId=${organizationId}`);
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/marketing/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          organizationId,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ name: '', subject: '', content: '', template: '', scheduledAt: '', recipients: [] });
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/marketing/email-campaigns/${campaignId}/send`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to send campaign:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return '📝';
      case 'scheduled': return '⏰';
      case 'sent': return '✅';
      case 'paused': return '⏸️';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Marketing</h2>
          <p className="text-gray-600">Create and manage email campaigns</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <EnvelopeIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Recipients</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.reduce((sum, campaign) => sum + campaign.recipients.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length > 0 
                  ? Math.round(campaigns.reduce((sum, campaign) => {
                      const metrics = campaign.metrics[0];
                      return sum + (metrics ? (metrics.opened / metrics.sent) * 100 : 0);
                    }, 0) / campaigns.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CursorArrowRaysIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Click Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length > 0 
                  ? Math.round(campaigns.reduce((sum, campaign) => {
                      const metrics = campaign.metrics[0];
                      return sum + (metrics ? (metrics.clicked / metrics.sent) * 100 : 0);
                    }, 0) / campaigns.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Campaigns</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {campaigns.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No campaigns yet. Create your first campaign to get started.</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getStatusIcon(campaign.status)}</span>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{campaign.name}</h4>
                      <p className="text-sm text-gray-500">{campaign.subject}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {campaign.recipients.length} recipients
                        </span>
                        {campaign.metrics[0] && (
                          <span className="text-xs text-gray-500">
                            {Math.round((campaign.metrics[0].opened / campaign.metrics[0].sent) * 100)}% open rate
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {campaign.status === 'draft' && (
                      <Button size="sm" onClick={() => sendCampaign(campaign.id)}>
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setSelectedCampaign(campaign)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Email Campaign</h3>
              <form onSubmit={createCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject Line</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Schedule (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Create Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Campaign Details</h3>
                <button onClick={() => setSelectedCampaign(null)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedCampaign.name}</h4>
                  <p className="text-sm text-gray-500">{selectedCampaign.subject}</p>
                </div>
                {selectedCampaign.metrics[0] && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedCampaign.metrics[0].sent}</p>
                      <p className="text-xs text-gray-500">Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedCampaign.metrics[0].opened}</p>
                      <p className="text-xs text-gray-500">Opened</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedCampaign.metrics[0].clicked}</p>
                      <p className="text-xs text-gray-500">Clicked</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{selectedCampaign.metrics[0].bounced}</p>
                      <p className="text-xs text-gray-500">Bounced</p>
                    </div>
                  </div>
                )}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Recipients</h5>
                  <div className="max-h-32 overflow-y-auto">
                    {selectedCampaign.recipients.map((recipient) => (
                      <div key={recipient.id} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">{recipient.email}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          recipient.status === 'subscribed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {recipient.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 