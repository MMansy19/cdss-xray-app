import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../useAuth';
import { setupLocalStorageMock } from '@/utils/testUtils';
import * as apiClient from '@/utils/apiClient';

// Mock dependencies
jest.mock('@/utils/apiClient');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('useAuth', () => {
  beforeAll(() => {
    // Setup localStorage mock
    setupLocalStorageMock();
  });
  
  beforeEach(() => {
    // Clear localStorage and mocks before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );
  
  it('initializes with no user when not logged in', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Initially loading
    expect(result.current.loading).toBe(true);
    
    // Wait for the auth check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Should have no user
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticatedUser).toBe(false);
  });
  
  it('initializes with user when auth token exists in localStorage', async () => {
    // Set up mock user and tokens in localStorage
    const mockUser = { id: 'test-id', username: 'testuser' };
    const mockTokens = { access_token: 'test-token', refresh_token: 'refresh-token' };
    localStorage.setItem('authTokens', JSON.stringify(mockTokens));
    localStorage.setItem('userData', JSON.stringify(mockUser));
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the auth check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Should have a user
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticatedUser).toBe(true);
  });
  
  it('logs in successfully using API', async () => {
    // Mock API response for login
    const mockApiResponse = {
      data: {
        id: 'api-user-id',
        username: 'apiuser',
        email: 'api@example.com',
        access_token: 'api-token',
        refresh_token: 'api-refresh'
      },
      error: null,
      statusCode: 200,
      loading: false
    };
    (apiClient.apiRequest as jest.Mock).mockResolvedValueOnce(mockApiResponse);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the initial auth check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Initially no user
    expect(result.current.user).toBeNull();
    
    // Perform login
    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('apiuser', 'password123');
    });
    
    // Login should be successful
    expect(loginResult).toBe(true);
    
    // API should have been called with correct parameters
    expect(apiClient.apiRequest).toHaveBeenCalledWith({
      endpoint: '/auth/login/',
      method: 'POST',
      body: { username: 'apiuser', password: 'password123' },
      requiresAuth: false
    });
    
    // User should be set
    expect(result.current.user).toEqual(mockApiResponse.data);
    expect(result.current.isAuthenticatedUser).toBe(true);
    
    // Tokens should be in localStorage
    expect(JSON.parse(localStorage.getItem('authTokens') || '{}')).toEqual({
      access_token: 'api-token',
      refresh_token: 'api-refresh'
    });
  });
  
  it('handles login errors from API', async () => {
    // Mock API error response
    const mockErrorResponse = {
      data: null,
      error: new Error('Invalid credentials'),
      statusCode: 401,
      loading: false
    };
    (apiClient.apiRequest as jest.Mock).mockResolvedValueOnce(mockErrorResponse);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the initial auth check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Perform login
    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('baduser', 'wrongpass');
    });
    
    // Login should fail
    expect(loginResult).toBe(false);
    
    // Error should be set
    expect(result.current.error).toBeTruthy();
    
    // User should still be null
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticatedUser).toBe(false);
  });
  
  it('registers successfully using API', async () => {
    // Mock API response for registration
    const mockApiResponse = {
      data: {
        id: 'new-user-id',
        username: 'newuser',
        email: 'new@example.com'
      },
      error: null,
      statusCode: 201,
      loading: false
    };
    (apiClient.apiRequest as jest.Mock).mockResolvedValueOnce(mockApiResponse);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the initial auth check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Perform registration
    let registerResult;
    await act(async () => {
      registerResult = await result.current.register('newuser', 'new@example.com', 'password123');
    });
    
    // Registration should be successful
    expect(registerResult).toBe(true);
    
    // API should have been called with correct parameters
    expect(apiClient.apiRequest).toHaveBeenCalledWith({
      endpoint: '/auth/signup/',
      method: 'POST',
      body: {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      },
      requiresAuth: false
    });
  });
  
  it('logs out correctly', async () => {
    // Set up mock user and tokens in localStorage
    const mockUser = { id: 'test-id', username: 'testuser' };
    const mockTokens = { access_token: 'test-token', refresh_token: 'refresh-token' };
    localStorage.setItem('authTokens', JSON.stringify(mockTokens));
    localStorage.setItem('userData', JSON.stringify(mockUser));
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the auth check to complete
    await waitFor(() => {
      expect(result.current.isAuthenticatedUser).toBe(true);
    });
    
    // Perform logout
    act(() => {
      result.current.logout();
    });
    
    // User should be null
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticatedUser).toBe(false);
    
    // Tokens should be removed from localStorage
    expect(localStorage.getItem('authTokens')).toBeNull();
    expect(localStorage.getItem('userData')).toBeNull();
  });
});