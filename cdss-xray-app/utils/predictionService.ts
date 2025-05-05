import { ApiResponse, PredictionResponse, PredictionResult, XRayImage } from '@/types';

// Mock API endpoint (replace with actual endpoint when ready)
const API_ENDPOINT = 'https://api.example.com/predict';

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