'use client';

import { useState } from 'react';
import { Eye, EyeOff, SlidersHorizontal } from 'lucide-react';

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
  const [opacity, setOpacity] = useState<number>(70);
  const [showControls, setShowControls] = useState<boolean>(false);
  
  const toggleHeatmap = () => setShowHeatmap(prev => !prev);
  const toggleControls = () => setShowControls(prev => !prev);
  
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
      {heatmapUrl && showHeatmap && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heatmapUrl}
            alt="Heatmap overlay"
            className="w-full h-full object-contain"
            style={{ opacity: opacity / 100 }}
          />
        </div>
      )}
      
      {/* Advanced control panel */}
      {heatmapUrl && showControls && (
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
      {heatmapUrl && (
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
        {heatmapUrl && showHeatmap && (
          <div className="bg-blue-600/80 text-white text-xs px-2 py-1 rounded-full">
            Heatmap Active
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapViewer;