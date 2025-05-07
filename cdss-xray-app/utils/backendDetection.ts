let backendAvailableCache: boolean | null = null;
let checkingBackend = false;

/**
 * Determines if we should use demo mode based on configuration and backend availability
 */
export const shouldUseDemoMode = async (): Promise<boolean> => {
  const configuredDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE;
  
  // If demo mode is explicitly set to "true", always use demo mode
  if (configuredDemoMode?.toLowerCase() === 'true') {
    return true;
  }
  
  // If demo mode is set to anything other than "auto", don't use demo mode
  if (configuredDemoMode?.toLowerCase() !== 'auto') {
    return false;
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
  // Use cached result if available and not too old (less than 30 seconds)
  if (backendAvailableCache !== null && !checkingBackend) {
    return backendAvailableCache;
  }
  
  // Prevent multiple simultaneous checks
  if (checkingBackend) {
    // Wait for the ongoing check to complete
    while (checkingBackend) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return backendAvailableCache !== null ? backendAvailableCache : false;
  }
  
  checkingBackend = true;
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const healthEndpoint = `${apiUrl}/health/` || `${apiUrl}/health-check/`;
    
    // Add a short timeout to avoid long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      signal: controller.signal,
      // No-cache to ensure we get fresh response
      headers: {
        'Cache-Control': 'no-cache'
      }
    }).catch(() => null);
    
    clearTimeout(timeoutId);
    
    backendAvailableCache = !!response && response.ok;
    
    // Clear the cache after 30 seconds to check again
    setTimeout(() => {
      backendAvailableCache = null;
    }, 30000);
    
    return backendAvailableCache;
  } catch (error) {
    console.log('Backend availability check failed:', error);
    backendAvailableCache = false;
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
