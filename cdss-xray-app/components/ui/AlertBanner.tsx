'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AlertBannerProps {
  condition: string;
  confidence: number;
  className?: string;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ 
  condition,
  confidence,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  
  useEffect(() => {
    // Pulse animation effect
    const interval = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!isVisible) return null;
  
  const confidencePercentage = Math.round(confidence * 100);
  
  return (
    <div className={`fixed inset-x-0 top-24 z-50 flex justify-center px-4 pointer-events-none ${className}`}>
      <div className={`
        bg-red-50 dark:bg-red-900 
        border-l-4 border-red-500
        text-red-800 dark:text-red-200
        p-4 rounded-lg shadow-lg max-w-2xl w-full
        transition-all duration-500
        pointer-events-auto
        ${isAnimating ? 'pulse-shadow' : ''}
      `}>
        <div className="flex">
          <div className="shrink-0">
            <AlertTriangle className={`
              h-6 w-6 text-red-500
              ${isAnimating ? 'animate-pulse' : ''}
            `} />
          </div>
          <div className="ml-3">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">
                High Risk: {condition} Detected
              </p>
              <button 
                onClick={() => setIsVisible(false)}
                className="inline-flex text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-auto"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm">
                {condition} has been detected with {confidencePercentage}% confidence. Immediate clinical attention may be required.
              </p>
              <p className="mt-3 text-sm font-medium">
                Additional testing and specialist consultation is recommended.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .pulse-shadow {
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          animation: pulse-animation 2s infinite;
        }
        
        @keyframes pulse-animation {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default AlertBanner;