'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, SlidersHorizontal } from 'lucide-react';

interface HeatmapViewerProps {
  originalImageUrl: string;
  heatmapUrl?: string;
  predictionResult?: Record<string, number>;
  className?: string;
}

const HeatmapViewer: React.FC<HeatmapViewerProps> = ({ 
  originalImageUrl,
  heatmapUrl,
  predictionResult,
  className = ''
}) => {
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [opacity, setOpacity] = useState<number>(70);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [generatedHeatmap, setGeneratedHeatmap] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const toggleHeatmap = () => setShowHeatmap(prev => !prev);
  const toggleControls = () => setShowControls(prev => !prev);
  
  // Generate heatmap visualization using Canvas when component mounts or results change
  useEffect(() => {
    if (!originalImageUrl || !predictionResult) return;
    
    const generateHeatmap = async () => {
      // Load the original image
      const originalImage = new Image();
      originalImage.crossOrigin = "anonymous";  // Handle CORS if needed
      
      // Create promise to wait for image load
      const imageLoaded = new Promise<void>((resolve, reject) => {
        originalImage.onload = () => resolve();
        originalImage.onerror = () => reject(new Error("Failed to load image"));
        originalImage.src = originalImageUrl;
      });
      
      try {
        // Wait for image to load
        await imageLoaded;
        
        // Create canvas with same dimensions as image
        const canvas = document.createElement('canvas');
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // Draw original image
        ctx.drawImage(originalImage, 0, 0);
        
        // Get image data to manipulate
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Get highest prediction value to determine heatmap intensity
        let highestPrediction = 0;
        let isAbnormal = false;
        
        Object.entries(predictionResult).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'normal' && key.toLowerCase() !== 'age') {
            if (value > highestPrediction) {
              highestPrediction = value;
            }
            if (value > 0.3) {  // If any abnormal condition has >30% confidence
              isAbnormal = true;
            }
          }
        });
        
        // Only apply heatmap effect if abnormal conditions detected
        if (isAbnormal) {
          // Generate heatmap overlay
          // Apply a red tint with varying intensity based on brightness
          for (let i = 0; i < data.length; i += 4) {
            // Get brightness of this pixel (0-255)
            const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
            
            // The darker areas (lower brightness) in the X-ray often represent denser/affected areas
            // So we apply more red to darker areas in the image
            const intensity = (255 - brightness) / 255;
            
            // Apply red tint to affected areas with intensity based on abnormality
            // More redness in darker areas, weighted by prediction confidence
            const heatFactor = intensity * highestPrediction * 0.8;  
            
            data[i] = Math.min(255, data[i] + 120 * heatFactor);     // Increase red
            data[i+1] = Math.max(0, data[i+1] - 40 * heatFactor);    // Decrease green a bit
            data[i+2] = Math.max(0, data[i+2] - 40 * heatFactor);    // Decrease blue a bit
          }
          
          // Put the modified image data back
          ctx.putImageData(imageData, 0, 0);
        }
        
        // Convert canvas to data URL and set as heatmap source
        const dataURL = canvas.toDataURL('image/png');
        setGeneratedHeatmap(dataURL);
      } catch (error) {
        console.error("Error generating heatmap:", error);
      }
    };
    
    generateHeatmap();
  }, [originalImageUrl, predictionResult]);
  
  // Determine if we have a heatmap to display
  const hasHeatmap = heatmapUrl || generatedHeatmap;
  
  return (
    <div className={`relative rounded-xl overflow-hidden ${className} group`}>
      {/* Original X-ray image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={originalImageUrl}
        alt="X-ray"
        className="w-full h-full object-contain"
      />
      
      {/* Heatmap overlay with dynamic opacity */}
      {hasHeatmap && showHeatmap && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heatmapUrl || generatedHeatmap || ''}
            alt="Heatmap overlay"
            className="w-full h-full object-contain"
            style={{ opacity: opacity / 100 }}
          />
        </div>
      )}
      
      {/* Advanced control panel */}
      {hasHeatmap && showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm text-white p-3 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Heatmap Opacity: {opacity}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-300">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}
      
      {/* Control buttons */}
      {hasHeatmap && (
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={toggleHeatmap}
            className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-900 text-white transition-colors"
            aria-label={showHeatmap ? "Hide heatmap" : "Show heatmap"}
          >
            {showHeatmap ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={toggleControls}
            className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-900 text-white transition-colors"
            aria-label="Show advanced controls"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {/* Image status indicators */}
      <div className="absolute bottom-3 left-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {hasHeatmap && showHeatmap && (
          <div className="bg-blue-600/80 text-white text-xs px-2 py-1 rounded-full">
            Heatmap Active
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapViewer;