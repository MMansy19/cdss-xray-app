import { 
  NetworkError, 
  createErrorFromApiResponse,
  formatErrorForLogging
} from './errorHandling';

import { isDemoMode } from '@/lib/config';

export interface ApiRequestConfig {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  requiresAuth?: boolean;
  formData?: boolean;
  signal?: AbortSignal;
}

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  statusCode: number | null;
  loading: boolean;
}

// Function to get the auth tokens from localStorage
function getAuthTokens(): {access_token: string | null, refresh_token: string | null} {
  if (typeof window !== 'undefined') {
    try {
      // Look for JWT tokens in localStorage
      const tokensStr = localStorage.getItem('authTokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        return {
          access_token: tokens.access_token || null,
          refresh_token: tokens.refresh_token || null
        };
      }
      
      // Fall back to legacy token format if needed
      const legacyToken = localStorage.getItem('authToken');
      if (legacyToken) {
        return {
          access_token: legacyToken,
          refresh_token: null
        };
      }
    } catch (error) {
      console.error('Error retrieving auth tokens:', error);
    }
  }
  return {access_token: null, refresh_token: null};
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiRequest<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
  // First, check if we're in demo mode
  const demoMode = await isDemoMode();
  
  if (demoMode) {
    console.log('[API Client] Backend unavailable, using mock data');
    // Return mock response for this request
    return {
      data: null,
      error: null,
      statusCode: 200,
      loading: false
    };
  }
  
  const {
    endpoint,
    method = 'GET',
    body,
    headers = {},
    timeout = 10000,
    retries = 2,
    requiresAuth = true,
    formData = false,
    signal
  } = config;

  let currentRetry = 0;
  let response = null;
  
  while (currentRetry <= retries) {
    try {
      // Create AbortController for timeout if no signal was provided
      let localAbortController: AbortController | null = null;
      let effectiveSignal = signal;
      
      if (!signal) {
        localAbortController = new AbortController();
        effectiveSignal = localAbortController.signal;
        
        // Setup timeout
        setTimeout(() => {
          if (localAbortController) localAbortController.abort();
        }, timeout);
      }
      
      // Add auth token if needed
      const effectiveHeaders = new Headers(headers);
      
      if (requiresAuth) {
        const { access_token } = getAuthTokens();
        if (access_token) {
          effectiveHeaders.append('Authorization', `Bearer ${access_token}`);
        } else {
          console.warn('[API Client] No access token found for authentication');
        }
      }
      
      // Don't set Content-Type for FormData as it needs to include boundary
      if (!formData && method !== 'GET' && !effectiveHeaders.has('Content-Type')) {
        effectiveHeaders.append('Content-Type', 'application/json');
      }

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: effectiveHeaders,
        signal: effectiveSignal
      };

      // Add body if needed
      if (body && method !== 'GET') {
        requestOptions.body = formData ? body : JSON.stringify(body);
      }

      const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
      console.log(`[API Client] ${method} request to ${url}`);
      
      // Execute the fetch request
      response = await fetch(url, requestOptions);
      
      // Handle successful response
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        
        return {
          data,
          error: null,
          statusCode: response.status,
          loading: false
        };
      } else {
        // Handle error with status code
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Unknown error occurred' };
        }
        
        // Create appropriate error based on status code
        const error = createErrorFromApiResponse(response.status, errorData);
        
        // Log the error with our formatter
        console.error('[API Client] Error response:', formatErrorForLogging(error));
        
        // Check if we should retry based on status code
        if (currentRetry < retries && (response.status >= 500 || response.status === 429)) {
          currentRetry++;
          console.log(`[API Client] Retrying (${currentRetry}/${retries}) after error:`, error.message);
          await new Promise(resolve => setTimeout(resolve, 1000 * currentRetry));
          continue;
        }
        
        // For authentication errors, we might need to handle token refresh or logout
        if (response.status === 401 && requiresAuth) {
          // This could trigger a token refresh flow in the future
          console.warn('[API Client] Authentication failed');
        }
        
        return {
          data: null,
          error,
          statusCode: response.status,
          loading: false
        };
      }
    } catch (error) {
      // Handle network errors and aborts
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('[API Client] Request timed out');
          
          if (currentRetry < retries) {
            currentRetry++;
            console.log(`[API Client] Retrying (${currentRetry}/${retries}) after timeout`);
            await new Promise(resolve => setTimeout(resolve, 1000 * currentRetry));
            continue;
          }
          
          return {
            data: null,
            error: new NetworkError('Request timed out.'),
            statusCode: null,
            loading: false
          };
        }
        
        // For other network errors, retry
        if (currentRetry < retries && (
          error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('network')
        )) {
          currentRetry++;
          console.log(`[API Client] Retrying (${currentRetry}/${retries}) after error:`, error.message);
          await new Promise(resolve => setTimeout(resolve, 1000 * currentRetry));
          continue;
        }
        
        return {
          data: null,
          error: new NetworkError(error.message),
          statusCode: null,
          loading: false
        };
      }
      
      return {
        data: null,
        error: new Error('Unknown error occurred'),
        statusCode: null,
        loading: false
      };
    } finally {
      // Nothing to clean up here as AbortController timers are handled via setTimeout
    }
  }
  
  // This should never happen but TypeScript requires a return
  return {
    data: null,
    error: new Error('Maximum retries exceeded'),
    statusCode: null,
    loading: false
  };
}