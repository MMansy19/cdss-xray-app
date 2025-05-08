import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUploader from '../ImageUploader';
import { setupLocalStorageMock, setupAuthMock, setupDemoModeMock } from '@/utils/testUtils';
import * as mockService from '@/utils/mockService';
import * as apiClient from '@/utils/apiClient';

// Mock the necessary dependencies
jest.mock('@/utils/mockService', () => ({
  isDemoMode: jest.fn().mockResolvedValue(false),
  isDemoModeSync: jest.fn().mockReturnValue(false)
}));

jest.mock('@/utils/apiClient');

// Mock the auth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn().mockReturnValue({
    isAuthenticatedUser: true
  })
}));

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn().mockReturnValue({
    getRootProps: jest.fn().mockReturnValue({}),
    getInputProps: jest.fn().mockReturnValue({}),
    isDragActive: false
  })
}));

// Create a helper to simulate file upload
const createFileUploadEvent = (files: File[]) => ({
  target: {
    files
  }
});

describe('ImageUploader', () => {
  beforeAll(() => {
    // Setup localStorage mock
    setupLocalStorageMock();
    
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn().mockReturnValue('mocked-url');
    global.URL.revokeObjectURL = jest.fn();
  });
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    setupAuthMock(true);
    (mockService.isDemoMode as jest.Mock).mockResolvedValue(false);
    (mockService.isDemoModeSync as jest.Mock).mockReturnValue(false);
  });
  
  it('renders correctly in initial state', () => {
    const onImageSelect = jest.fn();
    
    render(<ImageUploader onImageSelect={onImageSelect} />);
    
    // Check for dropzone text
    expect(screen.getByText(/Drag & drop an X-ray image here/i)).toBeInTheDocument();
    expect(screen.getByText(/click to select a file/i)).toBeInTheDocument();
    expect(screen.getByText(/Supported formats: JPG, JPEG, PNG/i)).toBeInTheDocument();
  });
  
  it('shows demo mode indicator when in demo mode', async () => {
    // Setup demo mode
    (mockService.isDemoModeSync as jest.Mock).mockReturnValue(true);
    
    const onImageSelect = jest.fn();
    
    render(<ImageUploader onImageSelect={onImageSelect} />);
    
    // Check for demo mode text
    await waitFor(() => {
      expect(screen.getByText(/Demo Mode/i)).toBeInTheDocument();
    });
  });
  
  it('handles file selection correctly', async () => {
    const onImageSelect = jest.fn();
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    const { container } = render(<ImageUploader onImageSelect={onImageSelect} />);
    
    // Get the hidden input and simulate file selection
    // We need to access it via the DOM since it's wrapped by react-dropzone
    const input = container.querySelector('input');
    fireEvent.change(input!, createFileUploadEvent([file]));
    
    // Check that onImageSelect was called with the correct file
    await waitFor(() => {
      expect(onImageSelect).toHaveBeenCalledWith(expect.objectContaining({
        file,
        preview: 'mocked-url'
      }));
    });
  });
  
  it('shows upload button when showUploadButton is true', () => {
    const onImageSelect = jest.fn();
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    const { container, rerender } = render(
      <ImageUploader onImageSelect={onImageSelect} showUploadButton={true} />
    );
    
    // First, no button should be visible without an image
    expect(screen.queryByText(/Upload Image/i)).not.toBeInTheDocument();
    
    // Simulate file selection
    const input = container.querySelector('input');
    fireEvent.change(input!, createFileUploadEvent([file]));
    
    // Now, the upload button should be visible
    expect(screen.getByText(/Upload Image for Analysis/i)).toBeInTheDocument();
  });
  
  it('shows error when file type is invalid', async () => {
    const onImageSelect = jest.fn();
    const invalidFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    const { container } = render(<ImageUploader onImageSelect={onImageSelect} />);
    
    // Simulate file selection
    const input = container.querySelector('input');
    fireEvent.change(input!, createFileUploadEvent([invalidFile]));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Please upload a valid image file/i)).toBeInTheDocument();
    });
    
    // Verify onImageSelect was not called
    expect(onImageSelect).not.toHaveBeenCalled();
  });
  
  it('shows error when file size exceeds the limit', async () => {
    const onImageSelect = jest.fn();
    
    // Mock a large file (11MB)
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    const { container } = render(<ImageUploader onImageSelect={onImageSelect} maxSizeMB={10} />);
    
    // Simulate file selection
    const input = container.querySelector('input');
    fireEvent.change(input!, createFileUploadEvent([largeFile]));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/File is too large/i)).toBeInTheDocument();
    });
    
    // Verify onImageSelect was not called
    expect(onImageSelect).not.toHaveBeenCalled();
  });
  
  it('uploads file when upload button is clicked', async () => {
    // Mock API response
    (apiClient.apiRequest as jest.Mock).mockResolvedValue({
      data: { imageId: 'test-id-123' },
      error: null,
      statusCode: 200,
      loading: false
    });
    
    const onImageSelect = jest.fn();
    const onUploadStart = jest.fn();
    const onUploadProgress = jest.fn();
    const onUploadComplete = jest.fn();
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    const { container } = render(
      <ImageUploader 
        onImageSelect={onImageSelect}
        onUploadStart={onUploadStart}
        onUploadProgress={onUploadProgress}
        onUploadComplete={onUploadComplete}
        showUploadButton={true}
      />
    );
    
    // Simulate file selection
    const input = container.querySelector('input');
    fireEvent.change(input!, createFileUploadEvent([file]));
    
    // Click the upload button
    const uploadButton = screen.getByText(/Upload Image for Analysis/i);
    fireEvent.click(uploadButton);
    
    // Check that callbacks were called appropriately
    expect(onUploadStart).toHaveBeenCalled();
    expect(onUploadProgress).toHaveBeenCalledWith(expect.objectContaining({
      progress: 0,
      status: 'uploading'
    }));
    
    // Verify API request was made correctly
    await waitFor(() => {
      expect(apiClient.apiRequest).toHaveBeenCalledWith(expect.objectContaining({
        endpoint: '/upload-scan',
        method: 'POST',
        formData: true,
        requiresAuth: true
      }));
    });
    
    // Completion callback should be called with the correct ID
    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalledWith('test-id-123');
    });
  });
  
  it('simulates upload in demo mode', async () => {
    // Enable demo mode
    (mockService.isDemoModeSync as jest.Mock).mockReturnValue(true);
    
    const onImageSelect = jest.fn();
    const onUploadStart = jest.fn();
    const onUploadProgress = jest.fn();
    const onUploadComplete = jest.fn();
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    const { container } = render(
      <ImageUploader 
        onImageSelect={onImageSelect}
        onUploadStart={onUploadStart}
        onUploadProgress={onUploadProgress}
        onUploadComplete={onUploadComplete}
        showUploadButton={true}
      />
    );
    
    // Simulate file selection
    const input = container.querySelector('input');
    fireEvent.change(input!, createFileUploadEvent([file]));
    
    // Click the upload button
    const uploadButton = screen.getByText(/Upload Image for Analysis/i);
    fireEvent.click(uploadButton);
    
    // Check that callbacks were called appropriately
    expect(onUploadStart).toHaveBeenCalled();
    
    // API client should not be called in demo mode
    expect(apiClient.apiRequest).not.toHaveBeenCalled();
    
    // Completion callback should eventually be called with a demo ID
    await waitFor(
      () => {
        expect(onUploadComplete).toHaveBeenCalledWith(expect.stringContaining('demo-image-'));
      },
      { timeout: 4000 } // This may take longer due to the simulated delay
    );
  });
});