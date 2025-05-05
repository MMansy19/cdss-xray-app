'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Key, LogIn } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const router = useRouter();
  const { register, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    // Validate form inputs
    if (!formData.username || !formData.name || !formData.password) {
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
    
    // Simulate network delay for better UX feedback
    setTimeout(() => {
      const success = register(formData.username, formData.password, formData.name);
      
      if (success) {
        router.push('/analyze');
      }
      
      setIsLoading(false);
    }, 500);
  };

  const displayError = validationError || error;

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Field */}
        <div>
          <div className="relative">
            <label 
              htmlFor="username" 
              className={`absolute left-3 ${
                formData.username ? '-top-2.5 text-xs bg-white dark:bg-gray-800 px-1' : 'top-3 text-sm'
              } text-gray-500 dark:text-gray-400 transition-all duration-200`}
            >
              Username
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
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
                  displayError ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
            </div>
          </div>
        </div>

        {/* Name Field */}
        <div>
          <div className="relative">
            <label 
              htmlFor="name" 
              className={`absolute left-3 ${
                formData.name ? '-top-2.5 text-xs bg-white dark:bg-gray-800 px-1' : 'top-3 text-sm'
              } text-gray-500 dark:text-gray-400 transition-all duration-200`}
            >
              Full Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  displayError ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
            </div>
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="relative">
            <label 
              htmlFor="password" 
              className={`absolute left-3 ${
                formData.password ? '-top-2.5 text-xs bg-white dark:bg-gray-800 px-1' : 'top-3 text-sm'
              } text-gray-500 dark:text-gray-400 transition-all duration-200`}
            >
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
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
                  displayError ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
            </div>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <div className="relative">
            <label 
              htmlFor="confirmPassword" 
              className={`absolute left-3 ${
                formData.confirmPassword ? '-top-2.5 text-xs bg-white dark:bg-gray-800 px-1' : 'top-3 text-sm'
              } text-gray-500 dark:text-gray-400 transition-all duration-200`}
            >
              Confirm Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
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
        </div>

        {displayError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{displayError}</p>
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