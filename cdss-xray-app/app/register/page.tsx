'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import RegisterForm from '@/components/ui/RegisterForm';
import useAuth from '@/hooks/useAuth';

export default function RegisterPage() {
  const { isAuthenticatedUser, isLoading } = useAuth();
  const router = useRouter();
  
  // Redirect to analyze page if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticatedUser) {
      router.push('/analyze');
    }
  }, [isAuthenticatedUser, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-blue-500 animate-spin"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Don't render if user is authenticated (will redirect)
  if (isAuthenticatedUser) {
    return null;
  }

  return (
    <div className=" flex flex-col md:flex-row">
      {/* Background image - full screen with gradient overlay */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background.jpeg"
          alt="Background"
          fill
          priority
          className="object-cover"
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
      </div>
      
      {/* Content container */}
      <div className="flex flex-col md:flex-row relative z-10 w-full ">
        {/* Left side - Branding */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center backdrop-blur-[2px]">
          <div className="max-w-md mx-auto bg-black/40 p-8 rounded-lg shadow-2xl backdrop-blur-[2px]">
            <div className="flex items-center space-x-3 mb-6">
              <Image 
                src="/logo3.png" 
                alt="CDSS X-Ray Logo" 
                width={48} 
                height={48} 
                className="rounded-md"
              />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Join CDSS X-Ray
              </h1>
            </div>
            <p className="text-xl text-blue-200 mb-6">
              Create your account
            </p>
            <p className="text-gray-200">
              Become part of our community of medical professionals using AI-powered tools to improve diagnostic accuracy and patient care.
            </p>
          </div>
        </div>
        
        {/* Right side - Register Form */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center backdrop-blur-[2px]">
          <div className="max-w-md mx-auto w-full bg-gray-900/80 p-8 rounded-lg shadow-2xl backdrop-blur-[2px]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2 text-white">Create an Account</h2>
              <p className="text-gray-300">
                Enter your details to register
              </p>
            </div>
            
            <RegisterForm />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-400 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}