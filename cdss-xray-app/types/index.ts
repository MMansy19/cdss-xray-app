// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  error: string | null;
  tokens: AuthTokens | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
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