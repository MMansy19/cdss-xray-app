'use client';

import { FinalDiagnosisResult } from '@/types';
import { ClipboardCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface FinalDiagnosisCardProps {
  result: FinalDiagnosisResult;
}

const FinalDiagnosisCard: React.FC<FinalDiagnosisCardProps> = ({ result }) => {
  // Severity badge color
  const getSeverityColor = () => {
    switch (result.severity) {
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
    switch (result.severity) {
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
        {result.severity && (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getSeverityColor()}`}>
            {getSeverityIcon()}
            {result.severity} Severity
          </div>
        )}
      </div>

      {/* Main diagnosis */}
      <div className="mb-4">
        <div className="text-lg font-medium mb-1">
          {result.topPrediction.label} 
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            ({(result.topPrediction.confidence * 100).toFixed(1)}% confidence)
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          {result.diagnosisWithVitals || 'No additional insights from vitals data.'}
        </p>
      </div>

      {/* Treatment suggestions */}
      {result.treatmentSuggestions && result.treatmentSuggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2">Treatment Suggestions</h4>
          <ul className="list-disc pl-5 space-y-1">
            {result.treatmentSuggestions.map((suggestion, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vitals summary */}
      {result.vitals && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium mb-2">Patient Vitals Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Temperature:</span>
              <span className="ml-1 font-medium">{result.vitals.temperature}°C</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">BP:</span>
              <span className="ml-1 font-medium">{result.vitals.systolicBP}/{result.vitals.diastolicBP} mmHg</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Heart Rate:</span>
              <span className="ml-1 font-medium">{result.vitals.heartRate} bpm</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Symptoms:</span>
              <span className="ml-1">
                {[
                  result.vitals.hasCough ? 'Cough' : null,
                  result.vitals.hasHeadaches ? 'Headache' : null,
                  !result.vitals.canSmellTaste ? 'Loss of smell/taste' : null
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