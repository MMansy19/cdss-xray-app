'use client';

import { Layers, Award, Brain, FileCheck } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start">
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  </div>
);

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">About CDSS X-Ray</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          A clinical decision support system designed to assist medical professionals with chest X-ray interpretation and analysis.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            CDSS X-Ray aims to improve diagnostic accuracy, reduce interpretation time, and enhance patient care by providing radiologists and clinicians with AI-powered assistance for chest X-ray analysis.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            By leveraging advanced deep learning techniques, our system helps identify potential abnormalities, prioritize critical cases, and provide evidence-based recommendations to support clinical decision-making.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={<Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            title="AI-Powered Analysis"
            description="Our deep learning algorithms have been trained on thousands of expert-annotated chest X-rays to identify common pathologies with high accuracy."
          />
          <FeatureCard
            icon={<Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            title="Heatmap Visualization"
            description="Visual overlays highlight regions of interest in the X-ray, increasing interpretability and helping clinicians understand the AI's decision-making process."
          />
          <FeatureCard
            icon={<FileCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            title="Evidence-Based Recommendations"
            description="Receive tailored clinical guidance based on detected findings, including suggested next steps and potential follow-up actions."
          />
          <FeatureCard
            icon={<Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            title="Quality Assurance"
            description="Our system undergoes continuous validation against expert radiologist readings to ensure high performance and reliability."
          />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <ol className="space-y-4 list-decimal list-inside text-gray-700 dark:text-gray-300">
            <li className="pb-3 border-b dark:border-gray-700">
              <span className="font-medium">Upload X-ray Image</span>
              <p className="mt-1 pl-6 text-sm text-gray-600 dark:text-gray-400">
                Upload a digital chest X-ray image through our secure platform. The system accepts standard image formats.
              </p>
            </li>
            <li className="pb-3 border-b dark:border-gray-700">
              <span className="font-medium">AI Analysis</span>
              <p className="mt-1 pl-6 text-sm text-gray-600 dark:text-gray-400">
                Our deep learning algorithms rapidly analyze the image, identifying potential abnormalities and patterns associated with common chest pathologies.
              </p>
            </li>
            <li className="pb-3 border-b dark:border-gray-700">
              <span className="font-medium">Results Generation</span>
              <p className="mt-1 pl-6 text-sm text-gray-600 dark:text-gray-400">
                The system produces a comprehensive report with probability scores for detected conditions, a heatmap highlighting regions of interest, and clinical recommendations.
              </p>
            </li>
            <li>
              <span className="font-medium">Clinical Decision Support</span>
              <p className="mt-1 pl-6 text-sm text-gray-600 dark:text-gray-400">
                Medical professionals review the AI-generated insights alongside their own expertise to make informed clinical decisions for patient care.
              </p>
            </li>
          </ol>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
        <h2 className="text-xl font-bold mb-3">Important Disclaimer</h2>
        <div className="text-gray-700 dark:text-gray-300">
          <p className="mb-2">
            CDSS X-Ray is designed as a decision support tool and is not intended to replace professional medical judgment. All AI predictions should be interpreted by qualified healthcare professionals in conjunction with clinical findings and other diagnostic tests.
          </p>
          <p>
            This system has been developed for educational and research purposes. Validation in clinical settings may be required before implementation in actual patient care scenarios.
          </p>
        </div>
      </div>
    </div>
  );
}