import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { isDemoModeSync } from '../utils/mockService';

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
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Default demo user when running without backend
const DEMO_USER: User = {
  id: 'demo-user-id',
  username: 'demo_doctor',
  email: 'demo@example.com',
  name: 'Demo Doctor'
};

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isDemoModeSync()) {
          // In demo mode, we'll automatically use the demo user
          setUser(DEMO_USER);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Verify token with backend
        const response = await fetch(`${API_BASE_URL}/auth/verify/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          // Token invalid
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        // If verification fails, use demo user in demo mode
        if (isDemoModeSync()) {
          setUser(DEMO_USER);
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (isDemoModeSync()) {
        // In demo mode, accept any credentials and use demo user
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        setUser(DEMO_USER);
        setLoading(false);
        return true;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      // In demo mode or if API fails, still allow login with demo account
      if (isDemoModeSync()) {
        setUser(DEMO_USER);
        return true;
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (isDemoModeSync()) {
        // In demo mode, accept any registration and use demo user
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        setUser(DEMO_USER);
        setLoading(false);
        return true;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      
      // In demo mode, still allow registration
      if (isDemoModeSync()) {
        setUser(DEMO_USER);
        return true;
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    router.push('/login');
  };
  
  return (
    <AuthContext.Provider 
      value={{                                     
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
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