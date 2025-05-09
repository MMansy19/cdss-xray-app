// Authentication types
export interface AuthState {
  isAuthenticatedUser: boolean;
  user: UserProfile | null;
  error: string | null;
  tokens: AuthTokens | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface User { 
  id: string;
  username: string;
  email: string;
  name: string;
  bio?: string | null;
  birth_date?: string | null;
}

export interface UserProfile {
  username: string;
  name?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  birth_date?: string | null;
  profile_picture?: string | null;
  role?: string;
}

// Login/Register request and response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  birth_date: string | null;
  profile_picture: string | null;
}

// X-ray analysis types
export interface XRayImage {
  file: File;
  preview: string;
}

export interface Prediction {
  label: string;
  confidence: number;
}

export interface AnalysisResultData {
  topPrediction: Prediction;
  predictions: Prediction[];
  heatmapUrl: string;
  severity: "Low" | "Moderate" | "High";
  diagnosisWithVitals?: string;
  treatmentSuggestions?: string[];
}

export interface AnalysisResult {
  topPrediction: Prediction;
  predictions: Prediction[];
  heatmapUrl: string;
  severity: "Low" | "Moderate" | "High";
  diagnosisWithVitals?: string;
  treatmentSuggestions?: string[];
  vitals?: {
    temperature: number;
    systolicBP: number;
    diastolicBP: number;
    heartRate: number;
    birthdate?: string;
    gender?: string;
    hasCough: boolean;
    hasHeadaches: boolean;
    canSmellTaste: boolean;
} 
  
    success?: boolean;
    error?: string;
  }

// Enhanced diagnosis with vitals
export interface FinalDiagnosisResult {
  topPrediction: Prediction;
  predictions?: Prediction[];
  heatmapUrl?: string;
  severity: "Low" | "Moderate" | "High";
  diagnosisWithVitals: string;
  treatmentSuggestions: string[];
  vitals?: {
    temperature: number;
    systolicBP: number;
    diastolicBP: number;
    heartRate: number;
    birthdate?: string;
    gender?: string;
    hasCough: boolean;
    hasHeadaches: boolean;
    canSmellTaste: boolean;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    hasHeadache?: boolean;
  };
  success?: boolean;
  error?: string;
}

// Patient vitals types
export interface PatientVitals {
  temperature: number;  // in Celsius
  systolicBP: number;   // mmHg
  diastolicBP: number;  // mmHg
  heartRate: number;    // bpm
  birthdate: string;    // YYYY-MM-DD format
  gender: string;       // 'male', 'female'
  hasCough: boolean;
  hasHeadaches: boolean;
  canSmellTaste: boolean;
}

export interface TreatmentSuggestion {
  type: string;
  description: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PredictionResponse {
  top_prediction: {
    label: string;
    confidence: number;
  };
  predictions: {
    label: string;
    confidence: number;
  }[];
  heatmap?: string; // base64 encoded image
}

