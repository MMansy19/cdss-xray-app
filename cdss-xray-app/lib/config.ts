/**
 * Configuration utility for determining app environment mode
 */

/**
 * Checks if the application is running in Demo Mode
 * Demo Mode is enabled when NEXT_PUBLIC_API_URL contains the word "demo" (case insensitive)
 * 
 * @returns {boolean} True if app is in Demo Mode, false if in Live Mode
 */
export function isDemoMode(): boolean {
  // Get API URL from environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  // Check if the URL includes 'demo' (case insensitive)
  return apiUrl.toLowerCase().includes('demo');
}

/**
 * Returns the current API base URL from environment
 * 
 * @returns {string} The API base URL
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}
