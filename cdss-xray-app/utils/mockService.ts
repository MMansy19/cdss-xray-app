import { AnalysisResult, PatientVitals, User } from '../types';


export const isDemoModeSync = (): boolean => {
  // This uses the cached result from previous async checks
  // If no check has been done yet, assume backend is not available
  if (typeof window === 'undefined') return false;
  
  const cachedStatus = sessionStorage.getItem('backendAvailable');
  if (cachedStatus === null) return true; // Assume demo mode if not checked yet
  
  return cachedStatus !== 'true';
};

// Mock user data for demo mode
const MOCK_USERS: Record<string, User> = {
  'admin': {
    id: 'mock-id-1',
    username: 'admin',
    email: 'admin@example.com',
    name: 'Admin User'
  },
  'doctor': {
    id: 'mock-id-2',
    username: 'doctor',
    email: 'doctor@example.com',
    name: 'Demo Doctor'
  },
  'user': {
    id: 'mock-id-3',
    username: 'user',
    email: 'user@example.com',
    name: 'Regular User'
  }
};

// Password for any mock user in demo mode
const MOCK_PASSWORD = 'password';

/**
 * Mock login for demo mode
 */
export const mockLogin = async (username: string, password: string): Promise<User | null> => {
  // Short delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Check if username exists in mock users and password is correct
  if (MOCK_USERS[username.toLowerCase()] && password === MOCK_PASSWORD) {
    return MOCK_USERS[username.toLowerCase()];
  }
  
  // Special case: any username with the demo password works
  if (password === MOCK_PASSWORD) {
    return {
      id: `mock-id-${Date.now()}`,
      username: username,
      email: `${username}@example.com`,
      name: username
    };
  }
  
  return null;
};

/**
 * Mock register for demo mode
 */
export const mockRegister = async (username: string, email: string, password: string): Promise<User | null> => {
  // Short delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In demo mode, registration always succeeds
  return {
    id: `mock-id-${Date.now()}`,
    username,
    email,
    name: username
  };
};

/**
 * Generate mock analysis result for demo mode
 */
export const generateMockAnalysisResult = (patientVitals?: PatientVitals): AnalysisResult => {
  const conditions = [
    'Pneumonia', 'Atelectasis', 'Cardiomegaly', 
    'Effusion', 'Infiltration', 'Mass', 'Nodule'
  ];

  // Select a random condition as primary finding
  const primaryFinding = conditions[Math.floor(Math.random() * conditions.length)];
  // Maybe add a second finding
  const secondaryFinding = Math.random() > 0.7 ? 
    conditions[Math.floor(Math.random() * conditions.length)] : null;
  
  // Generate random confidence scores
  const primaryConfidence = 0.7 + (Math.random() * 0.29); // Between 70% and 99%
  const secondaryConfidence = secondaryFinding ? 0.5 + (Math.random() * 0.3) : 0; // Between 50% and 80%
  
  // Generate heatmap data (simple format - would be more complex in real app)
  const heatmapData = {
    heatmapUrl: '/placeholder-xray.png',
    regions: [
      {
        x: 100 + Math.floor(Math.random() * 200),
        y: 100 + Math.floor(Math.random() * 200),
        width: 50 + Math.floor(Math.random() * 100),
        height: 50 + Math.floor(Math.random() * 100),
        confidence: primaryConfidence
      }
    ]
  };
  
  // Add second region if there's a secondary finding
  if (secondaryFinding) {
    heatmapData.regions.push({
      x: 150 + Math.floor(Math.random() * 200),
      y: 150 + Math.floor(Math.random() * 200),
      width: 30 + Math.floor(Math.random() * 70),
      height: 30 + Math.floor(Math.random() * 70),
      confidence: secondaryConfidence
    });
  }
  
  return {
    topPrediction: {
      label: primaryFinding,
      confidence: primaryConfidence
    },
    predictions: [
      {
        label: primaryFinding,
        confidence: primaryConfidence
      },
      ...(secondaryFinding ? [{
        label: secondaryFinding,
        confidence: secondaryConfidence
      }] : [])
    ],
    heatmapUrl: heatmapData.heatmapUrl,
    severity: 'Moderate',
    diagnosisWithVitals: patientVitals ? `Diagnosis based on vitals: ${JSON.stringify(patientVitals)}` : undefined,
    treatmentSuggestions: ['Rest', 'Hydration', 'Follow-up in 1 week']
  };
};
