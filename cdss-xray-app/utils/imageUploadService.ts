'use client';

import { useAuth } from '@/hooks/useAuth';

export interface XRayImage {
  file: File;
  preview: string;
}

export interface UploadProgressData {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
}

export interface AnalysisResult {
  id: string;
  imageUrl: string;
  predictions: Array<{
    label: string;
    probability: number;
  }>;
  heatmapUrl?: string;
  createdAt: string;
}

export const useImageUploadService = () => {
  const { uploadImage, getImageResults, isAuthenticated } = useAuth();

  // Check authentication before any operation
  const checkAuth = () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required to use image service');
    }
  };

  // Upload an X-ray image
  const uploadXRayImage = async (
    image: XRayImage,
    onProgress?: (data: UploadProgressData) => void
  ): Promise<string> => {
    checkAuth();
    
    try {
      // Start with initial progress info
      onProgress?.({ progress: 0, status: 'uploading', message: 'Starting upload...' });
      
      // Upload the image
      const result = await uploadImage(
        image.file, 
        '/imaging/upload/', 
        (progress) => {
          onProgress?.({ 
            progress, 
            status: 'uploading', 
            message: progress === 100 ? 'Upload complete, processing...' : `Uploading: ${progress}%` 
          });
        }
      );
      
      // Set processing status when upload completes
      onProgress?.({ progress: 100, status: 'processing', message: 'Processing image...' });
      
      // Return the image ID from the response
      return result.id;
    } catch (error) {
      // Handle upload errors
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      onProgress?.({ progress: 0, status: 'error', message });
      throw error;
    }
  };

  // Get analysis results for a previously uploaded image
  const getAnalysisResults = async (imageId: string): Promise<AnalysisResult> => {
    checkAuth();
    
    try {
      const result = await getImageResults(imageId, '/imaging/results');
      
      return {
        id: result.id,
        imageUrl: result.image_url,
        predictions: result.predictions.map((p: any) => ({
          label: p.label,
          probability: p.probability
        })),
        heatmapUrl: result.heatmap_url,
        createdAt: result.created_at
      };
    } catch (error) {
      console.error('Error fetching analysis results:', error);
      throw error;
    }
  };

  // Poll for analysis results until they're ready
  const pollForResults = async (
    imageId: string, 
    onProgress?: (data: UploadProgressData) => void, 
    maxAttempts = 30, 
    interval = 2000
  ): Promise<AnalysisResult> => {
    checkAuth();
    
    let attempts = 0;
    
    const poll = async (): Promise<AnalysisResult> => {
      try {
        // Update progress
        onProgress?.({ 
          progress: Math.min(90, Math.floor((attempts / maxAttempts) * 100)), 
          status: 'processing', 
          message: 'Processing image...' 
        });
        
        // Try to get results
        const result = await getAnalysisResults(imageId);
        
        // If we got here, results are ready
        onProgress?.({ progress: 100, status: 'complete', message: 'Analysis complete!' });
        return result;
      } catch (error) {
        attempts++;
        
        if (attempts >= maxAttempts) {
          onProgress?.({ 
            progress: 100, 
            status: 'error', 
            message: 'Analysis timed out. Please try again.' 
          });
          throw new Error('Analysis timed out after multiple attempts');
        }
        
        // Wait and try again
        await new Promise(resolve => setTimeout(resolve, interval));
        return poll();
      }
    };
    
    return poll();
  };

  // Upload and wait for analysis in one function
  const uploadAndAnalyze = async (
    image: XRayImage,
    onProgress?: (data: UploadProgressData) => void
  ): Promise<AnalysisResult> => {
    const imageId = await uploadXRayImage(image, onProgress);
    return pollForResults(imageId, onProgress);
  };

  return {
    uploadXRayImage,
    getAnalysisResults,
    pollForResults,
    uploadAndAnalyze
  };
};

export default useImageUploadService;