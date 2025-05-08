let backendAvailableCache: boolean | null = null;
let checkingBackend = false;
let lastCheckTime = 0;

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
    return false;
  }
  
  checkingBackend = true;
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
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
 * Get the API URL
 */
export const getEffectiveApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};
