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
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Instead of verifying with backend, restore from localStorage
        try {
          // Safely parse stored user data
          const userDataString = localStorage.getItem('userData');
          
          if (!userDataString) {
            // No user data found, clear token and logout
            localStorage.removeItem('authToken');
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
          // Parse the user data
          const userData = JSON.parse(userDataString);
          
          if (userData && userData.id) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Invalid user data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
          localStorage.removeItem('authToken');
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
    }, 10);
    
    // Setup storage event listener to sync auth state across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'userData') {
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
        
        // Store auth data
        localStorage.setItem('authToken', 'mock-token-for-demo-mode');
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
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }
      
      setError(data.message || 'Invalid username or password');
      setIsAuthenticated(false);
      return false;
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
        
        // Store auth data
        localStorage.setItem('authToken', 'mock-token-for-demo-mode');
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
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }
      
      setError(data.message || 'Registration failed');
      return false;
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