import { AnalysisResult, PatientVitals, User } from '../types';


/**
 * Keep track of dynamically created users during the session
 */
const dynamicUsers: Record<string, User> = {};

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
  
  // Check if this is a predefined mock user
  if (MOCK_USERS[username.toLowerCase()]) {
    // For predefined users, we still check the password, but only in non-demo environments
    if (process.env.NODE_ENV !== 'production' || password === MOCK_PASSWORD) {
      return MOCK_USERS[username.toLowerCase()];
    }
  }
    // In demo mode, allow login with any username and any password
  // This makes testing easier and removes barriers for users trying the demo
  if (username && password) {
    // Check if this user was dynamically created in this session
    if (dynamicUsers[username.toLowerCase()]) {
      return dynamicUsers[username.toLowerCase()];
    }
    
    // Generate a user profile based on the provided username
    const newUser = {
      id: `mock-id-${Date.now()}`,
      username: username,
      email: username.includes('@') ? username : `${username}@example.com`,
      name: username.charAt(0).toUpperCase() + username.slice(1) // Capitalize first letter
    };
    
    // Store this dynamic user for future logins
    dynamicUsers[username.toLowerCase()] = newUser;
    
    return newUser;
  }
  
  return null;
};

/**
 * Mock register for demo mode
 */
export const mockRegister = async (username: string, email: string, password: string): Promise<User | null> => {
  // Short delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 1000));
    // Check if the username already exists in our mock database or in dynamically created users
  if (MOCK_USERS[username.toLowerCase()] || dynamicUsers[username.toLowerCase()]) {
    // Simulate a validation error for existing username
    // This will be caught and handled by the error handling system
    throw new Error('A user with that username already exists.');
  }
  
  // Create new user
  const newUser = {
    id: `mock-id-${Date.now()}`,
    username,
    email,
    name: username.charAt(0).toUpperCase() + username.slice(1) // Capitalize first letter
  };
  
  // Store this user for future logins
  dynamicUsers[username.toLowerCase()] = newUser;
  
  // In demo mode, registration always succeeds
  return newUser;
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
