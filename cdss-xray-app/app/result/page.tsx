'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import PredictionCard from '@/components/ui/PredictionCard';
import HeatmapViewer from '@/components/ui/HeatmapViewer';
import RuleBasedAdvice from '@/components/ui/RuleBasedAdvice';
import AlertBanner from '@/components/ui/AlertBanner';
import { ArrowLeft, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Threshold for high-risk alerts (70%)
const HIGH_RISK_THRESHOLD = 0.7;
// Threshold for considering a case normal (both COVID-19 and Pneumonia below this)
const NORMAL_THRESHOLD = 0.3;

export default function ResultPage() {
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [highRiskCondition, setHighRiskCondition] = useState<{ name: string; confidence: number } | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const router = useRouter();

  // Load results from sessionStorage on mount
  useEffect(() => {
    try {
      const storedResult = sessionStorage.getItem('xrayResult');
      const storedImageUrl = sessionStorage.getItem('originalImageUrl');
      
      if (!storedResult || !storedImageUrl) {
        throw new Error('No analysis results found');
      }

      // Parse the JSON result
      const parsedResult = JSON.parse(storedResult);
      
      // Handle both formats - whether the data is directly available or nested in a data property
      const resultData = parsedResult.data ? parsedResult.data : parsedResult;
      
      // Process the results - check for high risk conditions or modify to normal if both below threshold
      const processedResult = processResults(resultData);
      
      setResult(processedResult);
      setOriginalImageUrl(storedImageUrl);
    } catch (error) {
      console.error('Failed to load results:', error);
      // Redirect back to analyze page if no results found
      router.push('/analyze');
    } finally {
      setIsLoading(false);
    }
  }, [router]);
    // Process the results: check high-risk conditions and normalize if needed
  const processResults = (data: any) => {
    // Create a copy of the data that we can modify
    const processedData = { ...data };
    
    // Handle structured result format (from mockService)
    if (data.predictions && Array.isArray(data.predictions)) {
      // Check for high risk conditions in predictions array
      const covidPrediction: { label: string; confidence: number } | undefined = data.predictions.find(
        (p: { label: string; confidence: number }) => p.label === 'COVID-19' || p.label === 'Covid-19'
      );
      const pneumoniaPrediction = data.predictions.find(p => p.label === 'Pneumonia');
      
      if (covidPrediction && covidPrediction.confidence >= HIGH_RISK_THRESHOLD) {
        setHighRiskCondition({ name: 'COVID-19', confidence: covidPrediction.confidence });
      } else if (pneumoniaPrediction && pneumoniaPrediction.confidence >= HIGH_RISK_THRESHOLD) {
        setHighRiskCondition({ name: 'Pneumonia', confidence: pneumoniaPrediction.confidence });
      }
      
      return processedData;
    }
    
    // Handle flat object format
    // Check for COVID-19 with confidence above high-risk threshold
    if (data['Covid-19'] && data['Covid-19'] >= HIGH_RISK_THRESHOLD) {
      setHighRiskCondition({ name: 'COVID-19', confidence: data['Covid-19'] });
      return processedData;
    }
    
    // Check for Pneumonia with confidence above high-risk threshold
    if (data['Pneumonia'] && data['Pneumonia'] >= HIGH_RISK_THRESHOLD) {
      setHighRiskCondition({ name: 'Pneumonia', confidence: data['Pneumonia'] });
      return processedData;
    }
    
    // If both COVID-19 and Pneumonia are below the normal threshold, normalize the results
    const covidValue = data['Covid-19'] || 0;
    const pneumoniaValue = data['Pneumonia'] || 0;
    
    if (covidValue < NORMAL_THRESHOLD && pneumoniaValue < NORMAL_THRESHOLD) {
      // Set the case to normal by boosting the normal prediction
      // We keep the original values but ensure "normal" is the highest
      if (data['Normal']) {
        // Find the current highest value
        const maxValue = Math.max(...Object.values(data));
        // Set normal to be higher than the current max value
        processedData['Normal'] = Math.max(data['Normal'], maxValue + 0.1);
      } else {
        // If there's no normal key yet, add it with a high value
        processedData['Normal'] = 0.9;
      }
    }
    
    return processedData;
  };

  // Generate and download PDF report
  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      
      // Create new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Report header
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.text('X-Ray Analysis Report', 20, 20);
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      
      // Date & Time
      const now = new Date();
      doc.text(`Generated: ${now.toLocaleString()}`, 20, 35);
      
      // Capture the X-ray image
      const reportElement = document.getElementById('report-container');
      const imageElement = document.getElementById('xray-image');
      
      if (imageElement) {
        const canvas = await html2canvas(imageElement, {
          scale: 2,
          logging: false,
          useCORS: true,
        });
        
        // Add the image to the PDF
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        doc.addImage(imageData, 'JPEG', 20, 45, 80, 80);
        
        // Add diagnosis info
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Diagnosis Results', 110, 55);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        
        let y = 65;
        
        // Display top conditions sorted by confidence
        const sortedConditions = Object.entries(result || {})
          .filter(([key]) => !['age'].includes(key))
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3);
        
        sortedConditions.forEach(([condition, confidence], i) => {
          doc.setTextColor(i === 0 ? 41 : 100, i === 0 ? 128 : 100, i === 0 ? 185 : 100);
          doc.setFontSize(i === 0 ? 14 : 12);
          doc.text(`${condition}: ${Math.round(confidence * 100)}%`, 110, y);
          y += 10;
        });
        
        // Clinical recommendations
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Clinical Recommendations', 20, 140);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        
        // Get the top prediction
        const topPrediction = sortedConditions[0];
        if (topPrediction) {
          const [condition, confidence] = topPrediction;
          
          // Add condition-specific advice
          y = 150;
          let advice = '';
          
          if (condition.toLowerCase().includes('covid')) {
            advice = 'Consider COVID-19 protocol. Recommend RT-PCR testing for confirmation. ' + 
                     'If positive, evaluate for supplemental oxygen needs and monitor for clinical deterioration.';
          } else if (condition.toLowerCase().includes('pneumonia')) {
            advice = 'Bacterial pneumonia suspected. Consider antibiotic therapy based on local guidelines. ' +
                     'Evaluate respiratory status and consider sputum culture if available.';
          } else if (condition.toLowerCase() === 'normal') {
            advice = 'No significant radiographic abnormalities detected. Correlate with clinical presentation.';
          } else {
            advice = 'Findings suggest abnormality that may require further investigation. ' +
                     'Consider specialist consultation or additional imaging studies.';
          }
          
          // Apply text wrapping for the advice
          const splitText = doc.splitTextToSize(advice, 170);
          doc.text(splitText, 20, y);
        }
        
        // Disclaimer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('DISCLAIMER: This is an AI-assisted analysis and should be used as a clinical decision support tool only.', 20, 270);
        doc.text('Always correlate with clinical findings and seek specialist consultation as appropriate.', 20, 275);
        
        // Download the PDF
        doc.save(`xray-analysis-${now.toISOString().split('T')[0]}.pdf`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
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
      {/* High risk alert banner for COVID-19 or Pneumonia */}
      {highRiskCondition && (
        <AlertBanner 
          condition={highRiskCondition.name}
          confidence={highRiskCondition.confidence}
        />
      )}
      
      <div id="report-container" className="max-w-6xl mx-auto px-4 py-8">
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
              disabled={isDownloading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? 'Generating...' : 'Download Report'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left column - Image with enhanced heatmap */}
          <div>
            <h2 className="text-xl font-semibold mb-4">X-Ray Image</h2>
            <div id="xray-image">
              <HeatmapViewer 
                originalImageUrl={originalImageUrl} 
                predictionResult={result || undefined}
                className="aspect-square w-full"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
              Toggle the heatmap overlay using the eye icon in the top right corner.
            </p>
          </div>
          
          {/* Right column - Prediction results */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            <PredictionCard result={result || {}} />
          </div>
        </div>

        {/* Clinical advice section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Clinical Guidance</h2>
          <RuleBasedAdvice result={result || {}} />
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