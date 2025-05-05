'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { XRayImage } from '@/types';

interface ImageUploaderProps {
  onImageSelect: (image: XRayImage | null) => void;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, className = '' }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);

    // Validate file type
    const file = acceptedFiles[0];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (!file) return;
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, JPEG, or PNG)');
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Pass the image to parent component
    onImageSelect({
      file,
      preview: objectUrl
    });

    // Clean up previous preview URL
    return () => URL.revokeObjectURL(objectUrl);
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/jpg': [],
      'image/png': []
    },
    maxFiles: 1,
    multiple: false
  });

  const clearImage = () => {
    setPreview(null);
    setError(null);
    onImageSelect(null);
  };

  return (
    <div className={`w-full ${className}`}>
      {!preview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            <div className="text-gray-600 dark:text-gray-400">
              {isDragActive ? (
                <p>Drop the X-ray image here...</p>
              ) : (
                <>
                  <p className="font-medium">Drag & drop an X-ray image here</p>
                  <p className="text-sm mt-1">or click to select a file</p>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supported formats: JPG, JPEG, PNG
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={clearImage}
              className="p-1 bg-gray-800/70 hover:bg-gray-900 rounded-full text-white transition-colors"
              aria-label="Remove image"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
            <div className="aspect-square w-full relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="X-ray preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;