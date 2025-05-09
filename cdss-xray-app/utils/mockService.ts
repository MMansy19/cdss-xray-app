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

/**
 * Mock login for demo mode
 */
export const mockLogin = async (username: string, password: string): Promise<User | null> => {
  // Short delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
  if (  dynamicUsers[username.toLowerCase()]) {
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
 * Generate mock analysis result for demo mode with realistic data based on patient vitals
 */
export const generateMockAnalysisResult = (patientVitals?: PatientVitals): AnalysisResult => {
  // Default conditions that can be detected in chest X-rays
  const conditions = [
    'Pneumonia', 'Atelectasis', 'Cardiomegaly', 
    'Pleural Effusion', 'Infiltration', 'Mass', 'Nodule',
    'Pulmonary Edema', 'Emphysema', 'Fibrosis', 
    'Pneumothorax', 'Consolidation', 'COVID-19', 'Normal'
  ];

  let primaryFinding = 'Normal';
  let secondaryFinding = null;
  let severity = 'Mild';
  let treatmentSuggestions = ['Rest', 'Follow-up in 2 weeks if symptoms persist'];
  let primaryConfidence = 0.85 + (Math.random() * 0.14); // Between 85% and 99%
  let secondaryConfidence = 0;

  // If no vitals, generate random findings
  if (!patientVitals) {
    primaryFinding = conditions[Math.floor(Math.random() * conditions.length)];
    secondaryFinding = Math.random() > 0.7 ? 
      conditions.filter(c => c !== primaryFinding)[Math.floor(Math.random() * (conditions.length - 1))] : null;
    secondaryConfidence = secondaryFinding ? 0.6 + (Math.random() * 0.25) : 0;
  } else {
    // Use vitals to generate realistic findings
    
    // Age-based conditions (elderly patients more likely to have certain conditions)
    const age = patientVitals.birthdate ? calculateAge(patientVitals.birthdate) : 45;
    
    // Higher temperature suggests infection
    const hasHighTemperature = patientVitals.temperature && patientVitals.temperature > 38.0;
    
    // Abnormal blood pressure
    const hasHighBP = patientVitals.systolicBP && patientVitals.systolicBP > 140;
    const hasLowBP = patientVitals.systolicBP && patientVitals.systolicBP < 90;
    
    // High heart rate
    const hasTachycardia = patientVitals.heartRate && patientVitals.heartRate > 100;
    
    // Symptom checks
    const hasCough = patientVitals.hasCough;
    const hasHeadaches = patientVitals.hasHeadaches;
    const cannotSmellOrTaste = patientVitals.canSmellTaste === false;
    
    // Clinical decision logic based on vitals and symptoms
    
    // COVID-19 pattern
    if (hasHighTemperature && hasCough && (cannotSmellOrTaste || hasHeadaches)) {
      primaryFinding = 'COVID-19';
      secondaryFinding = Math.random() > 0.5 ? 'Infiltration' : 'Consolidation';
      severity = hasHighBP || hasTachycardia ? 'Moderate to Severe' : 'Moderate';
      treatmentSuggestions = [
        'Isolation for 10 days', 
        'Monitor oxygen saturation',
        'Acetaminophen for fever',
        'Contact healthcare provider if symptoms worsen'
      ];
    } 
    // Pneumonia pattern
    else if (hasHighTemperature && hasCough) {
      primaryFinding = 'Pneumonia';
      secondaryFinding = Math.random() > 0.7 ? 'Pleural Effusion' : null;
      severity = hasTachycardia || hasHighTemperature && patientVitals.temperature > 39.0 ? 'Moderate to Severe' : 'Moderate';
      treatmentSuggestions = [
        'Antibiotics may be indicated',
        'Rest and hydration',
        'Follow-up in 3-5 days',
        'Fever management with acetaminophen'
      ];
    }
    // Heart condition pattern
    else if (hasHighBP && hasTachycardia) {
      primaryFinding = 'Cardiomegaly';
      secondaryFinding = Math.random() > 0.6 ? 'Pulmonary Edema' : null;
      severity = age > 65 ? 'Moderate to Severe' : 'Moderate';
      treatmentSuggestions = [
        'Cardiology consultation',
        'Blood pressure management',
        'Sodium restriction',
        'Follow-up echocardiogram recommended'
      ];
    }
    // Low BP pattern
    else if (hasLowBP && hasTachycardia) {
      primaryFinding = Math.random() > 0.5 ? 'Pneumonia' : 'Pleural Effusion';
      severity = 'Severe';
      treatmentSuggestions = [
        'Consider hospital admission',
        'IV fluid resuscitation may be required',
        'Monitor vitals closely',
        'Urgent medical attention recommended'
      ];
    }
    // Normal or age-related findings
    else {
      if (age > 65 && Math.random() > 0.5) {
        primaryFinding = ['Atelectasis', 'Fibrosis', 'Cardiomegaly'][Math.floor(Math.random() * 3)];
        secondaryFinding = Math.random() > 0.7 ? 'Nodule' : null;
        severity = 'Mild to Moderate';
        treatmentSuggestions = [
          'Follow-up in 3 months',
          'Consider pulmonary function testing',
          'Age-appropriate screening'
        ];      } else {
        primaryFinding = 'Normal';
        // Always add secondary findings with lower confidence for differential diagnosis
        secondaryFinding = 'Nodule'; // Always have at least one secondary finding
        // Add some other conditions to the list of predictions
        const additionalFindings = ['Atelectasis', 'Infiltration', 'Cardiomegaly'];
        severity = 'Normal';
        treatmentSuggestions = [
          'No acute intervention needed',
          'Age-appropriate routine follow-up'
        ];
        primaryConfidence = 0.92 + (Math.random() * 0.07); // Higher confidence for normal findings
      }
    }
    
    secondaryConfidence = secondaryFinding ? 0.65 + (Math.random() * 0.25) : 0;
  }

  // Create a mock canvas for heatmap generation
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Red color for heatmap
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Generate heatmap data based on findings
  const heatmapData = {
    heatmapUrl: canvas.toDataURL('image/png'),
    regions: [] as Array<{x: number, y: number, width: number, height: number, confidence: number}>
  };
  
  // Add primary finding region based on condition
  if (primaryFinding !== 'Normal') {
    const region = getRegionForCondition(primaryFinding);
    region.confidence = primaryConfidence;
    heatmapData.regions.push(region);
  }
  
  // Add secondary finding region if present
  if (secondaryFinding) {
    const region = getRegionForCondition(secondaryFinding);
    region.confidence = secondaryConfidence;
    heatmapData.regions.push(region);
  }
  
  // Generate detailed diagnosis text based on findings and vitals
  let diagnosisText = '';
  if (patientVitals) {
    // Format vitals for display
    const ageText = patientVitals.birthdate ? `${calculateAge(patientVitals.birthdate)} years old` : 'unknown age';
    const genderText = patientVitals.gender || 'unspecified gender';
    const temperatureText = patientVitals.temperature ? `${patientVitals.temperature}°C` : 'temperature not recorded';
    const bpText = patientVitals.systolicBP && patientVitals.diastolicBP ? 
      `blood pressure ${patientVitals.systolicBP}/${patientVitals.diastolicBP} mmHg` : 'blood pressure not recorded';
    const hrText = patientVitals.heartRate ? `heart rate ${patientVitals.heartRate} bpm` : 'heart rate not recorded';
    
    diagnosisText = `${genderText} patient, ${ageText}, presenting with ${temperatureText}, ${bpText}, and ${hrText}. `;
    
    // Add symptom information
    const symptoms = [];
    if (patientVitals.hasCough) symptoms.push('cough');
    if (patientVitals.hasHeadaches) symptoms.push('headaches');
    if (patientVitals.canSmellTaste === false) symptoms.push('loss of smell/taste');
    
    if (symptoms.length > 0) {
      diagnosisText += `Patient reports ${symptoms.join(', ')}. `;
    }
    
    // Add analysis of findings
    diagnosisText += `Chest X-ray shows ${primaryFinding.toLowerCase()}`;
    if (secondaryFinding) {
      diagnosisText += ` with evidence of ${secondaryFinding.toLowerCase()}`;
    }
    diagnosisText += `. Assessment: ${severity} severity.`;
  }
  // Generate additional findings with lower confidence for differential diagnosis
  const additionalPredictions: Array<{label: string, confidence: number}> = [];
  
  // If the primary finding is Normal, always add some differential diagnoses
  if (primaryFinding === 'Normal') {
    // Add a random set of potential findings with low confidence
    const potentialFindings = ['Atelectasis', 'Infiltration', 'Cardiomegaly', 'Nodule', 'Emphysema'];
    // Select 2-3 random findings
    const shuffled = [...potentialFindings].sort(() => 0.5 - Math.random());
    const selectedFindings = shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
    
    selectedFindings.forEach(finding => {
      // Generate low confidence values between 5% and 15%
      const lowConfidence = 0.05 + (Math.random() * 0.1);
      additionalPredictions.push({
        label: finding,
        confidence: lowConfidence
      });
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
      }] : []),
      ...additionalPredictions
    ],
    heatmapUrl: heatmapData.heatmapUrl,
    regions: heatmapData.regions,
    severity,
    diagnosisWithVitals: diagnosisText || undefined,
    treatmentSuggestions
  };
};

/**
 * Helper function to calculate age from birthdate
 */
function calculateAge(birthdate: string): number {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Helper function to generate realistic regions for different conditions
 */
function getRegionForCondition(condition: string): {x: number, y: number, width: number, height: number, confidence: number} {
  // Generate regions based on where these conditions typically appear in chest X-rays
  switch(condition) {
    case 'Pneumonia':
      // Usually affects lower lobes
      return {
        x: 150 + Math.floor(Math.random() * 50),
        y: 250 + Math.floor(Math.random() * 50),
        width: 100 + Math.floor(Math.random() * 50),
        height: 100 + Math.floor(Math.random() * 50),
        confidence: 0.8
      };
    case 'COVID-19':
      // Typically bilateral, peripheral, and basal
      return {
        x: 100 + Math.floor(Math.random() * 50),
        y: 200 + Math.floor(Math.random() * 50),
        width: 150 + Math.floor(Math.random() * 50),
        height: 100 + Math.floor(Math.random() * 50),
        confidence: 0.8
      };
    case 'Cardiomegaly':
      // Enlarged heart, central
      return {
        x: 150 + Math.floor(Math.random() * 30),
        y: 150 + Math.floor(Math.random() * 30),
        width: 120 + Math.floor(Math.random() * 40),
        height: 140 + Math.floor(Math.random() * 40),
        confidence: 0.8
      };
    case 'Pleural Effusion':
      // Usually at the base of the lungs
      return {
        x: 150 + Math.floor(Math.random() * 40),
        y: 300 + Math.floor(Math.random() * 30),
        width: 100 + Math.floor(Math.random() * 40),
        height: 70 + Math.floor(Math.random() * 30),
        confidence: 0.8
      };
    case 'Nodule':
      // Small and can be anywhere
      return {
        x: 100 + Math.floor(Math.random() * 200),
        y: 100 + Math.floor(Math.random() * 200),
        width: 20 + Math.floor(Math.random() * 15),
        height: 20 + Math.floor(Math.random() * 15),
        confidence: 0.8
      };
    case 'Pneumothorax':
      // Usually at the apex
      return {
        x: 150 + Math.floor(Math.random() * 50),
        y: 50 + Math.floor(Math.random() * 50),
        width: 100 + Math.floor(Math.random() * 40),
        height: 80 + Math.floor(Math.random() * 30),
        confidence: 0.8
      };
    default:
      // Default region for other conditions
      return {
        x: 100 + Math.floor(Math.random() * 200),
        y: 100 + Math.floor(Math.random() * 200),
        width: 80 + Math.floor(Math.random() * 80),
        height: 80 + Math.floor(Math.random() * 80),
        confidence: 0.8
      };
  }
}
