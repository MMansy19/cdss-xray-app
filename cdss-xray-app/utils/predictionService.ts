import { AnalysisResult, PatientVitals } from '../types';
import { getMockAnalysisResult, processMockVitals, isDemoModeSync, isDemoMode } from './mockService';
import { forceEnableDemoMode } from './backendDetection';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

export async function analyzeXray(image?: File, vitals?: PatientVitals): Promise<AnalysisResult> {
  // Check if we should use demo mode
  const demoMode = await isDemoMode();
  if (demoMode) {
    console.log("Running in demo mode - using mock data for analysis");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // If vitals are provided, process with vitals, otherwise return basic analysis
    if (vitals) {
      return processMockVitals(vitals);
    } else {
      return getMockAnalysisResult();
    }
  }

  try { 
    if (!image || !vitals) {
      throw new Error('Both image and vitals are required');
    }

    const formData = new FormData();
    formData.append('image', image);
    
    // Add individual vitals fields as expected by backend
    if (vitals.birthdate) formData.append('birthdate', vitals.birthdate);
    if (vitals.gender) formData.append('gender', vitals.gender);
    if (vitals.systolicBP) formData.append('systolicBP', vitals.systolicBP.toString());
    if (vitals.diastolicBP) formData.append('diastolicBP', vitals.diastolicBP.toString());
    if (vitals.temperature) formData.append('temperature', vitals.temperature.toString());
    if (vitals.heartRate) formData.append('heartRate', vitals.heartRate.toString());
    if (vitals.hasCough !== undefined) formData.append('hasCough', vitals.hasCough.toString());
    if (vitals.hasHeadaches !== undefined) formData.append('hasHeadaches', vitals.hasHeadaches.toString());
    if (vitals.canSmellTaste !== undefined) formData.append('canSmellTaste', vitals.canSmellTaste.toString());

    // Get auth tokens
    const { access_token } = getAuthTokens();
    
    // Create headers with authentication
    const headers = new Headers();
    if (access_token) {
      headers.append('Authorization', `Bearer ${access_token}`);
    } else {
      console.warn('No access token found for authentication');
    }

    // Use AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${API_BASE_URL}/upload-scan`, {
      method: 'POST',
      headers: headers,
      body: formData,
      signal: controller.signal
    }).catch(error => {
      if (error.name === 'AbortError') {
        console.error('Request timed out');
        throw new Error('Backend request timed out. Switching to demo mode.');
      }
      throw error;
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Details:', errorData);
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData) || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing data:", error);
    
    // Auto-enable demo mode if we get a backend error
    if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') || 
        error.message.includes('timed out') ||
        error.message.includes('API error'))) {
      console.log('Backend connection failed. Enabling demo mode for future requests.');
      forceEnableDemoMode();
      
      // Return mock data since we couldn't connect to the backend
      if (vitals) {
        return processMockVitals(vitals);
      } else {
        return getMockAnalysisResult();
      }
    }
    
    throw error;
  }
}

// Function to analyze without submitting results
export async function analyzeOnly(image?: File): Promise<AnalysisResult> {
  // Check if we should use demo mode
  if (await isDemoMode()) {
    console.log("Running in demo mode - using mock data for analysis");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getMockAnalysisResult();
  }
  
  try {
    const formData = new FormData();
    
    // Append image file if provided
    if (image) {
      formData.append('image', image);
      formData.append('analyze_only', 'true');
    }

    // Get auth tokens
    const { access_token } = getAuthTokens();
    
    // Create headers with authentication
    const headers = new Headers();
    if (access_token) {
      headers.append('Authorization', `Bearer ${access_token}`);
    } else {
      console.warn('No access token found for authentication');
    }

    // Use AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${API_BASE_URL}/upload-scan`, {
      method: 'POST',
      headers: headers,
      body: formData,
      signal: controller.signal
    }).catch(error => {
      if (error.name === 'AbortError') {
        console.error('Request timed out');
        throw new Error('Backend request timed out');
      }
      throw error;
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Details:', errorData);
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing data:", error);
    console.log('Falling back to demo mode');
    forceEnableDemoMode();
    
    // Fallback to mock data
    return getMockAnalysisResult();
  }
}

// Function to analyze and submit results
export async function analyzeAndSubmit(image?: File, vitals?: PatientVitals): Promise<AnalysisResult> {
  return analyzeXray(image, vitals);
}

// Keeping these functions for backward compatibility but redirecting to the unified function
export async function analyzeXrayImage(image: File): Promise<AnalysisResult> {
  // Use mock data in demo mode
  if (isDemoModeSync() || await isDemoMode()) {
    console.log("Running in demo mode - using mock data for analysis");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getMockAnalysisResult();
  }
  
  try {
    return await analyzeOnly(image);
  } catch (error) {
    console.error("Error in analyzeXrayImage:", error);
    forceEnableDemoMode();
    return getMockAnalysisResult();
  }
}

export async function analyzeWithVitals(imageId: string, vitals: PatientVitals): Promise<AnalysisResult> {
  // Use mock data in demo mode
  if (isDemoModeSync() || await isDemoMode()) {
    console.log("Running in demo mode - using mock data for vitals analysis");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return processMockVitals(vitals);
  }
  
  try {
    // This would normally call the backend API with the image ID and vitals
    // If no implementation exists, fall back to demo mode
    console.error("API functionality not implemented, using mock data");
    forceEnableDemoMode();
    return processMockVitals(vitals);
  } catch (error) {
    console.error("Error in analyzeWithVitals:", error);
    forceEnableDemoMode();
    return processMockVitals(vitals);
  }
}