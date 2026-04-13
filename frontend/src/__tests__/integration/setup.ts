/**
 * Frontend Integration Test Setup
 * 
 * Configures the test environment for integration tests.
 */

import '@testing-library/jest-dom';

// Set longer timeout for API calls
jest.setTimeout(30000);

// Mock console methods to reduce noise during tests
// but keep errors visible
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Filter out expected warnings but keep important ones
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    // Only log test-related messages
    if (message.includes('✅') || message.includes('❌') || message.includes('🚀')) {
      originalConsoleLog.apply(console, args);
    }
  };

  console.error = (...args: any[]) => {
    // Always show errors
    originalConsoleError.apply(console, args);
  };
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Global test utilities
global.TEST_HELPERS = {
  /**
   * Wait for a specified duration
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate unique test event title
   */
  generateTestTitle: (suffix?: string) => {
    return `Frontend IT ${suffix || 'Test'} - ${new Date().toISOString()}`;
  },

  /**
   * Check if backend is running
   */
  isBackendRunning: async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidEvent(): R;
    }
  }
}

// Custom matcher for event validation
expect.extend({
  toBeValidEvent(received: any) {
    const hasId = received && typeof received.id === 'string';
    const hasTitle = received && typeof received.title === 'string';
    const hasDescription = received && typeof received.description === 'string';
    
    if (hasId && hasTitle && hasDescription) {
      return {
        message: () => `expected ${received} not to be a valid event`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid event with id, title, and description`,
        pass: false,
      };
    }
  },
});
