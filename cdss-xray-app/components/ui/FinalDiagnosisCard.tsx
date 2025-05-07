'use client';

import { ClipboardCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { PatientVitals } from '@/types';

interface DiagnosisProps {
  result: Record<string, any>;
}

const FinalDiagnosisCard: React.FC<DiagnosisProps> = ({ result }) => {
  // Extract diagnosis entries (exclude non-diagnosis fields like age)
  const diagnosisEntries = Object.entries(result)
    .filter(([key]) => !['age', 'severity', 'diagnosisWithVitals', 'treatmentSuggestions', 'vitals'].includes(key))
    .map(([label, confidence]) => ({ label, confidence: Number(confidence) }));
  
  // Find the top prediction (highest confidence)
  const topPrediction = diagnosisEntries.reduce(
    (max, current) => current.confidence > max.confidence ? current : max, 
    { label: '', confidence: 0 }
  );

  // Extract other fields
  const severity = result.severity || getSeverity(topPrediction.label, topPrediction.confidence);
  const diagnosisWithVitals = result.diagnosisWithVitals || '';
  const treatmentSuggestions = result.treatmentSuggestions || [];
  const vitals = result.vitals as PatientVitals | undefined;

  // Helper function to determine severity if not provided in the result
  function getSeverity(label: string, confidence: number): string {
    const lowercaseLabel = label.toLowerCase();
    
    if (['covid-19', 'pneumonia'].includes(lowercaseLabel)) {
      return confidence > 0.6 ? 'High' : 'Moderate';
    } else if (['tuberculosis', 'lung cancer'].includes(lowercaseLabel)) {
      return 'High';
    } else if (lowercaseLabel === 'normal') {
      return 'Low';
    }
    
    return 'Moderate';
  }

  // Safety check to prevent errors if data is missing
  if (!topPrediction || !topPrediction.label) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Final Diagnosis</h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          Insufficient data to display final diagnosis. Please try again.
        </p>
      </div>
    );
  }

  // Severity badge color
  const getSeverityColor = () => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  // Severity icon
  const getSeverityIcon = () => {
    switch (severity) {
      case 'High':
        return <AlertOctagon className="h-5 w-5 mr-1" />;
      case 'Moderate':
        return <AlertTriangle className="h-5 w-5 mr-1" />;
      default:
        return <ClipboardCheck className="h-5 w-5 mr-1" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Final Diagnosis</h3>
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getSeverityColor()}`}>
          {getSeverityIcon()}
          {severity} Severity
        </div>
      </div>

      {/* Main diagnosis */}
      <div className="mb-4">
        <div className="text-lg font-medium mb-1">
          {topPrediction.label} 
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            ({(topPrediction.confidence * 100).toFixed(1)}% confidence)
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          {diagnosisWithVitals || `Based on the X-ray image and any available patient data, the primary diagnosis appears to be ${topPrediction.label}.`}
        </p>
      </div>

      {/* Treatment suggestions */}
      {treatmentSuggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2">Treatment Suggestions</h4>
          <ul className="list-disc pl-5 space-y-1">
            {treatmentSuggestions.map((suggestion: string, index: number) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
              {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vitals summary */}
      {vitals && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium mb-2">Patient Vitals Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
            {/* Patient Information */}
            {vitals.birthdate && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Birthdate:</span>
                <span className="ml-1 font-medium">
                  {new Date(vitals.birthdate).toLocaleDateString()}
                </span>
              </div>
            )}
            {vitals.gender && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                <span className="ml-1 font-medium">
                  {vitals.gender.charAt(0).toUpperCase() + vitals.gender.slice(1)}
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Temperature:</span>
              <span className="ml-1 font-medium">{vitals.temperature}°C</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">BP:</span>
              <span className="ml-1 font-medium">
                {vitals.systolicBP}/
                {vitals.diastolicBP} mmHg
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Heart Rate:</span>
              <span className="ml-1 font-medium">{vitals.heartRate} bpm</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Symptoms:</span>
              <span className="ml-1">
                {[
                  vitals.hasCough ? 'Cough' : null,
                  vitals.hasHeadaches ? 'Headache' : null,
                  !vitals.canSmellTaste ? 'Loss of smell/taste' : null
                ].filter(Boolean).join(', ') || 'None reported'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalDiagnosisCard;