'use client';

import { AnalysisResult } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface PredictionCardProps {
  result: AnalysisResult;
  className?: string;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ result, className = '' }) => {
  const { topPrediction, predictions } = result.data;
  
  // Format prediction data for the chart
  const chartData = predictions.map(pred => ({
    name: pred.label,
    confidence: Math.round(pred.confidence * 100),
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
            {Math.round(topPrediction.confidence * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full bg-blue-600" 
            style={{ width: `${Math.round(topPrediction.confidence * 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Differential Diagnosis
        </h4>
        <div className="h-48">
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
                    fill={entry.name === topPrediction.label ? '#3B82F6' : '#94A3B8'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;