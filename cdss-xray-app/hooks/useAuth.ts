'use client';

import { useState, useEffect } from 'react';
import { AuthState, UserProfile, AuthTokens, LoginResponse, SignupResponse } from '@/types';
import { useRouter } from 'next/navigation';

// Storage keys
const AUTH_USER_KEY = 'cdss_auth_user';
const AUTH_TOKENS_KEY = 'cdss_auth_tokens';
const API_BASE_URL = 'http://localhost:8000';

export function useAuth() {
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
          // We could try to refresh the token here
          logout();
          return;
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
        throw new Error(errorData.detail || 'Login failed');
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
        throw new Error(errorData.detail || 'Registration failed');
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
    // const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${authState.tokens?.access_token}`,
    //   },
    // });
    
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

  // Function to get auth header for API requests
  const getAuthHeader = () => {
    return authState.tokens ? { 'Authorization': `Bearer ${authState.tokens.access_token}` } : {};
  };

  return {
    ...authState,
    isLoading,
    login,
    logout,
    register,
    getAuthHeader,
    refreshToken,
  };
}

export default useAuth;