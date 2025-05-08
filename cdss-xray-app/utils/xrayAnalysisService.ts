import { AnalysisResult, PatientVitals } from '../types';
import { apiRequest } from './apiClient';
import { getMockAnalysisResult, processMockVitals, isDemoMode, isDemoModeSync } from './mockService';

/**
 * Analyzes an X-ray image and patient vitals by sending them to the backend API
 * Falls back to demo mode if the backend is unavailable
 */
export async function analyzeXray(image?: File, vitals?: PatientVitals): Promise<AnalysisResult> {
  // Check if we should use demo mode
  const demoMode = isDemoModeSync() || await isDemoMode();
  if (demoMode) {
    console.log("[X-ray Service] Running in demo mode - using mock data for analysis");
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

    const response = await apiRequest<AnalysisResult>({
      endpoint: '/upload-scan',
      method: 'POST',
      body: formData,
      formData: true,
      requiresAuth: true
    });

    if (response.error) {
      throw response.error;
    }

    return response.data as AnalysisResult;
  } catch (error) {
    console.error("[X-ray Service] Error analyzing data:", error);
    
    if (error instanceof Error && error.message === 'DEMO_MODE_ENABLED') {
      // If demo mode is enabled, return mock data
      if (vitals) {
        return processMockVitals(vitals);
      } else {
        return getMockAnalysisResult();
      }
    }
    
    // For other errors, also fall back to demo mode
    if (vitals) {
      return processMockVitals(vitals);
    } else {
      return getMockAnalysisResult();
    }
  }
}

/**
 * Analyzes an X-ray image without patient vitals
 */
export async function analyzeOnly(image?: File): Promise<AnalysisResult> {
  // Check if we should use demo mode
  if (isDemoModeSync() || await isDemoMode()) {
    console.log("[X-ray Service] Running in demo mode - using mock data for analysis");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getMockAnalysisResult();
  }
  
  try {
    if (!image) {
      throw new Error('Image is required');
    }
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('analyze_only', 'true');

    const response = await apiRequest<AnalysisResult>({
      endpoint: '/upload-scan',
      method: 'POST',
      body: formData,
      formData: true,
      requiresAuth: true
    });

    if (response.error) {
      throw response.error;
    }

    return response.data as AnalysisResult;
  } catch (error) {
    console.error("[X-ray Service] Error analyzing image:", error);
    
    if (error instanceof Error && error.message === 'DEMO_MODE_ENABLED') {
      // Already in demo mode, return mock data
      return getMockAnalysisResult();
    }
    
    // Fall back to mock data for other errors
    return getMockAnalysisResult();
  }
}

// Legacy compatibility functions that use the new unified functions
export const analyzeAndSubmit = analyzeXray;
export const analyzeXrayImage = analyzeOnly;

/**
 * Analyzes patient vitals with a previously uploaded X-ray image ID
 */
export async function analyzeWithVitals(imageId: string, vitals: PatientVitals): Promise<AnalysisResult> {
  // Use mock data in demo mode
  if (isDemoModeSync() || await isDemoMode()) {
    console.log("[X-ray Service] Running in demo mode - using mock data for vitals analysis");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return processMockVitals(vitals);
  }
  
  try {
    const response = await apiRequest<AnalysisResult>({
      endpoint: '/analyze-vitals',
      method: 'POST',
      body: {
        imageId,
        ...vitals
      },
      requiresAuth: true
    });

    if (response.error) {
      throw response.error;
    }

    return response.data as AnalysisResult;
  } catch (error) {
    console.error("[X-ray Service] Error analyzing vitals:", error);
    
    if (error instanceof Error && error.message === 'DEMO_MODE_ENABLED') {
      // Already in demo mode, return mock data
      return processMockVitals(vitals);
    }
    
    // Fall back to mock data for other errors
    return processMockVitals(vitals);
  }
}