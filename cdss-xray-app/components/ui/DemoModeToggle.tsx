'use client';

import { useState, useEffect } from 'react';
import { isDemoModeForced, forceEnableDemoMode, disableForcedDemoMode } from '@/utils/backendDetection';
import { isDemoModeSync } from '@/utils/mockService';

interface DemoModeToggleProps {
  className?: string;
}

export default function DemoModeToggle({ className = '' }: DemoModeToggleProps) {
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Initialize state on component mount (client-side only)
  useEffect(() => {
    const envDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE?.toLowerCase() === 'true';
    const forcedDemoMode = isDemoModeForced();
    setDemoMode(envDemoMode || forcedDemoMode || isDemoModeSync());
    setMounted(true);
  }, []);

  // Handle toggling demo mode
  const handleToggle = () => {
    if (demoMode) {
      // If turning off demo mode, only disable the forced flag
      // (can't override environment setting)
      disableForcedDemoMode();
      
      // Only update the UI state if it's not forced by environment
      if (process.env.NEXT_PUBLIC_DEMO_MODE?.toLowerCase() !== 'true') {
        setDemoMode(false);
      }
    } else {
      // Enable demo mode
      forceEnableDemoMode();
      setDemoMode(true);
    }
  };

  // Only render on client-side to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label 
        htmlFor="demoModeToggle" 
        className="relative inline-flex cursor-pointer items-center"
      >
        <input
          id="demoModeToggle"
          type="checkbox"
          className="peer sr-only"
          checked={demoMode}
          onChange={handleToggle}
          aria-label="Toggle Demo Mode"
        />
        <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline peer-focus:ring-4 peer-focus:ring-blue-300 dark:bg-gray-700 dark:peer-checked:bg-blue-500 dark:peer-focus:ring-blue-800"></div>
        <span className="ml-2 text-sm font-medium">
          Demo Mode {demoMode ? 'On' : 'Off'}
          {process.env.NEXT_PUBLIC_DEMO_MODE?.toLowerCase() === 'true' && (
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(Forced by environment)</span>
          )}
        </span>
      </label>
    </div>
  );
}