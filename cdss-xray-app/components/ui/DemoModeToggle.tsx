'use client';

import { useState, useEffect } from 'react';
import { Beaker } from 'lucide-react';
import { isDemoModeForced, forceEnableDemoMode, disableForcedDemoMode } from '@/utils/backendDetection';
import { isDemoModeSync } from '@/utils/mockService';

const DemoModeToggle = () => {
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);

  // Check initial demo mode status
  useEffect(() => {
    // Check if demo mode is forced via localStorage
    const forced = isDemoModeForced();
    // Check if demo mode is configured via environment
    const configDemo = isDemoModeSync();
    
    setIsDemoActive(forced || configDemo);
  }, []);

  const toggleDemoMode = () => {
    if (isDemoActive) {
      disableForcedDemoMode();
      setIsDemoActive(isDemoModeSync()); // May still be true if set in environment
    } else {
      forceEnableDemoMode();
      setIsDemoActive(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleDemoMode}
          className={`flex items-center text-sm font-medium ${
            isDemoActive 
              ? 'text-blue-500 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
          aria-label={isDemoActive ? 'Disable demo mode' : 'Enable demo mode'}
          title={isDemoActive ? 'Demo mode is active (no backend required)' : 'Enable demo mode (no backend required)'}
        >
          <Beaker className="h-4 w-4 mr-1.5" />
          <span>
            {isDemoActive ? 'Demo Mode: On' : 'Demo Mode: Off'}
          </span>
        </button>
      </div>
      
      {isDemoActive && (
        <div className="mt-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs p-2 rounded-md shadow border border-blue-200 dark:border-blue-800">
          Running in demo mode. No backend server required.
        </div>
      )}
    </div>
  );
};

export default DemoModeToggle;