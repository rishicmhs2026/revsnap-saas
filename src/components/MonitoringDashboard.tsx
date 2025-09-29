'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ServerIcon,
  CircleStackIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface MonitoringData {
  timestamp: string;
  system: {
    health: {
      overall: 'healthy' | 'degraded' | 'unhealthy';
      checks: Array<{
        name: string;
        status: 'healthy' | 'unhealthy' | 'degraded';
        responseTime: number;
        lastChecked: string;
        error?: string;
      }>;
    };
    metrics: {
      uptime: number;
      memoryUsage: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
      };
      cpuUsage: {
        user: number;
        system: number;
      };
    };
    uptimePercentage: number;
  };
  performance: {
    operations: {
      totalOperations: number;
      averageResponseTime: number;
      slowestOperations: Array<{
        operation: string;
        duration: number;
        timestamp: string;
      }>;
    };
    api: {
      totalRequests: number;
      averageResponseTime: number;
      requestsByMethod: Record<string, number>;
      requestsByStatusCode: Record<string, number>;
    };
    database: {
      totalOperations: number;
      averageQueryTime: number;
      operationsByTable: Record<string, number>;
      successRate: number;
    };
  };
  environment: {
    nodeEnv: string;
    databaseUrl: string;
    stripeConfigured: boolean;
    sentryConfigured: boolean;
    logRocketConfigured: boolean;
  };
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
}

export default function MonitoringDashboard() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMonitoringData = async () => {
    try {
      const response = await fetch('/api/admin/monitoring');
      if (!response.ok) {
        throw new Error('Failed to fetch monitoring data');
      }
      const data = await response.json();
      setMonitoringData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const clearMetrics = async () => {
    try {
      const response = await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-metrics' }),
      });
      
      if (response.ok) {
        fetchMonitoringData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to clear metrics:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy':
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'unhealthy':
      case 'down':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <XCircleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading monitoring data</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!monitoringData) {
    return <div>No monitoring data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(monitoringData.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded text-sm ${
              autoRefresh 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={clearMetrics}
            className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
          >
            Clear Metrics
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">System Status</p>
              <div className="flex items-center mt-1">
                {getStatusIcon(monitoringData.system.health.overall)}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(monitoringData.system.health.overall)}`}>
                  {monitoringData.system.health.overall}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Uptime</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatUptime(monitoringData.system.metrics.uptime)}
              </p>
              <p className="text-xs text-gray-500">
                {monitoringData.system.uptimePercentage.toFixed(2)}% availability
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Memory Usage</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatBytes(monitoringData.system.metrics.memoryUsage.heapUsed)}
              </p>
              <p className="text-xs text-gray-500">
                of {formatBytes(monitoringData.system.metrics.memoryUsage.heapTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <GlobeAltIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">API Requests</p>
              <p className="text-lg font-semibold text-gray-900">
                {monitoringData.performance.api.totalRequests}
              </p>
              <p className="text-xs text-gray-500">
                {monitoringData.performance.api.averageResponseTime.toFixed(0)}ms avg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Checks */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="text-lg font-medium text-gray-900">Health Checks</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monitoringData.system.health.checks.map((check) => (
              <div key={check.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {check.name.replace('-', ' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {check.responseTime}ms response time
                  </p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(check.status)}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                    {check.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Performance */}
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-medium text-gray-900">API Performance</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monitoringData.performance.api.totalRequests}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monitoringData.performance.api.averageResponseTime.toFixed(0)}ms
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Requests by Method</p>
              <div className="space-y-1">
                {Object.entries(monitoringData.performance.api.requestsByMethod).map(([method, count]) => (
                  <div key={method} className="flex justify-between text-sm">
                    <span className="text-gray-600">{method}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Database Performance */}
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-medium text-gray-900">Database Performance</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Operations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monitoringData.performance.database.totalOperations}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monitoringData.performance.database.successRate.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Avg Query Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {monitoringData.performance.database.averageQueryTime.toFixed(0)}ms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {monitoringData.alerts.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-medium text-gray-900">Active Alerts</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {monitoringData.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.level === 'error'
                      ? 'bg-red-50 border-red-400'
                      : alert.level === 'warning'
                      ? 'bg-yellow-50 border-yellow-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex">
                    {alert.level === 'error' && <XCircleIcon className="h-5 w-5 text-red-400" />}
                    {alert.level === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />}
                    {alert.level === 'info' && <CheckCircleIcon className="h-5 w-5 text-blue-400" />}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Environment Configuration */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="text-lg font-medium text-gray-900">Environment Configuration</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Environment</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {monitoringData.environment.nodeEnv}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Database</p>
              <p className="text-sm font-medium text-gray-900">
                {monitoringData.environment.databaseUrl}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stripe</p>
              <p className="text-sm font-medium text-gray-900">
                {monitoringData.environment.stripeConfigured ? 'Configured' : 'Not configured'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sentry</p>
              <p className="text-sm font-medium text-gray-900">
                {monitoringData.environment.sentryConfigured ? 'Configured' : 'Not configured'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">LogRocket</p>
              <p className="text-sm font-medium text-gray-900">
                {monitoringData.environment.logRocketConfigured ? 'Configured' : 'Not configured'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 