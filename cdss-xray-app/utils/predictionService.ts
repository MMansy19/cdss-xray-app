import { AnalysisResult, PatientVitals } from '../types';
import { getMockAnalysisResult, processMockVitals, isDemoModeSync } from './mockService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function analyzeXrayImage(imageFile: File): Promise<AnalysisResult> {
  // Use mock data in demo mode
  if (isDemoModeSync()) {
    console.log("Running in demo mode - using mock data for X-ray analysis");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getMockAnalysisResult();
  }

  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/imaging/analyze/`, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies for auth
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing X-ray:", error);
    // Fallback to mock data if API call fails
    return getMockAnalysisResult();
  }
}

export async function analyzeWithVitals(imageId: string, vitals: PatientVitals): Promise<AnalysisResult> {
  // Use mock data in demo mode
  if (isDemoModeSync()) {
    console.log("Running in demo mode - using mock data for vitals analysis");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return processMockVitals(vitals);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/imaging/analyze-with-vitals/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId,
        vitals
      }),
      credentials: 'include', // Include cookies for auth
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing with vitals:", error);
    // Fallback to mock data if API call fails
    return processMockVitals(vitals);
  }
}