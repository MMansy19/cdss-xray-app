'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import { ArrowRight, Layers, Shield, BarChart3, LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

export default function Home() {
  const { isAuthenticatedUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount to check authentication
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return nothing during server-side rendering
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                AI-Powered Chest X-Ray Analysis for Clinical Decision Support
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Enhance diagnostic accuracy and speed with our advanced machine learning algorithms designed to assist medical professionals in chest X-ray interpretation.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href={isAuthenticatedUser ? "/analyze" : "/login"}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {isAuthenticatedUser ? "Analyze X-Ray" : "Login to Start"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  href="/about" 
                  className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl rotate-6"></div>
                <div className="relative bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg">
                  <img 
                    src="/sample-xray.png" 
                    alt="Sample chest X-ray with AI analysis" 
                    className="rounded-lg w-full"
                    // If image doesn't exist, replace with a generic image or placeholder
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/600x400/FFFFFF/2563EB?text=X-Ray+Analysis";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800/50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our clinical decision support system helps radiologists and clinicians make faster, more accurate diagnoses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="AI-Powered Analysis"
              description="Advanced deep learning algorithms trained on thousands of expert-annotated chest X-rays."
              icon={<Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            />
            <FeatureCard
              title="Visualization Tools"
              description="Heatmap overlays highlight regions of interest to improve interpretability."
              icon={<BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            />
            <FeatureCard
              title="Clinical Guidelines"
              description="Evidence-based recommendations tailored to detected findings."
              icon={<Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 shadow-xl">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Ready to enhance your diagnostic workflow?
              </h2>
              <p className="text-blue-100">
                Start using our AI-assisted chest X-ray analysis tool today.
              </p>
            </div>
            <Link
              href={isAuthenticatedUser ? "/analyze" : "/login"}
              className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow hover:bg-blue-50 transition-colors"
            >
              {isAuthenticatedUser ? "Start Analysis" : "Login Now"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
