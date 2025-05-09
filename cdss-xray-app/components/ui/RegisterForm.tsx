'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Key, LogIn } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  // Field-specific error messages
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { register, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError('');
    
    // Clear field-specific error when user types
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[e.target.name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setFieldErrors({});
    
    // Validate form inputs
    if (!formData.username || !formData.email || !formData.password) {
      setValidationError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register(formData.username, formData.email, formData.password);
      
      // If registration is successful, the router will redirect in useAuth.tsx
      // If not, we'll get errors in the error state from useAuth
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };  // Parse API error message which might contain field-specific errors
  const parseApiError = (errorMessage: string | null): string | undefined => {
    if (!errorMessage) return undefined;
    
    try {
      // First check for field-specific errors in the format "field: error message"
      if (errorMessage.includes('\n')) {
        const lines = errorMessage.split('\n');
        const mainMessage = lines[0];
        const fieldErrorsMap: Record<string, string> = {};
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const [field, ...messageParts] = line.split(':');
          if (messageParts.length && field) {
            fieldErrorsMap[field.trim()] = messageParts.join(':').trim();
          }
        }
        
        if (Object.keys(fieldErrorsMap).length) {
          // Update field errors but don't trigger a re-render in the parsing function
          return mainMessage || 'Validation failed';
        }
      }
      
      // Special case for "username already exists" error which is common
      if (errorMessage.toLowerCase().includes('username') && 
          errorMessage.toLowerCase().includes('exists')) {
        return 'Username is already taken';
      }
    } catch (e) {
      // If parsing fails, just use the error message as is
      console.error('Error parsing API error:', e);
    }
    
    return errorMessage;
  };
  // Use useMemo to prevent infinite re-renders
  const [displayError, parsedFieldErrors] = useMemo(() => {
    if (validationError) {
      return [validationError, {}];
    }
    
    if (error) {
      try {
        // Process field-specific errors
        let newFieldErrors: Record<string, string> = {};
        
        // First check for field-specific errors in the format "field: error message"
        if (error.includes('\n')) {
          const lines = error.split('\n');
          
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const [field, ...messageParts] = line.split(':');
            if (messageParts.length && field) {
              newFieldErrors[field.trim()] = messageParts.join(':').trim();
            }
          }
        }
        
        // Special case for username exists
        if (error.toLowerCase().includes('username') && 
            error.toLowerCase().includes('exists')) {
          newFieldErrors.username = 'A user with that username already exists.';
        }
        
        return [parseApiError(error), newFieldErrors];
      } catch (e) {
        console.error('Error parsing API error:', e);
        return [error, {}];
      }
    }
    
    return [undefined, {}];
  }, [validationError, error]);
    // Apply parsed field errors
  useEffect(() => {
    if (Object.keys(parsedFieldErrors).length > 0) {
      setFieldErrors(parsedFieldErrors);
    }
  }, [parsedFieldErrors]);
  
  // Helper to check if a specific field has an error
  const hasFieldError = (fieldName: string) => {
    return !!fieldErrors[fieldName];
  };

  // Get error message for a specific field
  const getFieldErrorMessage = (fieldName: string) => {
    return fieldErrors[fieldName];
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Field */}
        <div>          <div className="mb-1">
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Username
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  hasFieldError('username') ? 'border-red-500' : 
                  displayError ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                aria-invalid={hasFieldError('username')}
                aria-describedby={hasFieldError('username') ? "username-error" : undefined}
              />
            </div>
            {hasFieldError('username') && (
              <p id="username-error" className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">{getFieldErrorMessage('username')}</p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <div className="mb-1">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  hasFieldError('email') ? 'border-red-500' : 
                  displayError ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
            </div>
            {hasFieldError('email') && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{getFieldErrorMessage('email')}</p>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="mb-1">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  hasFieldError('password') ? 'border-red-500' : 
                  displayError ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
            </div>
            {hasFieldError('password') && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{getFieldErrorMessage('password')}</p>
            )}
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <div className="mb-1">
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  displayError ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
            </div>
          </div>
        </div>        {/* Display general errors or field-specific error summary */}
        {displayError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{displayError}</p>
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="mt-2 text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                {Object.entries(fieldErrors).map(([field, message]) => (
                  <li key={field}>{field}: {message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <LogIn className="h-5 w-5 mr-2" />
            )}
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
