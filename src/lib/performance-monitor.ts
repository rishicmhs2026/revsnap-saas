import { logPerformance, logApiRequest, logDatabaseOperation } from './logger';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ApiMetrics {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  userId?: string;
  timestamp: Date;
}

export interface DatabaseMetrics {
  operation: string;
  table: string;
  duration: number;
  success: boolean;
  timestamp: Date;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private apiMetrics: ApiMetrics[] = [];
  private dbMetrics: DatabaseMetrics[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.ENABLE_PERFORMANCE_MONITORING === 'true';
  }

  // Track generic performance operations
  trackOperation(operation: string, fn: () => Promise<any> | any, context?: Record<string, any>): Promise<any> {
    if (!this.isEnabled) {
      return Promise.resolve(fn());
    }

    const startTime = Date.now();
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = Date.now() - startTime;
          this.recordPerformance(operation, duration, context);
        });
      } else {
        const duration = Date.now() - startTime;
        this.recordPerformance(operation, duration, context);
        return Promise.resolve(result);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordPerformance(operation, duration, { ...context, error: true });
      throw error;
    }
  }

  // Track API requests
  trackApiRequest(method: string, url: string, statusCode: number, duration: number, userId?: string) {
    if (!this.isEnabled) return;

    const metric: ApiMetrics = {
      method,
      url,
      statusCode,
      duration,
      userId,
      timestamp: new Date(),
    };

    this.apiMetrics.push(metric);
    logApiRequest(method, url, statusCode, duration, userId);

    // Keep only last 1000 API metrics
    if (this.apiMetrics.length > 1000) {
      this.apiMetrics = this.apiMetrics.slice(-1000);
    }
  }

  // Track database operations
  trackDatabaseOperation(operation: string, table: string, duration: number, success: boolean) {
    if (!this.isEnabled) return;

    const metric: DatabaseMetrics = {
      operation,
      table,
      duration,
      success,
      timestamp: new Date(),
    };

    this.dbMetrics.push(metric);
    logDatabaseOperation(operation, table, duration, success);

    // Keep only last 1000 DB metrics
    if (this.dbMetrics.length > 1000) {
      this.dbMetrics = this.dbMetrics.slice(-1000);
    }
  }

  // Record performance metric
  private recordPerformance(operation: string, duration: number, context?: Record<string, any>) {
    const metric: PerformanceMetrics = {
      operation,
      duration,
      timestamp: new Date(),
      context,
    };

    this.metrics.push(metric);
    logPerformance(operation, duration, context);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Get performance statistics
  getPerformanceStats(): {
    totalOperations: number;
    averageResponseTime: number;
    slowestOperations: PerformanceMetrics[];
    fastestOperations: PerformanceMetrics[];
  } {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        averageResponseTime: 0,
        slowestOperations: [],
        fastestOperations: [],
      };
    }

    const totalDuration = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
    const averageResponseTime = totalDuration / this.metrics.length;

    const sortedMetrics = [...this.metrics].sort((a, b) => b.duration - a.duration);
    const slowestOperations = sortedMetrics.slice(0, 10);
    const fastestOperations = sortedMetrics.slice(-10).reverse();

    return {
      totalOperations: this.metrics.length,
      averageResponseTime,
      slowestOperations,
      fastestOperations,
    };
  }

  // Get API statistics
  getApiStats(): {
    totalRequests: number;
    averageResponseTime: number;
    requestsByMethod: Record<string, number>;
    requestsByStatusCode: Record<string, number>;
    slowestEndpoints: ApiMetrics[];
  } {
    if (this.apiMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        requestsByMethod: {},
        requestsByStatusCode: {},
        slowestEndpoints: [],
      };
    }

    const totalDuration = this.apiMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    const averageResponseTime = totalDuration / this.apiMetrics.length;

    const requestsByMethod: Record<string, number> = {};
    const requestsByStatusCode: Record<string, number> = {};

    this.apiMetrics.forEach(metric => {
      requestsByMethod[metric.method] = (requestsByMethod[metric.method] || 0) + 1;
      requestsByStatusCode[metric.statusCode.toString()] = (requestsByStatusCode[metric.statusCode.toString()] || 0) + 1;
    });

    const sortedApiMetrics = [...this.apiMetrics].sort((a, b) => b.duration - a.duration);
    const slowestEndpoints = sortedApiMetrics.slice(0, 10);

    return {
      totalRequests: this.apiMetrics.length,
      averageResponseTime,
      requestsByMethod,
      requestsByStatusCode,
      slowestEndpoints,
    };
  }

  // Get database statistics
  getDatabaseStats(): {
    totalOperations: number;
    averageQueryTime: number;
    operationsByTable: Record<string, number>;
    successRate: number;
    slowestQueries: DatabaseMetrics[];
  } {
    if (this.dbMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageQueryTime: 0,
        operationsByTable: {},
        successRate: 0,
        slowestQueries: [],
      };
    }

    const totalDuration = this.dbMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    const averageQueryTime = totalDuration / this.dbMetrics.length;

    const operationsByTable: Record<string, number> = {};
    const successfulOperations = this.dbMetrics.filter(metric => metric.success).length;
    const successRate = (successfulOperations / this.dbMetrics.length) * 100;

    this.dbMetrics.forEach(metric => {
      operationsByTable[metric.table] = (operationsByTable[metric.table] || 0) + 1;
    });

    const sortedDbMetrics = [...this.dbMetrics].sort((a, b) => b.duration - a.duration);
    const slowestQueries = sortedDbMetrics.slice(0, 10);

    return {
      totalOperations: this.dbMetrics.length,
      averageQueryTime,
      operationsByTable,
      successRate,
      slowestQueries,
    };
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = [];
    this.apiMetrics = [];
    this.dbMetrics = [];
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Decorator for tracking function performance
export function trackPerformance(operation: string, context?: Record<string, any>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.trackOperation(
        `${target.constructor.name}.${propertyName}`,
        () => method.apply(this, args),
        context
      );
    };
  };
}

// Middleware for tracking API performance
export function apiPerformanceMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function (body: any) {
      const duration = Date.now() - startTime;
      performanceMonitor.trackApiRequest(
        req.method,
        req.url,
        res.statusCode,
        duration,
        req.user?.id
      );
      return originalSend.call(this, body);
    };

    next();
  };
} 