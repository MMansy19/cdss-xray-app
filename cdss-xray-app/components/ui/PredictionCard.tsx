'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface PredictionCardProps {
  result: Record<string, any>;
  className?: string;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ result, className = '' }) => {
  // Check if result has predictions array structure or flat object structure
  let diagnosisEntries = [];
  
  if (result.predictions && Array.isArray(result.predictions) && result.predictions.length > 0) {
    // Handle the case where result has predictions array (from mockService)
    diagnosisEntries = result.predictions.map((p: any) => ({
      label: p.label,
      confidence: p.confidence
    }));
    
    // Sort by confidence (highest first)
    diagnosisEntries.sort((a, b) => b.confidence - a.confidence);
  } else {
    // Handle the flat object structure
    diagnosisEntries = Object.entries(result)
      .filter(([key]) => !['age', 'topPrediction', 'predictions', 'heatmapUrl', 'regions', 'severity', 'diagnosisWithVitals', 'treatmentSuggestions', 'vitals'].includes(key))
      .map(([label, confidence]) => ({ label, confidence: Number(confidence) }))
      .sort((a, b) => b.confidence - a.confidence);
  }
  
  // Find the top prediction (highest confidence)
  const topPrediction = diagnosisEntries.reduce(
    (max, current) => current.confidence > max.confidence ? current : max, 
    { label: '', confidence: 0 }
  );
  
  // Ensure confidence is capped at 100% (1.0)
  topPrediction.confidence = Math.min(topPrediction.confidence, 1.0);
    // Format prediction data for the chart  // Make sure we have chart data to display
  // If we're still not getting entries from the main logic, try fallback options
  let chartEntries = diagnosisEntries;
  
  // If the array is empty but there's a topPrediction in the result, use that
  if (diagnosisEntries.length === 0) {
    if (result.topPrediction) {
      chartEntries = [{
        label: result.topPrediction.label,
        confidence: result.topPrediction.confidence
      }];
      
      // If there are also secondary findings, add those
      if (result.predictions && Array.isArray(result.predictions)) {
        // Add other predictions beyond the top one
        const secondaryFindings = result.predictions.filter((p: any) => 
          p.label !== result.topPrediction.label
        );
        
        chartEntries = [...chartEntries, ...secondaryFindings.map((p: any) => ({
          label: p.label,
          confidence: p.confidence
        }))];
      }
    }
  }
  
  // Sort by confidence (highest first)
  chartEntries.sort((a, b) => b.confidence - a.confidence);
    // Generate chart data with consistent formatting
  // Limit to at most 5 items to avoid overcrowding the chart
  const chartData = chartEntries
    .slice(0, 5)  // Only show top 5 predictions
    .map(pred => ({
      name: pred.label,
      confidence: Math.min(Math.round(pred.confidence * 100), 100)
    }));

  // Determine status color based on top prediction
  const getStatusColor = () => {
    const label = topPrediction.label.toLowerCase();
    if (label === 'normal') return 'text-green-500 dark:text-green-400';
    if (label === 'covid-19' || label === 'pneumonia' || label === 'tuberculosis' || label === 'lung cancer') {
      return 'text-red-500 dark:text-red-400';
    }
    return 'text-yellow-500 dark:text-yellow-400';
  };

  // Get status icon based on top prediction
  const getStatusIcon = () => {
    const label = topPrediction.label.toLowerCase();
    if (label === 'normal') {
      return <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />;
    }
    if (label === 'covid-19' || label === 'pneumonia' || label === 'tuberculosis' || label === 'lung cancer') {
      return <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />;
    }
    return <Info className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />;
  };

  // If no predictions are available
  if (diagnosisEntries.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center mb-4">
          <Info className="h-6 w-6 text-blue-500" />
          <h3 className="text-xl font-bold ml-2">No predictions available</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Unable to generate predictions from the provided data.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center mb-4">
        {getStatusIcon()}
        <h3 className={`text-xl font-bold ml-2 ${getStatusColor()}`}>
          {topPrediction.label}
        </h3>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Confidence Level
          </span>
          <span className="text-lg font-bold">
            {Math.min(Math.round(topPrediction.confidence * 100), 100) }%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full bg-blue-600" 
            style={{ width: `${Math.min(Math.round(topPrediction.confidence * 100), 100) }%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Differential Diagnosis
        </h4>      <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip formatter={(value) => [`${value}%`, 'Confidence']} />
              <Bar dataKey="confidence" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === topPrediction.label ? '#3B82F6' : 
                          entry.confidence > 30 ? '#60A5FA' : '#94A3B8'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {result.age && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Patient Age
          </h4>
          <p className="text-lg font-bold">{result.age} years</p>
        </div>
      )}
    </div>
  );
}

export default PredictionCard;    