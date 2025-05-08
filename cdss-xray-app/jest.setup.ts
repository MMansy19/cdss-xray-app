// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import React from 'react';

// Suppress console warnings during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = (...args) => {
    // Check if this is a React internal warning/error that we want to ignore during tests
    const message = args.join(' ');
    if (
      message.includes('Warning:') ||
      message.includes('Error:') ||
      message.includes('DEMO_MODE_ENABLED') ||
      message.includes('not wrapped in act')
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    // Suppress warnings during tests
    if (args[0]?.includes?.('Warning:')) {
      return;
    }
    originalConsoleWarn(...args);
  };

  console.log = (...args) => {
    // Suppress logs related to demo mode or API calls during tests
    const message = args.join(' ');
    if (
      message.includes('DEMO_MODE_ENABLED') ||
      message.includes('API Request:') ||
      message.includes('API Response:') ||
      message.includes('User logged')
    ) {
      return;
    }
    originalConsoleLog(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: jest.fn().mockReturnValue('/'),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', props);
  },
}));

// Mock the environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_API_URL: 'http://localhost:8000',
  NEXT_PUBLIC_DEMO_MODE: 'false'
};

// Mock the window.matchMedia function for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback: any) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  callback: any;
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback: any) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  callback: any;
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock localStorage and sessionStorage
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true
  });
}

// Global test cleanup
afterEach(() => {
  jest.clearAllMocks();
});