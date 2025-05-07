import { ApiResponse, FinalDiagnosisResult, PatientVitals, PredictionResponse, PredictionResult, XRayImage } from '@/types';

// Mock API endpoint (replace with actual endpoint when ready)
const API_ENDPOINT = 'https://api.example.com/predict';
const VITALS_API_ENDPOINT = 'https://api.example.com/analyze-with-vitals';

/**
 * Sends an X-ray image to the prediction API
 */
export async function analyzePrediction(image: XRayImage): Promise<PredictionResult> {
  try {
    // For demo purposes, we'll use a mock response
    // In production, replace with actual API call:
    
    /*
    const formData = new FormData();
    formData.append('image', image.file);
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data: ApiResponse<PredictionResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown API error');
    }
    
    return {
      topPrediction: {
        label: data.data.top_prediction.label,
        confidence: data.data.top_prediction.confidence,
      },
      predictions: data.data.predictions,
      heatmapUrl: data.data.heatmap ? `data:image/png;base64,${data.data.heatmap}` : undefined,
    };
    */
    
    // Mock API response for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    
    // Generate random prediction results (for demo only)
    const diseases = ['Pneumonia', 'COVID-19', 'Lung Cancer', 'Normal', 'Tuberculosis'];
    const randomIndex = Math.floor(Math.random() * diseases.length);
    const topLabel = diseases[randomIndex];
    const topConfidence = Math.random() * 0.5 + 0.5; // Between 0.5 and 1.0
    
    const predictions = diseases.map(disease => ({
      label: disease,
      confidence: disease === topLabel ? 
        topConfidence : 
        Math.random() * (disease === 'Normal' ? 0.4 : 0.3)
    })).sort((a, b) => b.confidence - a.confidence);
    
    return {
      topPrediction: {
        label: topLabel,
        confidence: topConfidence
      },
      predictions,
      heatmapUrl: '/sample-heatmap.png', // In a real app, this would be a base64 image
    };
  } catch (error) {
    console.error('Prediction error:', error);
    throw new Error('Failed to analyze X-ray image. Please try again later.');
  }
}

/**
 * Sends patient vitals along with original image data for enhanced diagnosis
 */
export async function submitVitalsForAnalysis(
  originalResult: PredictionResult,
  imageUrl: string,
  vitals: PatientVitals
): Promise<FinalDiagnosisResult> {
  try {
    // In a production environment, this would send the data to your backend API
    /*
    const payload = {
      initialDiagnosis: originalResult,
      imageUrl,
      patientVitals: vitals
    };
    
    const response = await fetch(VITALS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown API error');
    }
    
    return data.data;
    */

    // For demo purposes, we'll simulate an API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a simulated response based on the original result and vitals
    const finalResult: FinalDiagnosisResult = {
      // Copy original prediction data
      ...originalResult,
      
      // Add vitals data
      vitals,
      
      // Add enhanced diagnosis based on vitals
      diagnosisWithVitals: generateEnhancedDiagnosis(originalResult, vitals),
      
      // Add treatment suggestions
      treatmentSuggestions: generateTreatmentSuggestions(originalResult.topPrediction.label, vitals),
      
      // Determine severity based on vitals and prediction
      severity: determineSeverity(originalResult.topPrediction.label, vitals)
    };
    
    return finalResult;
  } catch (error) {
    console.error('Enhanced analysis error:', error);
    throw new Error('Failed to complete enhanced analysis with vitals. Please try again.');
  }
}

// Helper function to generate an enhanced diagnosis based on vitals
function generateEnhancedDiagnosis(result: PredictionResult, vitals: PatientVitals): string {
  const diagnosis = result.topPrediction.label;
  const hasFeatures = [];
  
  // Check vitals for abnormalities
  if (vitals.temperature > 38) hasFeatures.push('fever');
  if (vitals.hasCough) hasFeatures.push('cough');
  if (vitals.heartRate > 100) hasFeatures.push('tachycardia');
  if (!vitals.canSmellTaste) hasFeatures.push('loss of smell/taste');
  if (vitals.hasHeadaches) hasFeatures.push('headaches');
  
  // Generate enhanced diagnosis based on the combination of X-ray and vitals
  switch (diagnosis.toLowerCase()) {
    case 'pneumonia':
      if (vitals.temperature > 38) {
        return `Consistent with bacterial pneumonia given the presence of fever (${vitals.temperature}°C).${
          vitals.hasCough ? ' Productive cough supports this diagnosis.' : ''
        }`;
      } else {
        return `Radiographic findings consistent with pneumonia, though absence of fever suggests possible viral or early-stage infection.`;
      }
    
    case 'covid-19':
      if (!vitals.canSmellTaste) {
        return `Radiographic findings consistent with COVID-19, strongly supported by loss of smell/taste.${
          vitals.temperature > 38 ? ' Fever further increases diagnostic confidence.' : ''
        }`;
      } else {
        return `Radiographic findings suggest COVID-19, though preservation of smell/taste is atypical.`;
      }
      
    case 'tuberculosis':
      return `Radiographic findings consistent with tuberculosis. ${
        vitals.hasCough ? 'Presence of cough is a typical clinical feature.' : ''
      } ${vitals.temperature > 37.5 ? 'Low-grade fever is consistent with TB infection.' : ''}`;
      
    case 'lung cancer':
      return `Radiographic findings concerning for possible malignancy. ${
        !vitals.hasCough ? 'Absence of cough is notable.' : 'Presence of cough warrants further investigation.'
      }`;
      
    case 'normal':
      if (hasFeatures.length > 0) {
        return `X-ray appears normal, though patient presents with ${hasFeatures.join(', ')}, suggesting possible non-pulmonary pathology.`;
      } else {
        return 'Normal chest X-ray with unremarkable vital signs.';
      }
      
    default:
      return `Radiographic findings indicate ${diagnosis}. Clinical correlation with vital signs recommended.`;
  }
}

// Helper function to generate treatment suggestions based on diagnosis and vitals
function generateTreatmentSuggestions(diagnosis: string, vitals: PatientVitals): string[] {
  const suggestions: string[] = [];
  
  switch (diagnosis.toLowerCase()) {
    case 'pneumonia':
      suggestions.push('Consider empiric antibiotic therapy pending culture results');
      if (vitals.temperature > 38.5) {
        suggestions.push('Antipyretics for fever management');
      }
      if (vitals.hasCough) {
        suggestions.push('Consider antitussives if cough is non-productive');
      }
      break;
      
    case 'covid-19':
      suggestions.push('Isolate patient per institutional protocols');
      if (vitals.temperature > 38) {
        suggestions.push('Antipyretics for fever management');
      }
      suggestions.push('Monitor oxygen saturation closely');
      suggestions.push('Consider antiviral therapy based on current guidelines');
      break;
      
    case 'tuberculosis':
      suggestions.push('Initiate airborne isolation precautions');
      suggestions.push('Consult infectious disease for appropriate multi-drug regimen');
      suggestions.push('Notify public health department');
      break;
      
    case 'lung cancer':
      suggestions.push('Refer to oncology for comprehensive evaluation');
      suggestions.push('Consider CT-guided biopsy for definitive diagnosis');
      suggestions.push('Evaluate for metastatic disease');
      break;
      
    case 'normal':
      if (vitals.temperature > 38 || vitals.hasCough || vitals.hasHeadaches || !vitals.canSmellTaste) {
        suggestions.push('Consider non-pulmonary sources for patient symptoms');
        suggestions.push('Follow up in 1-2 weeks if symptoms persist');
      } else {
        suggestions.push('No specific interventions indicated for pulmonary pathology');
      }
      break;
      
    default:
      suggestions.push('Clinical correlation recommended');
      suggestions.push('Consider specialist consultation based on clinical presentation');
  }
  
  return suggestions;
}

// Helper function to determine severity based on the diagnosis and vitals
function determineSeverity(diagnosis: string, vitals: PatientVitals): 'Low' | 'Moderate' | 'High' {
  // Check for severe vital sign abnormalities
  const hasSevereVitals = 
    vitals.temperature > 39.5 || 
    vitals.heartRate > 120 || 
    vitals.systolicBP < 90 ||
    vitals.systolicBP > 180 ||
    vitals.diastolicBP > 110;
    
  // Check for moderate vital sign abnormalities
  const hasModerateVitals =
    (vitals.temperature > 38 && vitals.temperature <= 39.5) ||
    (vitals.heartRate > 100 && vitals.heartRate <= 120) ||
    (vitals.systolicBP < 100 && vitals.systolicBP >= 90) ||
    (vitals.diastolicBP > 90 && vitals.diastolicBP <= 110);
    
  // Determine base severity by diagnosis
  let baseSeverity: 'Low' | 'Moderate' | 'High';
  
  switch (diagnosis.toLowerCase()) {
    case 'pneumonia':
      baseSeverity = 'Moderate';
      break;
    case 'covid-19':
      baseSeverity = 'Moderate';
      break;
    case 'tuberculosis':
      baseSeverity = 'High';
      break;
    case 'lung cancer':
      baseSeverity = 'High';
      break;
    case 'normal':
      baseSeverity = 'Low';
      break;
    default:
      baseSeverity = 'Moderate';
  }
  
  // Adjust severity based on vitals
  if (hasSevereVitals) {
    return 'High';
  } else if (hasModerateVitals && baseSeverity === 'Low') {
    return 'Moderate';
  } else if (baseSeverity === 'High') {
    return 'High';
  }
  
  return baseSeverity;
}