/**
 * Test utilities for unit and integration testing
 */

import { AnalysisResult } from '../types';

/**
 * Mock successful API response
 */
export function mockApiSuccess<T>(data: T) {
  return {
    data,
    error: null,
    statusCode: 200,
    loading: false
  };
}

/**
 * Mock failed API response
 */
export function mockApiError(message: string, statusCode: number = 400) {
  return {
    data: null,
    error: new Error(message),
    statusCode,
    loading: false
  };
}

/**
 * Mock loading API response
 */
export function mockApiLoading() {
  return {
    data: null,
    error: null,
    statusCode: null,
    loading: true
  };
}

/**
 * Create a mock X-ray file for testing
 */
export function createMockXrayFile(name = 'test-xray.jpg'): File {
  return new File(['mock-xray-data'], name, { type: 'image/jpeg' });
}

/**
 * Mock successful analysis result
 */
export function mockAnalysisResult(): AnalysisResult {
  return {
    success: true,
    data: {
      topPrediction: {
        label: "Test Condition",
        confidence: 0.95
      },
      predictions: [
        { label: "Test Condition", confidence: 0.95 },
        { label: "Secondary Condition", confidence: 0.45 },
        { label: "Normal", confidence: 0.05 }
      ],
      heatmapUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      severity: "Moderate",
      diagnosisWithVitals: "Test diagnosis with vitals",
      treatmentSuggestions: [
        "Test suggestion 1",
        "Test suggestion 2",
        "Test suggestion 3"
      ]
    }
  };
}

/**
 * Setup localStorage mocks for testing
 */
export function setupLocalStorageMock() {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
      length: 0,
      key: (index: number) => Object.keys(store)[index] || null,
    };
  })();
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  
  return localStorageMock;
}

/**
 * Setup mock auth state for testing authenticated components
 */
export function setupAuthMock(isAuthenticated = true) {
  if (isAuthenticated) {
    const mockUser = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    const mockTokens = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token'
    };
    
    localStorage.setItem('authTokens', JSON.stringify(mockTokens));
    localStorage.setItem('userData', JSON.stringify(mockUser));
  } else {
    localStorage.removeItem('authTokens');
    localStorage.removeItem('userData');
  }
}

/**
 * Setup mock demo mode for testing
 */
export function setupDemoModeMock(enabled = true) {
  if (enabled) {
    localStorage.setItem('forceDemoMode', 'true');
  } else {
    localStorage.removeItem('forceDemoMode');
  }
}

/**
 * Reset all mocks between tests
 */
export function resetMocks() {
  localStorage.clear();
  jest.clearAllMocks();
}