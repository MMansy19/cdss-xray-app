'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthState, UserProfile, AuthTokens, LoginResponse, SignupResponse } from '@/types';
import { useRouter } from 'next/navigation';

// Storage keys
const AUTH_USER_KEY = 'cdss_auth_user';
const AUTH_TOKENS_KEY = 'cdss_auth_tokens';
const API_BASE_URL = 'http://localhost:8000';

// Create an AuthContext
interface AuthContextType extends AuthState {
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string, email: string) => Promise<boolean>;
  getAuthHeader: () => Record<string, string>;
  refreshToken: () => Promise<boolean>;
  uploadImage: (file: File, endpoint: string, onProgress?: (progress: number) => void) => Promise<any>;
  getImageResults: (imageId: string, endpoint: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();
  return React.createElement(
    AuthContext.Provider,
    { value: auth },
    children
  );
};

// Hook for using the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Main auth logic provider
function useAuthProvider(): AuthContextType {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    error: null,
    tokens: null,
  });
  
  // Add loading state to prevent flashes during auth check
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const router = useRouter();

  // Load authentication state from localStorage on component mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      const storedTokens = localStorage.getItem(AUTH_TOKENS_KEY);
      
      if (storedUser && storedTokens) {
        try {
          const user = JSON.parse(storedUser) as UserProfile;
          const tokens = JSON.parse(storedTokens) as AuthTokens;
          
          setAuthState({
            isAuthenticated: true,
            user,
            tokens,
            error: null,
          });
          
          // Here we could verify the token is still valid by making an API request
          // to a protected endpoint, but for simplicity we'll trust the stored tokens
          fetchUserProfile(tokens.access_token);
        } catch (error) {
          console.error('Failed to parse stored auth data:', error);
          localStorage.removeItem(AUTH_USER_KEY);
          localStorage.removeItem(AUTH_TOKENS_KEY);
        }
      }
      
      setIsLoading(false);
    };

    // Execute in next tick to ensure client-side execution
    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, []);

  // Fetch user profile information from the API
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        // If token is expired or invalid, we should handle it here
        if (response.status === 401) {
          // Try to refresh the token first
          const refreshed = await refreshToken();
          if (!refreshed) {
            logout();
            return;
          }
          // If refresh successful, try fetching profile again
          return fetchUserProfile(authState.tokens!.access_token);
        }
        throw new Error('Failed to fetch user profile');
      }
      
      const userData = await response.json();
      
      // Update the user profile with complete information
      const userProfile: UserProfile = {
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        bio: userData.bio,
        birth_date: userData.birth_date,
        profile_picture: userData.profile_picture,
      };
      
      // Update state and localStorage
      setAuthState(prev => ({
        ...prev,
        user: userProfile,
      }));
      
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userProfile));
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Helper function to extract error messages from backend responses
  const extractErrorMessage = (errorData: any, defaultMessage: string): string => {
    if (!errorData) return defaultMessage;
    
    // Handle DRF error formats - could be detail, non_field_errors, or field-specific errors
    if (errorData.detail) {
      return errorData.detail;
    } 
    
    if (errorData.non_field_errors) {
      return Array.isArray(errorData.non_field_errors) 
        ? errorData.non_field_errors.join(', ') 
        : errorData.non_field_errors;
    }
    
    // Common field errors
    const fieldErrors = [];
    for (const field of ['username', 'email', 'password']) {
      if (errorData[field]) {
        const errors = Array.isArray(errorData[field])
          ? errorData[field].join(', ')
          : errorData[field];
        fieldErrors.push(`${field}: ${errors}`);
      }
    }
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join('; ');
    }
    
    // Generic error message
    return errorData.error || 
           errorData.message || 
           (typeof errorData === 'string' ? errorData : defaultMessage);
  };

  // Login function that sends credentials to backend API
  const login = async (username: string, password: string): Promise<boolean> => {
    // Clear previous errors
    setAuthState(prev => ({ ...prev, error: null }));
    
    try {
      // Make API request to login endpoint
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Extract specific error messages from the backend
        const errorMessage = extractErrorMessage(errorData, 'Login failed. Please check your credentials.');
        throw new Error(errorMessage);
      }
      
      const data = await response.json() as LoginResponse;
      
      // Create a basic profile from the username
      const userProfile: UserProfile = {
        username,
      };
      
      // Store tokens
      const tokens: AuthTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      };
      
      // Update state
      setAuthState({
        isAuthenticated: true,
        user: userProfile,
        tokens,
        error: null,
      });
      
      // Store in localStorage for persistence
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userProfile));
      localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
      
      // Fetch complete user profile
      await fetchUserProfile(tokens.access_token);
      
      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      return false;
    }
  };

  // Register function that creates a new user via the API
  const register = async (username: string, password: string, email: string): Promise<boolean> => {
    // Clear previous errors
    setAuthState(prev => ({ ...prev, error: null }));
    
    try {
      // Make API request to signup endpoint
      const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Extract specific error messages from the backend
        const errorMessage = extractErrorMessage(errorData, 'Registration failed');
        throw new Error(errorMessage);
      }
      
      const userData = await response.json() as SignupResponse;
      
      // After successful registration, log the user in
      return await login(username, password);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // If you have a logout endpoint, you would call it here
    if (authState.tokens?.access_token) {
      // This would be an async call in a real application
      // We're just providing the structure here
      fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.tokens.access_token}`,
          'Content-Type': 'application/json',
        },
      }).catch(error => {
        console.error('Logout endpoint error:', error);
        // We continue with local logout regardless of server response
      });
    }
    
    // Clear authentication state
    setAuthState({
      isAuthenticated: false,
      user: null,
      tokens: null,
      error: null,
    });
    
    // Remove data from localStorage
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKENS_KEY);
    
    // Redirect to home page
    router.push('/');
  };

  // Function to refresh the access token using the refresh token
  const refreshToken = async (): Promise<boolean> => {
    if (!authState.tokens?.refresh_token) {
      return false;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: authState.tokens.refresh_token }),
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      
      // Update tokens
      const newTokens: AuthTokens = {
        access_token: data.access,
        refresh_token: authState.tokens.refresh_token, // Keep the same refresh token
      };
      
      // Update state and localStorage
      setAuthState(prev => ({
        ...prev,
        tokens: newTokens,
      }));
      
      localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(newTokens));
      
      return true;
    } catch (error) {
      // If refresh fails, log the user out
      logout();
      return false;
    }
  };

  // File upload function for uploading images to the backend
  const uploadImage = async (file: File, endpoint: string, onProgress?: (progress: number) => void): Promise<any> => {
    if (!authState.isAuthenticated || !authState.tokens) {
      throw new Error('Authentication required to upload images');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPG, JPEG, or PNG image.');
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File is too large. Maximum size is 10MB.');
    }

    try {
      // Check if token needs to be refreshed
      const tokenAge = getTokenAge(authState.tokens.access_token);
      if (tokenAge && tokenAge > 55 * 60) { // 55 minutes (if token expires in 1 hour)
        await refreshToken();
      }

      const formData = new FormData();
      formData.append('image', file);
      
      // Create a fetch request with progress tracking if supported
      if (onProgress && window.XMLHttpRequest) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              onProgress(percentComplete);
            }
          });
          
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                reject(new Error('Failed to parse response'));
              }
            } else {
              let errorMessage = 'Upload failed';
              try {
                const errorData = JSON.parse(xhr.responseText);
                errorMessage = extractErrorMessage(errorData, errorMessage);
              } catch (e) {
                errorMessage = `Upload failed: ${xhr.statusText}`;
              }
              reject(new Error(errorMessage));
            }
          });
          
          xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
          xhr.addEventListener('abort', () => reject(new Error('Upload was aborted')));
          
          xhr.open('POST', `${API_BASE_URL}${endpoint}`);
          xhr.setRequestHeader('Authorization', `Bearer ${authState.tokens!.access_token}`);
          xhr.send(formData);
        });
      } else {
        // Fallback to regular fetch
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.tokens.access_token}`,
            // Don't set Content-Type here as FormData will set it with the boundary
          },
          body: formData,
        });
        
        if (!response.ok) {
          // Try to parse error response
          let errorMessage = 'Failed to upload image';
          try {
            const errorData = await response.json();
            errorMessage = extractErrorMessage(errorData, errorMessage);
          } catch (e) {
            // If cannot parse JSON, use status text
            errorMessage = `Upload failed: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };
  
  // Function to get image analysis results
  const getImageResults = async (imageId: string, endpoint: string): Promise<any> => {
    if (!authState.isAuthenticated || !authState.tokens) {
      throw new Error('Authentication required to fetch results');
    }

    try {
      // Check if token needs to be refreshed
      const tokenAge = getTokenAge(authState.tokens.access_token);
      if (tokenAge && tokenAge > 55 * 60) { // 55 minutes (if token expires in 1 hour)
        await refreshToken();
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}/${imageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authState.tokens.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // Handle 401 by refreshing token
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry with new token
            return getImageResults(imageId, endpoint);
          }
          throw new Error('Session expired. Please login again.');
        }

        // Try to parse error response
        let errorMessage = 'Failed to fetch image results';
        try {
          const errorData = await response.json();
          errorMessage = extractErrorMessage(errorData, errorMessage);
        } catch (e) {
          errorMessage = `Request failed: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching image results:', error);
      throw error;
    }
  };

  // Function to get auth header for API requests
  const getAuthHeader = () => {
    return authState.tokens ? { 'Authorization': `Bearer ${authState.tokens.access_token}` } : {};
  };

  // Helper function to estimate token age
  const getTokenAge = (token: string): number | null => {
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // The middle part is the payload, which we can decode
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if payload has an "iat" (issued at) claim
      if (!payload.iat) return null;
      
      // Calculate age in seconds
      const now = Math.floor(Date.now() / 1000);
      return now - payload.iat;
    } catch (e) {
      console.error('Error parsing token:', e);
      return null;
    }
  };

  return {
    ...authState,
    isLoading,
    login,
    logout,
    register,
    getAuthHeader,
    refreshToken,
    uploadImage,
    getImageResults,
  };
}

export default useAuth;