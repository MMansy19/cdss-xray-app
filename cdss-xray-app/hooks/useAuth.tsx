"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/apiClient';
import { mockLogin, mockRegister } from '@/utils/mockService';
import { isDemoMode } from '@/lib/config';
import { isValidationError, ValidationError } from '@/utils/errorHandling';

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
  const [usingMockAuth, setUsingMockAuth] = useState(false);
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

        if (!user) {
          setLoading(false);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in auth check:", error);
        setLoading(false);
      }
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (['authToken', 'authTokens', 'userData'].includes(e.key || '')) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', checkAuth);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  useEffect(() => {
    const checkMockMode = async () => {
      const useMockAuth = await isDemoMode();
      setUsingMockAuth(useMockAuth);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('usingMockAuth', useMockAuth ? 'true' : 'false');
      }
    };

    checkMockMode().catch(console.error);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const useMockAuth = await isDemoMode();

      if (useMockAuth) {
        const mockUser = await mockLogin(username, password);

        if (mockUser) {
          localStorage.setItem('userData', JSON.stringify(mockUser));
          localStorage.setItem('authTokens', JSON.stringify({
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token'
          }));
          localStorage.setItem('authToken', 'mock-token');

          setUser(mockUser);
          setUsingMockAuth(true);
          return true;
        } else {
          setError('Invalid username or password');
          return false;
        }
      }

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
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const useMockAuth = await isDemoMode();

      if (useMockAuth) {
        const mockUser = await mockRegister(username, email, password);

        if (mockUser) {
          localStorage.setItem('userData', JSON.stringify(mockUser));
          setUser(mockUser);
          setUsingMockAuth(true);
          console.log("User registered successfully (mock mode).");
          router.push('/login');
          return true;
        } else {
          setError('Registration failed in mock mode');
          return false;
        }
      }

      const response = await apiRequest<any>({
        endpoint: '/auth/signup/',
        method: 'POST',
        body: { username, email, password },
        requiresAuth: false
      });      if (response.error) {
        // Check if this is a validation error with detailed field errors
        if (isValidationError(response.error)) {
          // Format field errors into a readable message
          const fieldErrors = Object.entries(response.error.fields)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          
          setError(`${response.error.message || 'Validation failed'}\n${fieldErrors}`);
        } else {
          // Use the error message directly
          setError(response.error.message || 'Registration failed');
        }
        return false;
      }

      const data = response.data;

      if (data) {
        // Show success message and redirect to login
        console.log("User registered successfully.");
        
        // Set a session flag to show success notification on login page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('registrationSuccess', 'true');
          sessionStorage.setItem('registeredEmail', email || '');
        }
        
        router.push('/login');
        return true;
      } else {
        setError('Registration failed - no data returned');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection and try again.');
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
