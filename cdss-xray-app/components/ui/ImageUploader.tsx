'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isDemoMode, isDemoModeSync } from '@/utils/mockService';
import { apiRequest } from '@/utils/apiClient';

interface XRayImage {
  file: File;
  preview: string;
}

interface UploadProgressData {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
}

interface ImageUploaderProps {
  onImageSelect: (image: XRayImage | null) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (data: UploadProgressData) => void;
  onUploadComplete?: (id: string) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
  maxSizeMB?: number;
  showUploadButton?: boolean;
  autoUpload?: boolean;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelect, 
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  className = '',
  maxSizeMB = 10,
  showUploadButton = false,
  autoUpload = false,
  disabled = false
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<XRayImage | null>(null);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const { isAuthenticatedUser } = useAuth();

  // Check for demo mode on mount and when component receives focus
  useEffect(() => {
    const checkDemoMode = async () => {
      const isInDemoMode = isDemoModeSync() || await isDemoMode();
      setDemoMode(isInDemoMode);
    };
    
    checkDemoMode();
    
    // Re-check when window gets focus
    const handleFocus = () => {
      checkDemoMode();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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

    // Check file size (in MB)
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Store the selected image
    const image: XRayImage = {
      file,
      preview: objectUrl
    };
    
    setSelectedImage(image);
    
    // Pass the image to parent component
    onImageSelect(image);

    // Auto upload if enabled
    if (autoUpload && isAuthenticatedUser) {
      handleUpload(image);
    }
  }, [onImageSelect, autoUpload, isAuthenticatedUser, maxSizeMB]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/jpg': [],
      'image/png': []
    },
    maxFiles: 1,
    multiple: false,
    disabled: disabled || isUploading
  });

  const clearImage = () => {
    // Clean up the object URL to avoid memory leaks
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    
    setPreview(null);
    setError(null);
    setSelectedImage(null);
    onImageSelect(null);
  };

  const handleUpload = async (image: XRayImage) => {
    if (!isAuthenticatedUser || disabled) {
      setError('You must be logged in to upload images');
      return;
    }

    if (!image) {
      setError('No image selected');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      // Notify parent of upload start
      onUploadStart?.();
      
      // Update progress to 0%
      onUploadProgress?.({ progress: 0, status: 'uploading', message: 'Starting upload...' });
      
      // Check for demo mode
      const isInDemoMode = demoMode || isDemoModeSync() || await isDemoMode();
      
      if (isInDemoMode) {
        // Simulate upload in demo mode with progress updates
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          onUploadProgress?.({ 
            progress, 
            status: 'uploading', 
            message: progress < 100 ? `Uploading: ${progress}%` : 'Processing image...' 
          });
          
          if (progress >= 100) {
            clearInterval(interval);
            
            // Simulate processing delay
            setTimeout(() => {
              const fakeId = `demo-image-${Date.now()}`;
              onUploadComplete?.(fakeId);
              setIsUploading(false);
            }, 1000);
          }
        }, 300);
        
        return;
      }
      
      // Real upload using our unified API client
      const formData = new FormData();
      formData.append('image', image.file);
      formData.append('upload_only', 'true'); // Just upload, don't analyze yet
      
      // Use our unified API client to handle the upload
      const response = await apiRequest<{ imageId: string }>({
        endpoint: '/api/upload-scan',
        method: 'POST',
        body: formData,
        formData: true,
        requiresAuth: true
      });
      
      if (response.error) {
        throw response.error;
      }
      
      // Simulate completion since we don't have progress events from fetch
      onUploadProgress?.({ progress: 100, status: 'complete', message: 'Upload complete' });
      
      // Get the image ID from the response and pass it to the parent
      const imageId = response.data?.imageId || `image-${Date.now()}`;
      onUploadComplete?.(imageId);
      
    } catch (err) {
      console.error('Upload error:', err);
      
      if (err instanceof Error && err.message === 'DEMO_MODE_ENABLED') {
        // If demo mode is enabled during the upload, simulate a successful upload
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          onUploadProgress?.({ 
            progress, 
            status: 'uploading', 
            message: progress < 100 ? `Demo mode: ${progress}%` : 'Processing...' 
          });
          
          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              const fakeId = `demo-image-${Date.now()}`;
              onUploadComplete?.(fakeId);
              setIsUploading(false);
            }, 1000);
          }
        }, 200);
        return;
      }
      
      const error = err instanceof Error ? err : new Error('Failed to upload image');
      setError(error.message);
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`w-full max-w-[600px] mx-auto ${className}`}>
      {!preview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : disabled
              ? 'border-gray-500 bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <Upload className={`h-12 w-12 ${disabled ? 'text-gray-500' : 'text-gray-400 dark:text-gray-500'}`} />
            <div className={`${disabled ? 'text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
              {isDragActive ? (
                <p>Drop the X-ray image here...</p>
              ) : (
                <>
                  <p className="font-medium">
                    {disabled 
                      ? 'Image uploading is disabled'
                      : 'Drag & drop an X-ray image here'
                    }
                  </p>
                  {!disabled && <p className="text-sm mt-1">or click to select a file</p>}
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supported formats: JPG, JPEG, PNG (Max {maxSizeMB}MB)
              {demoMode && <span className="ml-1 font-medium">(Demo Mode)</span>}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={clearImage}
              disabled={isUploading}
              className="p-1 bg-gray-800/70 hover:bg-gray-900 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              
              {isUploading && (
                <div className="absolute inset-0 bg-gray-900/50 flex flex-col items-center justify-center text-white">
                  <Loader2 className="h-10 w-10 animate-spin mb-2" />
                  <p>Uploading...{demoMode && ' (Demo Mode)'}</p>
                </div>
              )}
            </div>
          </div>

          {showUploadButton && selectedImage && !isUploading && (
            <button
              onClick={() => handleUpload(selectedImage)}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!isAuthenticatedUser || isUploading}
            >
              <Upload className="h-5 w-5 mr-2" />
              {isAuthenticatedUser ? 'Upload Image for Analysis' : 'Login to Upload'}
              {demoMode && isAuthenticatedUser && ' (Demo Mode)'}
            </button>
          )}
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