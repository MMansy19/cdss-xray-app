'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegisterForm from '@/components/ui/RegisterForm';
import useAuth from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Redirect to analyze page if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/analyze');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Don't render if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="bg-blue-600 md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join CDSS X-Ray
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Create your account
          </p>
          <p className="text-blue-100">
            Become part of our community of medical professionals using AI-powered tools to improve diagnostic accuracy and patient care.
          </p>
        </div>
      </div>
      
      {/* Right side - Register Form */}
      <div className="bg-white dark:bg-gray-900 md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Create an Account</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your details to register
            </p>
          </div>
          
          <RegisterForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}