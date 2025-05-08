import { apiRequest } from '../apiClient';
import { setupLocalStorageMock, setupAuthMock, resetMocks, setupDemoModeMock } from '../testUtils';
import * as mockService from '../mockService';

// Mock the mockService's isDemoMode and isDemoModeSync functions
jest.mock('../mockService', () => ({
  isDemoMode: jest.fn().mockResolvedValue(false),
  isDemoModeSync: jest.fn().mockReturnValue(false)
}));

// Mock the forceEnableDemoMode function
jest.mock('../backendDetection', () => ({
  forceEnableDemoMode: jest.fn()
}));

describe('apiClient', () => {
  let originalFetch: typeof fetch;
  
  beforeAll(() => {
    // Save the original fetch implementation
    originalFetch = global.fetch;
    // Create a localStorage mock
    setupLocalStorageMock();
  });
  
  beforeEach(() => {
    // Reset all mocks before each test
    resetMocks();
    // Mock fetch by default
    global.fetch = jest.fn();
  });
  
  afterAll(() => {
    // Restore the original fetch implementation
    global.fetch = originalFetch;
  });
  
  it('should make a successful API request', async () => {
    // Set up auth mock
    setupAuthMock(true);
    
    // Mock a successful fetch response
    const mockResponse = { data: { message: 'Success' } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json'
      }),
      json: jest.fn().mockResolvedValueOnce(mockResponse)
    });
    
    // Make the API request
    const result = await apiRequest({
      endpoint: '/test-endpoint',
      method: 'GET'
    });
    
    // Verify the result
    expect(result.data).toEqual(mockResponse);
    expect(result.error).toBeNull();
    expect(result.statusCode).toBe(200);
    expect(result.loading).toBe(false);
    
    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/test-endpoint',
      expect.objectContaining({
        method: 'GET',
        headers: expect.any(Headers),
      })
    );
  });
  
  it('should handle API errors properly', async () => {
    // Set up auth mock
    setupAuthMock(true);
    
    // Mock a failed fetch response
    const errorData = { error: 'Invalid request' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({
        'content-type': 'application/json'
      }),
      json: jest.fn().mockResolvedValueOnce(errorData)
    });
    
    // Make the API request
    const result = await apiRequest({
      endpoint: '/test-endpoint',
      method: 'POST',
      body: { test: 'data' }
    });
    
    // Verify the result
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('API error: 400');
    expect(result.statusCode).toBe(400);
    
    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/test-endpoint',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: expect.any(Headers),
      })
    );
  });
  
  it('should not make API requests when in demo mode', async () => {
    // Enable demo mode
    (mockService.isDemoModeSync as jest.Mock).mockReturnValueOnce(true);
    
    // Make the API request
    try {
      await apiRequest({
        endpoint: '/test-endpoint',
        method: 'GET'
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toBe('DEMO_MODE_ENABLED');
    }
    
    // Verify fetch was NOT called
    expect(global.fetch).not.toHaveBeenCalled();
  });
  
  it('should include auth token when requiresAuth is true', async () => {
    // Set up auth mock with a token
    setupAuthMock(true);
    
    // Mock a successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json'
      }),
      json: jest.fn().mockResolvedValueOnce({})
    });
    
    // Make the API request
    await apiRequest({
      endpoint: '/auth-required',
      method: 'GET',
      requiresAuth: true
    });
    
    // Get the Headers object from the fetch call
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const options = fetchCall[1];
    const authHeader = options.headers.get('Authorization');
    
    // Verify auth header was included
    expect(authHeader).toBe('Bearer mock-access-token');
  });
  
  it('should not include auth token when requiresAuth is false', async () => {
    // Set up auth mock with a token
    setupAuthMock(true);
    
    // Mock a successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json'
      }),
      json: jest.fn().mockResolvedValueOnce({})
    });
    
    // Make the API request
    await apiRequest({
      endpoint: '/no-auth-required',
      method: 'GET',
      requiresAuth: false
    });
    
    // Get the Headers object from the fetch call
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const options = fetchCall[1];
    const authHeader = options.headers.get('Authorization');
    
    // Verify auth header was NOT included
    expect(authHeader).toBeNull();
  });
  
  it('should handle network errors and retry', async () => {
    // Set up auth mock
    setupAuthMock(true);
    
    // Mock a network error on first call, then success on retry
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json'
        }),
        json: jest.fn().mockResolvedValueOnce({ data: 'success after retry' })
      });
    
    // Make the API request with retries
    const result = await apiRequest({
      endpoint: '/test-retry',
      method: 'GET',
      retries: 1
    });
    
    // Verify the result after retry
    expect(result.data).toEqual({ data: 'success after retry' });
    expect(result.error).toBeNull();
    
    // Verify fetch was called twice (original + retry)
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});