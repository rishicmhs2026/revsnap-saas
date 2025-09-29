// Jest test setup file for RevSnap
import { jest } from '@jest/globals'

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.SHOPIFY_WEBHOOK_SECRET = 'test-webhook-secret'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>

// Mock Response constructor
global.Response = class extends Response {
  constructor(body?: any, init?: ResponseInit) {
    if (typeof body === 'string') {
      super(body, init)
    } else {
      super(JSON.stringify(body), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers
        }
      })
    }
  }
}

// Setup timezone for consistent date testing
process.env.TZ = 'UTC'

// Mock crypto for Node.js environments that don't have it
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => 'mocked-uuid-' + Date.now(),
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }
  } as any
}

// Mock window object for browser-specific code
if (typeof window === 'undefined') {
  global.window = {} as any;
}

Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })
}

// Mock sessionStorage
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
  })
}

// Setup test database connection mock
(jest as any).mock('../src/lib/prisma', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    organization: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }
}))

// Global test utilities
(global as any).testUtils = {
  createMockRequest: (url: string, options: RequestInit = {}) => {
    return new Request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      ...options
    })
  },
  
  createMockResponse: (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
}

// Cleanup after each test
if (typeof global !== 'undefined' && (global as any).afterEach) {
  (global as any).afterEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })
}

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
}) 