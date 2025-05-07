'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ImageUploader from '@/components/ui/ImageUploader';
import PatientVitalsForm from '@/components/ui/PatientVitalsForm';
import { XRayImage, AnalysisResult, PatientVitals } from '@/types';
import { analyzeXray } from '@/utils/predictionService';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, HelpCircle, Image, Stethoscope, Upload } from 'lucide-react';

export default function AnalyzePage() {
  // State definitions
  const [image, setImage] = useState<XRayImage | null>(null);
  const [vitals, setVitals] = useState<PatientVitals | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepComplete, setStepComplete] = useState<{[key: number]: boolean}>({
    1: false,
    2: false
  });
  const router = useRouter();

  // Handle image selection
  const handleImageSelect = (uploadedImage: XRayImage | null) => {
    setImage(uploadedImage);
    setError(null);
    setStepComplete(prev => ({...prev, 1: !!uploadedImage}));
  };

  // Handle vitals submission
  const handleVitalsSubmit = (patientVitals: PatientVitals) => {
    setVitals(patientVitals);
    setError(null);
    setStepComplete(prev => ({...prev, 2: true}));
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle analysis submission
  const handleAnalyze = async () => {
    if (!image) {
      setError('Please upload an X-ray image first.');
      setCurrentStep(1);
      return;
    }

    if (!vitals) {
      setError('Patient vitals are required for analysis.');
      setCurrentStep(2);
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      // Use the unified analyzeXray function that handles both image and vitals
      const result = await analyzeXray(image.file, vitals);
      
      // Store result in sessionStorage for the result page
      sessionStorage.setItem('xrayResult', JSON.stringify(result));
      sessionStorage.setItem('originalImageUrl', image.preview);
      sessionStorage.setItem('patientVitals', JSON.stringify(vitals));
      
      // Navigate to result page
      router.push('/result');
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze the image. Please try again.');
      setIsAnalyzing(false);
    }
  };

  // Progress indicator component
  const ProgressSteps = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div 
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
              ${currentStep === step 
                ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500' 
                : currentStep > step || stepComplete[step]
                  ? 'border-green-500 bg-green-50 text-green-500 dark:bg-green-900/30 dark:border-green-400'
                  : 'border-gray-300 text-gray-500 dark:border-gray-600'
              }`}
            onClick={() => {
              // Only allow clicking on completed steps or the current step + 1 if previous is complete
              if (step < currentStep || (step === currentStep + 1 && stepComplete[currentStep])) {
                setCurrentStep(step);
              }
            }}
            style={{ cursor: (step < currentStep || (step === currentStep + 1 && stepComplete[currentStep])) ? 'pointer' : 'default' }}
          >
            {currentStep > step || stepComplete[step] ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <span className="font-medium">{step}</span>
            )}
          </div>
          
          {step < 3 && (
            <div className={`w-20 h-1 mx-1 
              ${currentStep > step || (currentStep === step && stepComplete[step])
                ? 'bg-green-500 dark:bg-green-400' 
                : 'bg-gray-300 dark:bg-gray-600'}`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );

  // Step content components
  const StepTitle = ({ step }: { step: number }) => {
    const titles = [
      "Upload X-Ray Image",
      "Enter Patient Vitals",
      "Review and Submit"
    ];
    
    const icons = [
      <Image key="image" className="w-6 h-6 mr-2" />,
      <Stethoscope key="stethoscope" className="w-6 h-6 mr-2" />,
      <Upload key="upload" className="w-6 h-6 mr-2" />
    ];
    
    return (
      <div className="flex items-center mb-4">
        {icons[step-1]}
        <h2 className="text-2xl font-bold">{titles[step-1]}</h2>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analyze Chest X-Ray</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload a chest X-ray image and provide patient vitals for AI-assisted analysis.
          </p>
        </div>

        {/* Progress Steps Indicator */}
        <ProgressSteps />

        {/* Main content area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          {/* Step 1: Upload X-ray Image */}
          {currentStep === 1 && (
            <div className="animate-fadeIn">
              <StepTitle step={1} />
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please upload a clear, high-quality chest X-ray image. The system works best with frontal (PA/AP) views.
              </p>
              <ImageUploader 
                onImageSelect={handleImageSelect} 
                className="mb-6"
                maxSizeMB={15} 
              />

              <div className="flex justify-between mt-8">
                <div></div> {/* Empty div for spacing */}
                <button
                  onClick={goToNextStep}
                  disabled={!stepComplete[1]}
                  className="flex items-center py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Patient Vitals */}
          {currentStep === 2 && (
            <div className="animate-fadeIn">
              <StepTitle step={2} />
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter accurate patient vital signs and symptoms to receive more precise diagnostic suggestions.
              </p>
              <PatientVitalsForm 
                onSubmit={handleVitalsSubmit} 
                isSubmitting={isAnalyzing} 
              />

              <div className="flex justify-between mt-8">
                <button
                  onClick={goToPrevStep}
                  className="flex items-center py-2 px-6 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-md shadow-sm transition-colors"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Previous Step
                </button>

                <button
                  onClick={goToNextStep}
                  disabled={!stepComplete[2]}
                  className="flex items-center py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review and Submit */}
          {currentStep === 3 && (
            <div className="animate-fadeIn">
              <StepTitle step={3} />
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* X-ray Image Preview */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Image className="w-5 h-5 mr-2" />X-ray Image
                  </h3>
                  
                  {image ? (
                    <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 aspect-square">
                      <img 
                        src={image.preview} 
                        alt="X-ray preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">No image uploaded</p>
                    </div>
                  )}
                </div>
                
                {/* Vitals Summary */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2" />Patient Vitals
                  </h3>
                  
                  {vitals ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Temperature</span>
                          <p className="font-medium">{vitals.temperature}°C</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Heart Rate</span>
                          <p className="font-medium">{vitals.heartRate} bpm</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Blood Pressure</span>
                        <p className="font-medium">{vitals.systolicBP}/{vitals.diastolicBP} mmHg</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Demographics</span>
                        <p className="font-medium">
                          {vitals.gender.charAt(0).toUpperCase() + vitals.gender.slice(1)}, 
                          {vitals.birthdate ? ` ${calculateAge(vitals.birthdate)} years` : ''}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Symptoms</span>
                        <p>
                          {[
                            vitals.hasCough ? 'Cough' : null,
                            vitals.hasHeadaches ? 'Headache' : null,
                            !vitals.canSmellTaste ? 'Loss of smell/taste' : null
                          ].filter(Boolean).join(', ') || 'None reported'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">No vitals entered</p>
                    </div>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-6 animate-pulse">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={goToPrevStep}
                  className="flex items-center py-2 px-6 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-md shadow-sm transition-colors"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Previous Step
                </button>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !image || !vitals}
                  className="flex items-center py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze & Submit
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Helpful tips and information card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start">
            <HelpCircle className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg mb-2 text-blue-800 dark:text-blue-300">Tips for Best Analysis</h3>
              <ul className="space-y-2 text-blue-700 dark:text-blue-200 text-sm">
                <li>• Use high-quality, properly exposed X-ray images</li>
                <li>• Ensure patient vitals are accurate and recent</li>
                <li>• For children under 12, note that normal vital ranges differ</li>
                <li>• The AI model works best with frontal chest X-rays (PA/AP views)</li>
                <li>• Image analysis typically takes 15-30 seconds to complete</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Helper function to calculate age from birthdate
function calculateAge(birthdate: string): number {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}