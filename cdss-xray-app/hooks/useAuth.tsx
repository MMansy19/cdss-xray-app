"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

interface User {
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE || 'false';

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
    try {
      const val = localStorage.getItem(key);
      return val === "undefined" ? null : val;
    } catch (e) {
      console.warn(`Error accessing localStorage for ${key}:`, e);
      return null;
    }
  };

  useEffect(() => {
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

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (DEMO_MODE === 'true') {
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
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: AbortSignal.timeout(10000)
      });

      const data = await response.json();

      if (response.ok && data) {
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
        setError(data.detail || 'Login failed');
        return false;
      }
    } catch (error) {
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

    if (DEMO_MODE === 'true') {
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
      const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
        signal: AbortSignal.timeout(10000)
      });

      const data = await response.json();

      if (response.ok && data) {
        localStorage.setItem('userData', JSON.stringify(data));
        setUser(data);
        console.log("User registered successfully."); 
        router.push('/login');
        return true;
      } else {
        setError(data.username?.[0] || data.email?.[0] || data.password?.[0] || 'Registration failed');
        return false;
      }
    } catch (error) {
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
