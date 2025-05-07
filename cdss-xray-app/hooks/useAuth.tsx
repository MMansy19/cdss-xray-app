"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

// User type definition
interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
}

// Define the token structure to match Django's JWT response
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
  isAuthenticated: boolean;
  error: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE || 'false';

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is logged in on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      try {
        // SafelyGet handles the case where localStorage might not be available yet
        const safelyGet = (key: string): string | null => {
          try {
            return localStorage.getItem(key);
          } catch (e) {
            console.warn(`Error accessing localStorage for ${key}:`, e);
            return null;
          }
        };

        // SafelyParse handles JSON parsing errors gracefully
        const safelyParse = <T extends unknown>(json: string | null): T | null => {
          if (!json) return null;
          try {
            return JSON.parse(json) as T;
          } catch (e) {
            console.error("Error parsing JSON:", e);
            return null;
          }
        };
        
        // Check for tokens in the new JWT format
        const tokensString = safelyGet('authTokens');
        if (tokensString) {
          const tokens = safelyParse<AuthTokens>(tokensString);
          if (tokens && tokens.access_token) {
            // Tokens exist in the new format
            const userDataString = safelyGet('userData');
            const userData = safelyParse<User>(userDataString);
            
            if (userData && userData.id) {
              setUser(userData);
              setIsAuthenticated(true);
              setLoading(false);
              return;
            }
          }
        }
        
        // Fall back to old token format
        const legacyToken = safelyGet('authToken');
        if (!legacyToken) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Safely parse stored user data
        const userDataString = safelyGet('userData');
        const userData = safelyParse<User>(userDataString);
        
        if (userData && userData.id) {
          setUser(userData);
          setIsAuthenticated(true);
          
          // Migrate to new token format if using legacy format
          if (legacyToken && !tokensString) {
            localStorage.setItem('authTokens', JSON.stringify({
              access_token: legacyToken,
              refresh_token: legacyToken // Use same token as a fallback
            }));
          }
        } else {
          // Invalid or missing user data
          localStorage.removeItem('authToken');
          localStorage.removeItem('authTokens');
          localStorage.removeItem('userData');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    // Add a small delay to ensure localStorage is available (helps with Next.js hydration)
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    // Setup storage event listener to sync auth state across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'authTokens' || e.key === 'userData') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    // Handle demo mode
    if (DEMO_MODE === 'true') {
      try {
        // Mock successful login with demo user
        const mockUser = {
          id: '12345',
          username: username,
          email: `${username}@example.com`,
          name: username
        };
        
        // Store auth data using new token format
        const mockTokens = {
          access_token: 'mock-access-token-for-demo-mode',
          refresh_token: 'mock-refresh-token-for-demo-mode'
        };
        
        localStorage.setItem('authTokens', JSON.stringify(mockTokens));
        localStorage.setItem('authToken', mockTokens.access_token); // For backwards compatibility
        localStorage.setItem('userData', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error('Demo login error:', error);
        setError('Login failed in demo mode');
        return false;
      } finally {
        setLoading(false);
      }
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000)
      });
      
      const data = await response.json();
      
      if (response.ok) {
          // Store both token formats
          if (data.access_token && data.refresh_token) {
            // New JWT format
            localStorage.setItem('authTokens', JSON.stringify({
              access_token: data.access_token,
              refresh_token: data.refresh_token
            }));
            localStorage.setItem('authToken', data.access_token); // For backwards compatibility
          } else if (data.token) {
            // Old token format
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authTokens', JSON.stringify({
              access_token: data.token,
              refresh_token: data.token // Use same token as a fallback
            }));
          } else {
            throw new Error('No token in response');
          }
          
          localStorage.setItem('userData', JSON.stringify(data.user));
          setUser(data.user);
          setIsAuthenticated(true);
          return true;
        } else {
          console.error('Login response missing token or user data:', data);
          setError(data.detail || 'Invalid credentials');
          return false;
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    // Handle demo mode
    if (DEMO_MODE === 'true') {
      try {
        // Mock successful registration
        const mockUser = {
          id: Date.now().toString(),
          username: username,
          email: email,
          name: username
        };
        
        // Store auth data using new token format
        const mockTokens = {
          access_token: 'mock-access-token-for-demo-mode',
          refresh_token: 'mock-refresh-token-for-demo-mode'
        };
        
        localStorage.setItem('authTokens', JSON.stringify(mockTokens));
        localStorage.setItem('authToken', mockTokens.access_token); // For backwards compatibility
        localStorage.setItem('userData', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error('Demo registration error:', error);
        setError('Registration failed in demo mode');
        return false;
      } finally {
        setLoading(false);
      }
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000)
      });
      
      const data = await response.json();
      
      if (response.ok) {
          // Store both token formats
          if (data.access_token && data.refresh_token) {
            // New JWT format
            localStorage.setItem('authTokens', JSON.stringify({
              access_token: data.access_token,
              refresh_token: data.refresh_token
            }));
            localStorage.setItem('authToken', data.access_token); // For backwards compatibility
          } else if (data.token) {
            // Old token format
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authTokens', JSON.stringify({
              access_token: data.token,
              refresh_token: data.token // Use same token as a fallback
            }));
          } else {
            router.push('/login');
            throw new Error('No token in response');
          }
          
          localStorage.setItem('userData', JSON.stringify(data.user));
          setUser(data.user);
          setIsAuthenticated(true);
          return true;
        } else {
          console.error('Registration response missing token or user data:', data);
          setError(data.username?.[0] || data.email?.[0] || data.password?.[0] || 'Registration failed');
          return false;
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setError('Connection error. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    // Clear all auth-related storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokens');
    localStorage.removeItem('userData');
    // Reset user state
    setUser(null);
    setIsAuthenticated(false);
    // Force redirect to login page
    router.push('/login');
    
    // For debugging
    console.log("Logout executed, user state cleared");
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
        isAuthenticated: isAuthenticated,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;