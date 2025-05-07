import { AnalysisResult, PatientVitals } from '../types';
import { getMockAnalysisResult, processMockVitals, isDemoModeSync } from './mockService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function analyzeXray(image?: File, vitals?: PatientVitals): Promise<AnalysisResult> {
  // Use mock data in demo mode
  if (isDemoModeSync()) {
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
    const formData = new FormData();
    
    // Append image file if provided
    if (image) {
      formData.append('image', image);
    }
  
    
    // Append vitals if provided
    if (vitals) {
      formData.append('vitals', JSON.stringify(vitals));
    }

    const response = await fetch(`${API_BASE_URL}/upload-scan`, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies for auth
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing data:", error);
    // Fallback to appropriate mock data based on inputs
    return vitals ? processMockVitals(vitals) : getMockAnalysisResult();
  }
}

// Keeping these functions for backward compatibility but redirecting to the unified function
export async function analyzeXrayImage(image: File): Promise<AnalysisResult> {
  return analyzeXray(image);
}

export async function analyzeWithVitals(vitals: PatientVitals): Promise<AnalysisResult> {
  return analyzeXray(undefined, vitals);
}