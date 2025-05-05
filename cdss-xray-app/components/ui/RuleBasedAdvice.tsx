'use client';

import { PredictionResult } from '@/types';
import { AlertTriangle, BookOpen, Stethoscope } from 'lucide-react';

interface RuleBasedAdviceProps {
  result: PredictionResult;
  className?: string;
}

const RuleBasedAdvice: React.FC<RuleBasedAdviceProps> = ({ result, className = '' }) => {
  const { topPrediction, predictions } = result;
  
  // Get appropriate advice based on top prediction and confidence level
  const getAdvice = () => {
    const label = topPrediction.label.toLowerCase();
    const confidence = topPrediction.confidence;
    
    // Normal case
    if (label === 'normal') {
      if (confidence > 0.9) {
        return {
          title: 'No Significant Findings',
          description: 'The chest X-ray appears normal with high confidence. No further imaging studies are indicated unless clinically warranted.',
          icon: <Stethoscope className="h-5 w-5 text-green-500" />,
          recommendations: [
            'Regular follow-up as appropriate for patient age and risk factors',
            'Consider annual chest X-ray for patients with smoking history or occupational exposures'
          ]
        };
      } else {
        return {
          title: 'Likely Normal',
          description: 'The chest X-ray appears mostly normal, but with modest confidence. Consider clinical correlation.',
          icon: <Stethoscope className="h-5 w-5 text-yellow-500" />,
          recommendations: [
            'Correlate with patient symptoms',
            'Consider follow-up imaging in 3-6 months if clinically indicated',
            'Consider further evaluation if symptomatic'
          ]
        };
      }
    }
    
    // COVID-19 case
    if (label === 'covid-19') {
      if (confidence > 0.8) {
        return {
          title: 'High Probability of COVID-19',
          description: 'The findings strongly suggest COVID-19 pneumonia. Bilateral, peripheral, and basal predominant ground-glass opacities are typical.',
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          recommendations: [
            'Confirm with PCR or antigen testing if not already done',
            'Consider isolation protocols as per institutional guidelines',
            'Evaluate oxygen saturation and respiratory status',
            'Consider CT scan for patients with severe symptoms or deteriorating condition'
          ]
        };
      } else {
        return {
          title: 'Possible COVID-19',
          description: 'Some findings suggestive of COVID-19 pneumonia, but lower confidence. Consider other viral pneumonias in differential.',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          recommendations: [
            'Confirm with PCR or antigen testing',
            'Consider other viral pneumonia etiologies',
            'Follow up imaging in 24-48 hours if clinical condition worsens',
            'Monitor oxygen saturation'
          ]
        };
      }
    }
    
    // Pneumonia case
    if (label === 'pneumonia') {
      if (confidence > 0.8) {
        return {
          title: 'High Probability of Bacterial Pneumonia',
          description: 'Findings consistent with bacterial pneumonia. Lobar consolidation with air bronchograms is typical.',
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          recommendations: [
            'Consider empiric antibiotic therapy based on local guidelines',
            'Obtain sputum culture if possible before initiating antibiotics',
            'Assess for pleural effusion and consider thoracentesis if present',
            'Consider hospital admission based on CURB-65 or PSI score'
          ]
        };
      } else {
        return {
          title: 'Possible Pneumonia',
          description: 'Some findings suggestive of pneumonia, but with lower confidence.',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          recommendations: [
            'Correlate with clinical symptoms and laboratory findings',
            'Consider sputum culture and sensitivity',
            'Follow up imaging in 2-3 days if outpatient management',
            'Consider bronchoscopy if persistent infiltrate or recurrent pneumonia'
          ]
        };
      }
    }
    
    // Tuberculosis case
    if (label === 'tuberculosis') {
      if (confidence > 0.8) {
        return {
          title: 'High Probability of Tuberculosis',
          description: 'Findings highly suggestive of pulmonary tuberculosis. Upper lobe cavitary lesions and/or nodular infiltrates are typical.',
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          recommendations: [
            'Obtain sputum for AFB smear and TB PCR',
            'Consider respiratory isolation',
            'Consult infectious disease specialist',
            'Screen close contacts as per public health guidelines'
          ]
        };
      } else {
        return {
          title: 'Possible Tuberculosis',
          description: 'Some findings concerning for tuberculosis, but with lower confidence.',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          recommendations: [
            'Obtain sputum for AFB smear and culture',
            'Consider QuantiFERON or tuberculin skin test',
            'Consider CT chest for better characterization',
            'Review risk factors and history of exposure'
          ]
        };
      }
    }
    
    // Lung Cancer case
    if (label === 'lung cancer') {
      if (confidence > 0.8) {
        return {
          title: 'Suspicious for Malignancy',
          description: 'Findings concerning for primary lung malignancy. Spiculated mass or nodule with associated lymphadenopathy.',
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          recommendations: [
            'Urgent CT chest with contrast',
            'Consider PET-CT for staging',
            'Pulmonology or thoracic surgery consult for tissue diagnosis',
            'Evaluate for metastatic disease'
          ]
        };
      } else {
        return {
          title: 'Indeterminate Pulmonary Nodule/Mass',
          description: 'Findings concerning for possible malignancy, but with lower confidence.',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          recommendations: [
            'CT chest with contrast',
            'Consider PET-CT if > 8mm solid nodule',
            'Review prior imaging if available',
            'Follow Fleischner Society guidelines for pulmonary nodule follow-up'
          ]
        };
      }
    }
    
    // Default case for other predictions
    return {
      title: 'Indeterminate Findings',
      description: 'The findings are non-specific and may require further evaluation.',
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      recommendations: [
        'Correlate with clinical symptoms and laboratory findings',
        'Consider additional imaging studies based on clinical suspicion',
        'Follow up chest X-ray in 4-6 weeks to assess for resolution or progression',
        'Consider pulmonology consultation if persistent abnormalities'
      ]
    };
  };
  
  const advice = getAdvice();
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center mb-4">
        {advice.icon}
        <h3 className="text-xl font-bold ml-2">
          {advice.title}
        </h3>
      </div>
      
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        {advice.description}
      </p>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Recommendations
        </h4>
        <ul className="space-y-2">
          {advice.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 mt-0.5 text-blue-500 dark:text-blue-400">•</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          Note: This is decision support only. Clinical judgment should always supersede automated predictions.
        </p>
      </div>
    </div>
  );
};

export default RuleBasedAdvice;