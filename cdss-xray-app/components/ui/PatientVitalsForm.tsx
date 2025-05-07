'use client';

import { useState } from 'react';
import { PatientVitals } from '@/types';
import { AlertCircle } from 'lucide-react';

interface PatientVitalsFormProps {
  onSubmit: (vitals: PatientVitals) => void;
  isSubmitting: boolean;
}

const PatientVitalsForm: React.FC<PatientVitalsFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<PatientVitals>({
    temperature: 37,
    systolicBP: 120,
    diastolicBP: 80,
    heartRate: 75,
    hasCough: false,
    hasHeadaches: false,
    canSmellTaste: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Temperature validation (35-42°C is a reasonable range)
    if (formData.temperature < 35 || formData.temperature > 42) {
      newErrors.temperature = 'Temperature should be between 35-42°C';
    }
    
    // Blood pressure validation
    if (formData.systolicBP < 70 || formData.systolicBP > 220) {
      newErrors.systolicBP = 'Systolic BP should be between 70-220 mmHg';
    }
    
    if (formData.diastolicBP < 40 || formData.diastolicBP > 130) {
      newErrors.diastolicBP = 'Diastolic BP should be between 40-130 mmHg';
    }
    
    // Heart rate validation (40-220 bpm covers most clinical scenarios)
    if (formData.heartRate < 40 || formData.heartRate > 220) {
      newErrors.heartRate = 'Heart rate should be between 40-220 bpm';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Numeric Vitals</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium mb-1">
              Temperature (°C)
            </label>
            <input
              type="number"
              id="temperature"
              name="temperature"
              step="0.1"
              value={formData.temperature}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 ${
                errors.temperature ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.temperature && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.temperature}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="systolicBP" className="block text-sm font-medium mb-1">
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                id="systolicBP"
                name="systolicBP"
                value={formData.systolicBP}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 ${
                  errors.systolicBP ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.systolicBP && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.systolicBP}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="diastolicBP" className="block text-sm font-medium mb-1">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                id="diastolicBP"
                name="diastolicBP"
                value={formData.diastolicBP}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 ${
                  errors.diastolicBP ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.diastolicBP && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.diastolicBP}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="heartRate" className="block text-sm font-medium mb-1">
              Heart Rate (bpm)
            </label>
            <input
              type="number"
              id="heartRate"
              name="heartRate"
              value={formData.heartRate}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 ${
                errors.heartRate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.heartRate && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.heartRate}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Symptoms</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasCough"
              name="hasCough"
              checked={formData.hasCough}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="hasCough" className="ml-2 text-sm font-medium">
              Has cough
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasHeadaches"
              name="hasHeadaches"
              checked={formData.hasHeadaches}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="hasHeadaches" className="ml-2 text-sm font-medium">
              Has headaches
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="canSmellTaste"
              name="canSmellTaste"
              checked={formData.canSmellTaste}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="canSmellTaste" className="ml-2 text-sm font-medium">
              Can smell/taste food
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Submit Patient Vitals'
          )}
        </button>
      </div>
    </form>
  );
};

export default PatientVitalsForm;