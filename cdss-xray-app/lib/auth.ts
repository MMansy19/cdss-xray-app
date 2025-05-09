import { isDemoMode, getApiBaseUrl } from './config';

/**
 * Interface for user data returned from authentication functions
 */
export interface AuthUser {
  email: string;
  name: string;
  id?: string;
}

/**
 * Interface for authentication response data
 */
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/**
 * Custom error class for authentication errors
 */
export class AuthError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Stores authentication token and user data in localStorage
 * 
 * @param token - JWT token or mock token
 * @param user - User data object
 */
function storeAuthData(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return;
  
  // Store token
  localStorage.setItem('authToken', token);
  
  // Store user data
  localStorage.setItem('userData', JSON.stringify(user));
}

/**
 * Makes an API request to the authentication endpoints
 * 
 * @param endpoint - API endpoint path
 * @param method - HTTP method
 * @param data - Request body data
 * @returns Promise resolving to the API response
 */
async function makeAuthRequest<T>(endpoint: string, method: string, data: any): Promise<T> {
  const apiUrl = getApiBaseUrl();
  const url = `${apiUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Get JSON response
    const result = await response.json();

    // Check for error responses
    if (!response.ok) {
      // Format error message from API response or use generic message
      const errorMessage = result.message || result.detail || result.error || 'Authentication failed';
      throw new AuthError(errorMessage, response.status);
    }

    return result as T;
  } catch (error) {
    // Re-throw AuthError instances as is
    if (error instanceof AuthError) {
      throw error;
    }
    
    // For network errors and other issues
    console.error('Authentication request failed:', error);
    throw new AuthError('Network error during authentication. Please try again.', 500);
  }
}

/**
 * Authenticates a user with provided credentials
 * In Demo Mode: returns mock data
 * In Live Mode: makes actual API request
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to authentication response with token and user data
 * @throws {AuthError} If authentication fails
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  // Validate inputs
  if (!email || !password) {
    throw new AuthError('Email and password are required');
  }
  
  // Demo Mode: Return mock data
  if (isDemoMode()) {
    console.log('Demo mode: Using mock authentication');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo mode, accept any credentials with a mock response
    const mockUser: AuthUser = {
      email,
      name: email.split('@')[0], // Use part before @ as name
    };
    
    const mockResponse: AuthResponse = {
      token: 'demo-token',
      user: mockUser
    };
    
    // Store auth data in localStorage for demo mode
    storeAuthData(mockResponse.token, mockResponse.user);
    
    return mockResponse;
  }
  
  // Live Mode: Make actual API request
  try {
    const response = await makeAuthRequest<AuthResponse>(
      '/auth/login/',
      'POST',
      { email, password }
    );
    
    // Store auth data in localStorage for live mode
    storeAuthData(response.token, response.user);
    
    return response;
  } catch (error) {
    // Throw specific errors for login failures
    if (error instanceof AuthError) {
      throw error;
    }
    
    throw new AuthError('Login failed. Please check your credentials and try again.');
  }
}

/**
 * Registers a new user with provided credentials
 * In Demo Mode: returns mock data
 * In Live Mode: makes actual API request and logs in user automatically
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to authentication response with token and user data
 * @throws {AuthError} If registration fails
 */
export async function signupUser(email: string, password: string): Promise<AuthResponse> {
  // Validate inputs
  if (!email || !password) {
    throw new AuthError('Email and password are required');
  }
  
  if (password.length < 8) {
    throw new AuthError('Password must be at least 8 characters long');
  }
  
  // Demo Mode: Return mock data
  if (isDemoMode()) {
    console.log('Demo mode: Using mock registration');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // For demo mode, accept any registration with a mock response
    const mockUser: AuthUser = {
      email,
      name: email.split('@')[0], // Use part before @ as name
      id: `demo-user-${Date.now()}`
    };
    
    const mockResponse: AuthResponse = {
      token: 'demo-token',
      user: mockUser
    };
    
    // Store auth data in localStorage for demo mode
    storeAuthData(mockResponse.token, mockResponse.user);
    
    return mockResponse;
  }
  
  // Live Mode: Make actual API request
  try {
    // First, register the user
    const signupResponse = await makeAuthRequest<{ message: string }>(
      '/auth/signup/',
      'POST',
      { email, password }
    );
    
    console.log('Registration successful:', signupResponse.message);
    
    // After successful registration, log the user in automatically
    return await loginUser(email, password);
  } catch (error) {
    // Throw specific errors for registration failures
    if (error instanceof AuthError) {
      throw error;
    }
    
    throw new AuthError('Registration failed. Please try again later.');
  }
}

/**
 * Logs out the current user by clearing stored auth data
 */
export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
}

/**
 * Checks if a user is currently authenticated
 * 
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('authToken');
  return !!token;
}

/**
 * Gets the current authenticated user's data
 * 
 * @returns {AuthUser|null} The user data or null if not authenticated
 */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('userData');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Gets the current authentication token
 * 
 * @returns {string|null} The token or null if not authenticated
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}
