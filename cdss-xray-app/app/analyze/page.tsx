'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ImageUploader from '@/components/ui/ImageUploader';
import { XRayImage, PredictionResult } from '@/types';
import { analyzePrediction } from '@/utils/predictionService';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function AnalyzePage() {
  const [image, setImage] = useState<XRayImage | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleImageSelect = (uploadedImage: XRayImage | null) => {
    setImage(uploadedImage);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError('Please upload an X-ray image first.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const result = await analyzePrediction(image);
      
      // Store result in sessionStorage for the result page
      sessionStorage.setItem('xrayResult', JSON.stringify(result));
      sessionStorage.setItem('originalImageUrl', image.preview);
      
      // Navigate to result page
      router.push('/result');
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze the image. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analyze Chest X-Ray</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload a chest X-ray image for AI-assisted analysis and clinical decision support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload X-Ray Image</h2>
            <ImageUploader onImageSelect={handleImageSelect} className="mb-6" />
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <button
              onClick={handleAnalyze}
              disabled={!image || isAnalyzing}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze X-Ray
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <ol className="space-y-4 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li>Upload a chest X-ray image using the uploader on the left.</li>
                <li>Ensure the image is clear and properly oriented.</li>
                <li>Click "Analyze X-Ray" to process the image.</li>
                <li>Review the AI predictions and clinical decision support on the results page.</li>
              </ol>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium mb-2">Supported Image Types</h3>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded text-xs font-medium">
                    JPG
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded text-xs font-medium">
                    JPEG
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded text-xs font-medium">
                    PNG
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}