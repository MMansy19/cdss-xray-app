'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/ui/LoginForm';
import useAuth from '@/hooks/useAuth';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Redirect to analyze page if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/analyze');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="bg-blue-600 md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            CDSS X-Ray
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Clinical Decision Support System
          </p>
          <p className="text-blue-100">
            Welcome to the AI-powered chest X-ray analysis platform designed to assist medical professionals with rapid and accurate diagnoses.
          </p>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="bg-white dark:bg-gray-900 md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Sign In</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your credentials to access the platform
            </p>
          </div>
          
          <LoginForm />
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Demo credentials:
              <br />
              Username: <span className="font-mono">doctor1</span>, Password: <span className="font-mono">pass123</span>
              <br />
              Username: <span className="font-mono">admin</span>, Password: <span className="font-mono">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}