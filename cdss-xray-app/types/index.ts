// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  error: string | null;
}

export interface UserProfile {
  username: string;
  name?: string;
  role?: string;
}

// X-ray analysis types
export interface XRayImage {
  file: File;
  preview: string;
}

export interface PredictionResult {
  topPrediction: {
    label: string;
    confidence: number;
  };
  predictions: {
    label: string;
    confidence: number;
  }[];
  heatmapUrl?: string;
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