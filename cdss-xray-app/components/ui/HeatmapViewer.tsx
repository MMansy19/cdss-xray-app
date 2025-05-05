'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface HeatmapViewerProps {
  originalImageUrl: string;
  heatmapUrl?: string;
  className?: string;
}

const HeatmapViewer: React.FC<HeatmapViewerProps> = ({ 
  originalImageUrl,
  heatmapUrl,
  className = ''
}) => {
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  
  const toggleHeatmap = () => setShowHeatmap(prev => !prev);
  
  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {/* Original X-ray image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={originalImageUrl}
        alt="X-ray"
        className="w-full h-full object-contain"
      />
      
      {/* Heatmap overlay with opacity */}
      {heatmapUrl && showHeatmap && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heatmapUrl}
            alt="Heatmap overlay"
            className="w-full h-full object-contain opacity-70"
          />
        </div>
      )}
      
      {/* Heatmap toggle button */}
      {heatmapUrl && (
        <button
          onClick={toggleHeatmap}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/70 hover:bg-gray-900 text-white transition-colors"
          aria-label={showHeatmap ? "Hide heatmap" : "Show heatmap"}
        >
          {showHeatmap ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
};

export default HeatmapViewer;