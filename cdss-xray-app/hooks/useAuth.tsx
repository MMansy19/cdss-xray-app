"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/apiClient';
import { isDemoModeSync, isDemoMode } from '@/utils/mockService';

interface User {
  id?: string;
  username?: string;
  email?: string;
  name?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticatedUser: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const safelyParse = <T,>(json: string | null): T | null => {
    if (!json || json === "undefined") return null;
    try {
      return JSON.parse(json) as T;
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return null;
    }
  };

  const safelyGet = (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const val = localStorage.getItem(key);
      return val === "undefined" ? null : val;
    } catch (e) {
      console.warn(`Error accessing localStorage for ${key}:`, e);
      return null;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkAuth = () => {
      try {
        // First try to get auth tokens
        const tokensString = safelyGet('authTokens');
        const tokens = safelyParse<AuthTokens>(tokensString);

        if (tokens?.access_token) {
          const userDataString = safelyGet('userData');
          const userData = safelyParse<User>(userDataString);

          if (userData) {
            setUser(userData);
            setLoading(false);
            return;
          }
        }

        // Fallback to legacy token
        const legacyToken = safelyGet('authToken');
        if (legacyToken) {
          const userDataString = safelyGet('userData');
          const userData = safelyParse<User>(userDataString);

          if (userData) {
            setUser(userData);
            localStorage.setItem('authTokens', JSON.stringify({
              access_token: legacyToken,
              refresh_token: legacyToken
            }));
            setLoading(false);
            return;
          }
        }

        // Only clear auth state if we're not in a redirect or initial page load
        if (!user) {
          // This is a first load, don't redirect
          setLoading(false);
        } else {
          // This is probably a reset or token expiration
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in auth check:", error);
        setLoading(false);
      }
    };

    // Check immediately to avoid flash of unauthed content
    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (['authToken', 'authTokens', 'userData'].includes(e.key || '')) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', checkAuth); // Re-check auth when tab gets focus
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  const login = async (username: string, password: string, retryCount: number = 0): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const MAX_RETRIES = 3; // Limit the number of retries

    // Check if in demo mode
    const demoMode = isDemoModeSync() || await isDemoMode();
    if (demoMode) {
      try {
        const mockUser = {
          id: '12345',
          username,
          email: `${username}@example.com`,
          name: username
        };
        const mockTokens = {
          access_token: 'demo-access-token',
          refresh_token: 'demo-refresh-token'
        };

        localStorage.setItem('authTokens', JSON.stringify(mockTokens));
        localStorage.setItem('authToken', mockTokens.access_token);
        localStorage.setItem('userData', JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
      } catch (error) {
        setError('Demo login failed');
        return false;
      } finally {
        setLoading(false);
      }
    }

    try {
      const response = await apiRequest<any>({
        endpoint: '/auth/login/',
        method: 'POST',
        body: { username, password },
        requiresAuth: false
      });

      if (response.error) {
        setError(response.error.message || 'Login failed');
        return false;
      }

      const data = response.data;
      
      if (data) {
        if (data.access_token && data.refresh_token) {
          localStorage.setItem('authTokens', JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token
          }));
          localStorage.setItem('authToken', data.access_token);
        } else if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('authTokens', JSON.stringify({
            access_token: data.token,
            refresh_token: data.token
          }));
        }

        localStorage.setItem('userData', JSON.stringify(data));
        setUser(data);
        return true;
      } else {
        setError('Login failed - no data returned');
        return false;
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'DEMO_MODE_ENABLED') {
        // If demo mode is forced, handle login as demo
        if (retryCount < MAX_RETRIES) {
          return login(username, password, retryCount + 1);
        } else {
          console.error('Max retries reached for DEMO_MODE_ENABLED');
          setError('Demo mode login failed after multiple attempts');
          return false;
        }
      }
      
      console.error('Login error:', error);
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    // Check if in demo mode
    const demoMode = isDemoModeSync() || await isDemoMode();
    if (demoMode) {
      try {
        const mockUser = {
          id: Date.now().toString(),
          username,
          email,
          name: username
        };
        const mockTokens = {
          access_token: 'demo-access-token',
          refresh_token: 'demo-refresh-token'
        };

        localStorage.setItem('authTokens', JSON.stringify(mockTokens));
        localStorage.setItem('authToken', mockTokens.access_token);
        localStorage.setItem('userData', JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
      } catch (error) {
        setError('Demo registration failed');
        return false;
      } finally {
        setLoading(false);
      }
    }

    try {
      const response = await apiRequest<any>({
        endpoint: '/auth/signup/',
        method: 'POST',
        body: { username, email, password },
        requiresAuth: false
      });

      if (response.error) {
        setError(response.error.message || 'Registration failed');
        return false;
      }

      const data = response.data;
      
      if (data) {
        localStorage.setItem('userData', JSON.stringify(data));
        setUser(data);
        console.log("User registered successfully.");
        router.push('/login');
        return true;
      } else {
        setError('Registration failed - no data returned');
        return false;
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'DEMO_MODE_ENABLED') {
        // If demo mode is forced, handle registration as demo
        return register(username, email, password);
      }
      
      console.error('Registration error:', error);
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authTokens');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    router.push('/login');
    console.log("User logged out.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isLoading: loading,
        isAuthenticatedUser: !!user,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
