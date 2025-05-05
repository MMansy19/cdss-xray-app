'use client';

import { useState, useEffect } from 'react';
import { STATIC_USERS } from '@/constants/users';
import { AuthState, UserProfile } from '@/types';
import { useRouter } from 'next/navigation';

// Storage keys
const AUTH_USER_KEY = 'cdss_auth_user';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    error: null,
  });
  
  // Add loading state to prevent flashes during auth check
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const router = useRouter();

  // Load authentication state from localStorage on component mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as UserProfile;
          setAuthState({
            isAuthenticated: true,
            user,
            error: null,
          });
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem(AUTH_USER_KEY);
        }
      }
      
      setIsLoading(false);
    };

    // Execute in next tick to ensure client-side execution
    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, []);

  // Login function that validates against static user list
  const login = (username: string, password: string): boolean => {
    // Clear previous errors
    setAuthState(prev => ({ ...prev, error: null }));
    
    // Find user with matching credentials
    const user = STATIC_USERS.find(
      u => u.username === username && u.password === password
    );
    
    if (user) {
      // Create user profile (excluding the password)
      const userProfile: UserProfile = {
        username: user.username,
        name: user.name,
        role: user.role,
      };
      
      // Save to state and localStorage
      setAuthState({
        isAuthenticated: true,
        user: userProfile,
        error: null,
      });
      
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userProfile));
      return true;
    } else {
      setAuthState(prev => ({
        ...prev,
        error: 'Invalid username or password',
      }));
      return false;
    }
  };

  // Register function for new users
  const register = (username: string, password: string, name: string): boolean => {
    // Check if username already exists
    const existingUser = STATIC_USERS.find(u => u.username === username);
    
    if (existingUser) {
      setAuthState(prev => ({
        ...prev,
        error: 'Username already exists',
      }));
      return false;
    }
    
    // In a real app, we would add the user to a database
    // For this static demo, we'll just log in the user directly
    const userProfile: UserProfile = {
      username,
      name,
      role: 'User',
    };
    
    setAuthState({
      isAuthenticated: true,
      user: userProfile,
      error: null,
    });
    
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userProfile));
    return true;
  };

  // Logout function
  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      error: null,
    });
    
    localStorage.removeItem(AUTH_USER_KEY);
    router.push('/');
  };

  return {
    ...authState,
    isLoading,
    login,
    logout,
    register,
  };
}

export default useAuth;