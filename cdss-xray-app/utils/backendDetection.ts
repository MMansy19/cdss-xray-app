let backendAvailableCache: boolean | null = null;
let checkingBackend = false;
let lastCheckTime = 0;

/**
 * Determines if we should use demo mode based on configuration and backend availability
 */
export const shouldUseDemoMode = async (): Promise<boolean> => {
  const configuredDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE;
  
  // If demo mode is explicitly set to "true", always use demo mode
  if (configuredDemoMode?.toLowerCase() === 'true') {
    return true;
  }
  
  // If demo mode is set to anything other than "auto" and not false, don't use demo mode
  if (configuredDemoMode?.toLowerCase() !== 'auto' && configuredDemoMode?.toLowerCase() !== 'false') {
    return false;
  }
  
  // In "auto" mode or when set to "false" but API_URL is not defined, check if backend is available
  if (!process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL === '') {
    return true; // Always use demo mode if API URL is not set
  }
  
  // In "auto" mode, check if backend is available
  const isBackendAvailable = await checkBackendAvailability();
  return !isBackendAvailable;
};

/**
 * Checks if the backend server is available
 * Uses caching to avoid repeated checks in short timeframes
 */
export const checkBackendAvailability = async (): Promise<boolean> => {
  const now = Date.now();
  const cacheTimeout = 30000; // 30 seconds
  
  // Use cached result if available and not too old
  if (backendAvailableCache !== null && now - lastCheckTime < cacheTimeout && !checkingBackend) {
    return backendAvailableCache;
  }
  
  // Prevent multiple simultaneous checks
  if (checkingBackend) {
    // Wait for the ongoing check to complete (but not too long)
    let waitTime = 0;
    while (checkingBackend && waitTime < 5000) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitTime += 100;
    }
    
    if (backendAvailableCache !== null) {
      return backendAvailableCache;
    }
    return false; // Default to demo mode if check takes too long
  }
  
  checkingBackend = true;
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    // Try the health endpoint first
    const healthEndpoint = `${apiUrl}/health/`;
    
    // Add a short timeout to avoid long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache'
      }
    }).catch(() => null);
    
    clearTimeout(timeoutId);
    
    backendAvailableCache = !!response && response.ok;
    lastCheckTime = Date.now();
    
    // If health endpoint failed, try root API endpoint
    if (!backendAvailableCache) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const rootResponse = await fetch(apiUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        }).catch(() => null);
        
        clearTimeout(timeoutId);
        
        backendAvailableCache = !!rootResponse && (rootResponse.ok || rootResponse.status === 404);
        lastCheckTime = Date.now();
      } catch (error) {
        backendAvailableCache = false;
      }
    }
    
    console.log(`Backend availability check: ${backendAvailableCache ? 'Available' : 'Unavailable'}`);
    return backendAvailableCache;
  } catch (error) {
    console.log('Backend availability check failed:', error);
    backendAvailableCache = false;
    lastCheckTime = Date.now();
    return false;
  } finally {
    checkingBackend = false;
  }
};

/**
 * Get the effective API URL based on backend availability
 */
export const getEffectiveApiUrl = async (): Promise<string | null> => {
  const useDemoMode = await shouldUseDemoMode();
  if (useDemoMode) {
    return null;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
};

/**
 * Force demo mode on by setting localStorage flag
 */
export const forceEnableDemoMode = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('forceDemoMode', 'true');
  }
};

/**
 * Check if demo mode has been manually forced
 */
export const isDemoModeForced = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('forceDemoMode') === 'true';
  }
  return false;
};

/**
 * Disable forced demo mode
 */
export const disableForcedDemoMode = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('forceDemoMode');
  }
};
