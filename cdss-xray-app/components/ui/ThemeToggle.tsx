'use client';

import { useEffect } from 'react';

// This component now only enforces dark mode without providing a toggle button
const ThemeToggle = () => {
  // Apply dark mode on component mount
  useEffect(() => {
    // Always set to dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // No button is returned since we're not toggling themes anymore
  return null;
};

export default ThemeToggle;