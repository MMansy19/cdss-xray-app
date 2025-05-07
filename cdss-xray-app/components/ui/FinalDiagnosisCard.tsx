'use client';

import { FinalDiagnosisResult } from '@/types';
import { ClipboardCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface FinalDiagnosisCardProps {
  result: FinalDiagnosisResult;
}

const FinalDiagnosisCard: React.FC<FinalDiagnosisCardProps> = ({ result }) => {
  // Extract data from result
  const topPrediction = result.topPrediction;
  const severity = result.severity;
  const diagnosisWithVitals = result.diagnosisWithVitals;
  const treatmentSuggestions = result.treatmentSuggestions || [];
  const vitals = result.vitals;

  // Safety check to prevent errors if data is missing
  if (!topPrediction || !severity) {
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
          {diagnosisWithVitals || 'No additional insights from vitals data.'}
        </p>
      </div>

      {/* Treatment suggestions */}
      {treatmentSuggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2">Treatment Suggestions</h4>
          <ul className="list-disc pl-5 space-y-1">
            {treatmentSuggestions.map((suggestion, index) => (
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
                {vitals.systolicBP || vitals.bloodPressureSystolic}/
                {vitals.diastolicBP || vitals.bloodPressureDiastolic} mmHg
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
                  vitals.hasHeadaches || vitals.hasHeadache ? 'Headache' : null,
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