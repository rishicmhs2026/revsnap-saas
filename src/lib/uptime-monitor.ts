import { logInfo, logError, logWarn } from './logger';

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

export interface ServiceStatus {
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  lastChecked: Date;
  uptime: number; // percentage
  totalChecks: number;
  failedChecks: number;
}

class UptimeMonitor {
  private services: Map<string, ServiceStatus> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.ENABLE_UPTIME_MONITORING === 'true';
    this.initializeDefaultChecks();
  }

  private initializeDefaultChecks() {
    // Add default health checks
    this.addHealthCheck('database', this.checkDatabaseHealth.bind(this));
    this.addHealthCheck('api', this.checkApiHealth.bind(this));
    this.addHealthCheck('external-apis', this.checkExternalApisHealth.bind(this));
  }

  // Add a new service to monitor
  addService(name: string, url: string): void {
    if (!this.isEnabled) return;

    this.services.set(name, {
      name,
      url,
      status: 'up',
      responseTime: 0,
      lastChecked: new Date(),
      uptime: 100,
      totalChecks: 0,
      failedChecks: 0,
    });

    logInfo(`Added service to uptime monitoring: ${name}`, { url });
  }

  // Add a custom health check
  addHealthCheck(name: string, checkFunction: () => Promise<boolean>): void {
    if (!this.isEnabled) return;

    this.healthChecks.set(name, {
      name,
      status: 'healthy',
      responseTime: 0,
      lastChecked: new Date(),
    });

    logInfo(`Added health check: ${name}`);
  }

  // Start monitoring
  startMonitoring(intervalMs: number = 60000): void {
    if (!this.isEnabled || this.checkInterval) return;

    logInfo('Starting uptime monitoring', { intervalMs });
    
    this.checkInterval = setInterval(() => {
      this.performHealthChecks();
    }, intervalMs);

    // Perform initial check
    this.performHealthChecks();
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logInfo('Stopped uptime monitoring');
    }
  }

  // Perform all health checks
  private async performHealthChecks(): Promise<void> {
    const checkPromises = Array.from(this.healthChecks.keys()).map(name =>
      this.performHealthCheck(name)
    );

    await Promise.allSettled(checkPromises);
  }

  // Perform a specific health check
  private async performHealthCheck(name: string): Promise<void> {
    const healthCheck = this.healthChecks.get(name);
    if (!healthCheck) return;

    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      switch (name) {
        case 'database':
          success = await this.checkDatabaseHealth();
          break;
        case 'api':
          success = await this.checkApiHealth();
          break;
        case 'external-apis':
          success = await this.checkExternalApisHealth();
          break;
        default:
          success = true; // Default to success for unknown checks
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      success = false;
    }

    const responseTime = Date.now() - startTime;
    const status = success ? 'healthy' : 'unhealthy';

    // Update health check status
    healthCheck.status = status;
    healthCheck.responseTime = responseTime;
    healthCheck.lastChecked = new Date();
    healthCheck.error = error;

    // Log the result
    if (success) {
      logInfo(`Health check passed: ${name}`, { responseTime });
    } else {
      logError(new Error(`Health check failed: ${name}`), { 
        responseTime, 
        error 
      });
    }
  }

  // Database health check
  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      const { prisma } = await import('./prisma');
      
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      await prisma.$disconnect();
      
      // Consider degraded if response time is too high
      if (responseTime > 1000) {
        logWarn('Database health check: degraded performance', { responseTime });
        return false;
      }
      
      return true;
    } catch (error) {
      logError(new Error('Database health check failed'), { error });
      return false;
    }
  }

  // API health check
  private async checkApiHealth(): Promise<boolean> {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`API health check failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      logError(new Error('API health check failed'), { error });
      return false;
    }
  }

  // External APIs health check
  private async checkExternalApisHealth(): Promise<boolean> {
    const checks = [];

    // Check Stripe API
    if (process.env.STRIPE_SECRET_KEY) {
      checks.push(this.checkStripeHealth());
    }

    // Check other external APIs as needed
    // checks.push(this.checkRainforestApiHealth());

    if (checks.length === 0) {
      return true; // No external APIs to check
    }

    const results = await Promise.allSettled(checks);
    const successfulChecks = results.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length;

    return successfulChecks === checks.length;
  }

  // Stripe API health check
  private async checkStripeHealth(): Promise<boolean> {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      await stripe.balance.retrieve();
      return true;
    } catch (error) {
      logError(new Error('Stripe API health check failed'), { error });
      return false;
    }
  }

  // Get overall system health
  getSystemHealth(): {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthCheck[];
    services: ServiceStatus[];
  } {
    const checks = Array.from(this.healthChecks.values());
    const services = Array.from(this.services.values());

    const healthyChecks = checks.filter(check => check.status === 'healthy').length;
    const totalChecks = checks.length;

    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (totalChecks === 0) {
      overall = 'healthy';
    } else if (healthyChecks === totalChecks) {
      overall = 'healthy';
    } else if (healthyChecks > totalChecks * 0.5) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    return {
      overall,
      checks,
      services,
    };
  }

  // Get specific health check status
  getHealthCheckStatus(name: string): HealthCheck | null {
    return this.healthChecks.get(name) || null;
  }

  // Get service status
  getServiceStatus(name: string): ServiceStatus | null {
    return this.services.get(name) || null;
  }

  // Manual health check trigger
  async triggerHealthCheck(name: string): Promise<HealthCheck | null> {
    if (!this.healthChecks.has(name)) {
      logWarn(`Health check not found: ${name}`);
      return null;
    }

    await this.performHealthCheck(name);
    return this.getHealthCheckStatus(name);
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }
  }
}

// Create singleton instance
export const uptimeMonitor = new UptimeMonitor();

// Export for use in other modules
export default uptimeMonitor; 