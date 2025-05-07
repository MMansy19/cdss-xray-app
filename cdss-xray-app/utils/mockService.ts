import { AnalysisResult, PatientVitals } from '../types';
import { shouldUseDemoMode } from './backendDetection';

// Sample heatmap image as base64 string (replace with actual sample image)
const sampleHeatmapBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

// Sample prediction data
export const getMockAnalysisResult = (): AnalysisResult => {
  return {
    success: true,
    data: {
      topPrediction: {
        label: "Pneumonia",
        confidence: 0.89
      },
      predictions: [
        { label: "Pneumonia", confidence: 0.89 },
        { label: "COVID-19", confidence: 0.45 },
        { label: "Normal", confidence: 0.12 }
      ],
      heatmapUrl: sampleHeatmapBase64,
      severity: "Moderate",
      diagnosisWithVitals: "Demo mode: This would show a diagnosis based on X-ray and vitals.",
      treatmentSuggestions: [
        "Demo mode: Antibiotic therapy example",
        "Demo mode: Follow-up recommendations",
        "Demo mode: Supportive care suggestions"
      ]
    }
  };
};

// Process vitals in demo mode
export const processMockVitals = (vitals: PatientVitals): AnalysisResult => {
  const mockResult = getMockAnalysisResult();
  
  // Adjust severity based on temperature (simple demo logic)
  if (vitals.temperature > 38.5) {
    mockResult.data.severity = "High";
    mockResult.data.diagnosisWithVitals = `Demo mode: High fever (${vitals.temperature}°C) with pneumonia findings suggests severe infection.`;
  } else if (vitals.temperature > 37.5) {
    mockResult.data.severity = "Moderate";
    mockResult.data.diagnosisWithVitals = `Demo mode: Mild fever (${vitals.temperature}°C) with pneumonia findings suggests moderate infection.`;
  } else {
    mockResult.data.severity = "Low";
    mockResult.data.diagnosisWithVitals = `Demo mode: Normal temperature with pneumonia findings suggests early or resolving infection.`;
  }

  // Add cough-related info if present
  if (vitals.hasCough) {
    mockResult.data.diagnosisWithVitals += " Productive cough supports this diagnosis.";
  }

  return mockResult;
};

// Async version that uses the backend detection
export const isDemoMode = async (): Promise<boolean> => {
  return await shouldUseDemoMode();
};

// Synchronous version for places where async isn't suitable
// This will use a simpler check without the backend availability test
export const isDemoModeSync = (): boolean => {
  const configuredDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE;
  
  // If explicitly set to true, use demo mode
  if (configuredDemoMode?.toLowerCase() === 'true') {
    return true;
  }
  
  // If explicitly set to false, don't use demo mode
  if (configuredDemoMode?.toLowerCase() === 'false') {
    return false;
  }
  
  // In "auto" mode or undefined, default to true if no API URL is set (safer)
  return !process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL === '';
};
