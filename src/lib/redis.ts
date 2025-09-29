import { Redis } from 'ioredis';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
  keepAlive: 30000,
  family: 4, // IPv4
  keyPrefix: 'revsnap:',
};

// Create Redis client
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : new Redis(redisConfig);

// Handle Redis events
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (error: Error) => {
  console.error('❌ Redis connection error:', error);
});

redis.on('close', () => {
  console.log('🔌 Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Health check function
export async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

// Cache functions
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttl?: number): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
}

export async function clearCache(pattern: string = '*'): Promise<void> {
  try {
    const keys = await redis.keys(`revsnap:${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis clear error:', error);
  }
}

// Session store functions
export async function getSession(sessionId: string): Promise<any | null> {
  return getCache(`session:${sessionId}`);
}

export async function setSession(sessionId: string, data: any, ttl: number = 86400): Promise<void> {
  return setCache(`session:${sessionId}`, data, ttl);
}

export async function deleteSession(sessionId: string): Promise<void> {
  return deleteCache(`session:${sessionId}`);
}

// Rate limiting functions
export async function checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, window);
    }
    return current <= limit;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow request if Redis fails
  }
}

// Job queue functions
export async function addToQueue(queueName: string, job: any): Promise<void> {
  try {
    await redis.lpush(`queue:${queueName}`, JSON.stringify(job));
  } catch (error) {
    console.error('Add to queue error:', error);
  }
}

export async function getFromQueue(queueName: string): Promise<any | null> {
  try {
    const job = await redis.rpop(`queue:${queueName}`);
    return job ? JSON.parse(job) : null;
  } catch (error) {
    console.error('Get from queue error:', error);
    return null;
  }
}

// Analytics cache functions
export async function cacheAnalytics(key: string, data: any, ttl: number = 3600): Promise<void> {
  return setCache(`analytics:${key}`, data, ttl);
}

export async function getCachedAnalytics(key: string): Promise<any | null> {
  return getCache(`analytics:${key}`);
}

// Competitor tracking cache
export async function cacheCompetitorData(productId: string, competitor: string, data: any): Promise<void> {
  const key = `competitor:${productId}:${competitor}`;
  return setCache(key, data, 1800); // 30 minutes TTL
}

export async function getCachedCompetitorData(productId: string, competitor: string): Promise<any | null> {
  const key = `competitor:${productId}:${competitor}`;
  return getCache(key);
}

// User preferences cache
export async function cacheUserPreferences(userId: string, preferences: any): Promise<void> {
  const key = `preferences:${userId}`;
  return setCache(key, preferences, 3600); // 1 hour TTL
}

export async function getCachedUserPreferences(userId: string): Promise<any | null> {
  const key = `preferences:${userId}`;
  return getCache(key);
}

// API response cache
export async function cacheApiResponse(endpoint: string, params: any, response: any, ttl: number = 300): Promise<void> {
  const key = `api:${endpoint}:${JSON.stringify(params)}`;
  return setCache(key, response, ttl);
}

export async function getCachedApiResponse(endpoint: string, params: any): Promise<any | null> {
  const key = `api:${endpoint}:${JSON.stringify(params)}`;
  return getCache(key);
}

// Close Redis connection (for graceful shutdown)
export async function closeRedis(): Promise<void> {
  try {
    await redis.quit();
    console.log('Redis connection closed gracefully');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
}

export default redis; 