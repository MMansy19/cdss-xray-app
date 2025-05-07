'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import PredictionCard from '@/components/ui/PredictionCard';
import HeatmapViewer from '@/components/ui/HeatmapViewer';
import RuleBasedAdvice from '@/components/ui/RuleBasedAdvice';
import PatientVitalsForm from '@/components/ui/PatientVitalsForm';
import FinalDiagnosisCard from '@/components/ui/FinalDiagnosisCard';
import { FinalDiagnosisResult, PatientVitals, AnalysisResult } from '@/types';
import { ArrowLeft, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { analyzeWithVitals } from '@/utils/predictionService';

export default function ResultPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmittingVitals, setIsSubmittingVitals] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<FinalDiagnosisResult | null>(null);
  const [showVitalsForm, setShowVitalsForm] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load results from sessionStorage on mount
  useEffect(() => {
    try {
      const storedResult = sessionStorage.getItem('xrayResult');
      const storedImageUrl = sessionStorage.getItem('originalImageUrl');
      
      if (!storedResult || !storedImageUrl) {
        throw new Error('No analysis results found');
      }
      
      setResult(JSON.parse(storedResult));
      setOriginalImageUrl(storedImageUrl);
    } catch (error) {
      console.error('Failed to load results:', error);
      // Redirect back to analyze page if no results found
      router.push('/analyze');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Handle patient vitals submission
  const handleVitalsSubmit = async (vitals: PatientVitals) => {
    if (!result || !originalImageUrl) return;
    
    setIsSubmittingVitals(true);
    setError(null);
    
    try {
      // Using the imageId from result object (assuming it exists) or using a hardcoded value as fallback
      const imageId = (result as any)?.data?.imageId || 'temp-image-id';
      
      const enhancedResult = await analyzeWithVitals(imageId, vitals);
      
      setFinalResult(enhancedResult);
      setShowVitalsForm(false); // Collapse form after successful submission
      
      // Store the final result in session storage for persistence
      sessionStorage.setItem('finalXrayResult', JSON.stringify(enhancedResult));
    } catch (error) {
      console.error('Vitals submission error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmittingVitals(false);
    }
  };

  // Handle PDF download (mock functionality)
  const handleDownloadReport = () => {
    // In a real app, this would generate a PDF report
    alert('PDF download functionality would be implemented here.');
  };

  const toggleVitalsForm = () => {
    setShowVitalsForm(prev => !prev);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-blue-200 dark:bg-blue-900/40"></div>
            <div className="mt-4 h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!result) {
    return (
      <ProtectedRoute>
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No Results Found</h1>
          <p className="mb-6">Please upload and analyze an X-ray image first.</p>
          <Link 
            href="/analyze"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Analysis Page
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">X-Ray Analysis Results</h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI-assisted analysis and clinical decision support
            </p>
          </div>
          <div className="flex space-x-3">
            <Link 
              href="/analyze"
              className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Analysis
            </Link>
            <button
              onClick={handleDownloadReport}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left column - Image with heatmap */}
          <div>
            <h2 className="text-xl font-semibold mb-4">X-Ray Image</h2>
            <HeatmapViewer 
              originalImageUrl={originalImageUrl} 
              heatmapUrl={result.data?.heatmapUrl || ''}
              className="aspect-square w-full"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
              Toggle the heatmap overlay using the eye icon in the top right corner.
            </p>
          </div>
          
          {/* Right column - Prediction results */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            <PredictionCard result={result} />
          </div>
        </div>


        {/* Patient Vitals Form Section */}
        <div className="mb-8">
          <div
            className="flex justify-between items-center cursor-pointer mb-4"
            onClick={toggleVitalsForm}
          >
            <h2 className="text-xl font-semibold">
              {finalResult ? 'Submitted Patient Vitals' : 'Add Patient Vitals'}
            </h2>
            <button
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              aria-label={showVitalsForm ? 'Hide vitals form' : 'Show vitals form'}
            >
              {showVitalsForm ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>

          {showVitalsForm && (
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add patient vitals and symptoms to enhance diagnostic accuracy and receive tailored treatment recommendations.
              </p>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <PatientVitalsForm
                onSubmit={handleVitalsSubmit}
                isSubmitting={isSubmittingVitals}
              />
            </div>
          )}

          {/* Final Diagnosis Results (shown after vitals submission) */}
          {finalResult && (
            <div className="mt-6 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-4">Enhanced Diagnostic Results</h2>
              <FinalDiagnosisCard result={finalResult} />
            </div>
          )}
        </div>


        {/* Clinical advice section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Clinical Guidance</h2>
          <RuleBasedAdvice result={result} />
        </div>
        

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>Disclaimer:</strong> This system is intended as a clinical decision support tool only. 
            The suggestions provided are not a substitute for professional medical judgment. 
            Always correlate with clinical findings and seek specialist consultation as appropriate.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}