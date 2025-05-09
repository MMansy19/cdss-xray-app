import { AnalysisResult, PatientVitals } from '../types';
import { apiRequest } from './apiClient';
import {  generateMockAnalysisResult } from './mockService';
import { isDemoMode } from '@/lib/config';

/**
 * Analyzes an X-ray image and patient vitals by sending them to the backend API
 * Falls back to mock data generation when backend is unavailable
 */
export async function analyzeXray(image?: File, vitals?: PatientVitals): Promise<AnalysisResult> {
  try {
    if (!image || !vitals) {
      throw new Error('Both image and vitals are required');
    }

    // Check if we're in demo mode (backend unavailable)
    const usingDemoMode = await isDemoMode();
    
    if (usingDemoMode) {
      // Generate mock analysis result
      console.log('[X-ray Service] Using mock analysis data (demo mode)');
      
      // Add a delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return mock data
      return generateMockAnalysisResult(vitals);
    }
    
    // If not in demo mode, proceed with real API call
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
      endpoint: '/api/upload-scan',
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
    
    // If there's an error with the real API, fall back to mock data as a last resort
    console.log("[X-ray Service] Falling back to mock data due to API error");
    return generateMockAnalysisResult(vitals);
  }
}

export const analyzeAndSubmit = analyzeXray;