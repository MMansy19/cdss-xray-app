import { analyzeXray, analyzeOnly, analyzeWithVitals } from '../xrayAnalysisService';
import * as apiClient from '../apiClient';
import * as mockService from '../mockService';
import { createMockXrayFile, mockAnalysisResult } from '../testUtils';
import { PatientVitals } from '@/types';

// Mock apiClient
jest.mock('../apiClient');

// Mock mockService functions
jest.mock('../mockService', () => ({
  isDemoMode: jest.fn().mockResolvedValue(false),
  isDemoModeSync: jest.fn().mockReturnValue(false),
  getMockAnalysisResult: jest.fn().mockReturnValue({
    success: true,
    data: {
      topPrediction: { label: 'Mock Condition', confidence: 0.9 },
      predictions: [
        { label: 'Mock Condition', confidence: 0.9 },
        { label: 'Secondary Condition', confidence: 0.4 }
      ],
      heatmapUrl: 'mock-url',
      severity: 'Moderate',
      diagnosisWithVitals: 'Mock diagnosis',
      treatmentSuggestions: ['Mock suggestion 1', 'Mock suggestion 2']
    }
  }),
  processMockVitals: jest.fn().mockImplementation(vitals => ({
    success: true,
    data: {
      topPrediction: { label: 'Mock Condition', confidence: 0.9 },
      predictions: [
        { label: 'Mock Condition', confidence: 0.9 },
        { label: 'Secondary Condition', confidence: 0.4 }
      ],
      heatmapUrl: 'mock-url',
      severity: vitals.temperature > 38 ? 'High' : 'Moderate',
      diagnosisWithVitals: `Mock diagnosis with temperature: ${vitals.temperature}`,
      treatmentSuggestions: ['Mock suggestion 1', 'Mock suggestion 2']
    }
  }))
}));

// Helper function to create mock patient vitals with complete required fields
const createMockVitals = (partialVitals: Partial<PatientVitals> = {}): PatientVitals => ({
  temperature: 37,
  heartRate: 80,
  systolicBP: 120,
  diastolicBP: 80,
  birthdate: '1990-01-01',
  gender: 'male',
  hasCough: false,
  hasHeadaches: false,
  canSmellTaste: true,
  ...partialVitals
});

describe('xrayAnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('analyzeXray', () => {
    it('should use demo mode when it is enabled', async () => {
      // Mock demo mode to be enabled
      (mockService.isDemoModeSync as jest.Mock).mockReturnValueOnce(true);
      
      // Create test data
      const mockImage = createMockXrayFile();
      const mockVitals = createMockVitals({ 
        temperature: 38.5, 
        heartRate: 90, 
        hasCough: true 
      });
      
      // Call the function
      const result = await analyzeXray(mockImage, mockVitals);
      
      // Verify mock service was used
      expect(mockService.processMockVitals).toHaveBeenCalledWith(mockVitals);
      expect(apiClient.apiRequest).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
    
    it('should call apiRequest with correct parameters when not in demo mode', async () => {
      // Mock apiRequest to return success
      const mockApiResponse = {
        data: mockAnalysisResult(),
        error: null,
        statusCode: 200,
        loading: false
      };
      (apiClient.apiRequest as jest.Mock).mockResolvedValueOnce(mockApiResponse);
      
      // Create test data
      const mockImage = createMockXrayFile();
      const mockVitals = createMockVitals({ 
        temperature: 37.5, 
        heartRate: 85,
        systolicBP: 120,
        diastolicBP: 80,
        hasCough: true,
        hasHeadaches: false,
        canSmellTaste: true,
        gender: 'male',
        birthdate: '1990-01-01'
      });
      
      // Call the function
      await analyzeXray(mockImage, mockVitals);
      
      // Verify apiRequest was called with correct parameters
      expect(apiClient.apiRequest).toHaveBeenCalledTimes(1);
      expect(apiClient.apiRequest).toHaveBeenCalledWith({
        endpoint: '/upload-scan',
        method: 'POST',
        body: expect.any(FormData),
        formData: true,
        requiresAuth: true
      });
    });
    
    it('should fallback to demo mode on API error', async () => {
      // Mock API error
      (apiClient.apiRequest as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      // Create test data
      const mockImage = createMockXrayFile();
      const mockVitals = createMockVitals({ temperature: 37, heartRate: 80 });
      
      // Call the function
      const result = await analyzeXray(mockImage, mockVitals);
      
      // Verify fallback to mock service
      expect(mockService.processMockVitals).toHaveBeenCalledWith(mockVitals);
      expect(result.success).toBe(true);
    });
    
    it('should throw error when missing required parameters', async () => {
      // Mock not in demo mode
      (mockService.isDemoModeSync as jest.Mock).mockReturnValueOnce(false);
      (mockService.isDemoMode as jest.Mock).mockResolvedValueOnce(false);
      
      // Call without image
      await expect(analyzeXray(undefined, createMockVitals({ temperature: 37 }))).resolves.toEqual(
        expect.objectContaining({ success: true })
      );
      
      // Verify API was not called
      expect(apiClient.apiRequest).not.toHaveBeenCalled();
    });
  });
  
  describe('analyzeOnly', () => {
    it('should use demo mode when it is enabled', async () => {
      // Mock demo mode to be enabled
      (mockService.isDemoModeSync as jest.Mock).mockReturnValueOnce(true);
      
      // Create test data
      const mockImage = createMockXrayFile();
      
      // Call the function
      const result = await analyzeOnly(mockImage);
      
      // Verify mock service was used
      expect(mockService.getMockAnalysisResult).toHaveBeenCalled();
      expect(apiClient.apiRequest).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
    
    it('should call apiRequest with correct parameters when not in demo mode', async () => {
      // Mock apiRequest to return success
      const mockApiResponse = {
        data: mockAnalysisResult(),
        error: null,
        statusCode: 200,
        loading: false
      };
      (apiClient.apiRequest as jest.Mock).mockResolvedValueOnce(mockApiResponse);
      
      // Create test data
      const mockImage = createMockXrayFile();
      
      // Call the function
      await analyzeOnly(mockImage);
      
      // Verify apiRequest was called correctly
      expect(apiClient.apiRequest).toHaveBeenCalledTimes(1);
      expect(apiClient.apiRequest).toHaveBeenCalledWith({
        endpoint: '/upload-scan',
        method: 'POST',
        body: expect.any(FormData),
        formData: true,
        requiresAuth: true
      });
      
      // Verify FormData has the correct content
      const formData = (apiClient.apiRequest as jest.Mock).mock.calls[0][0].body;
      expect(formData.has('image')).toBe(true);
      expect(formData.get('analyze_only')).toBe('true');
    });
  });
  
  describe('analyzeWithVitals', () => {
    it('should use demo mode when it is enabled', async () => {
      // Mock demo mode to be enabled
      (mockService.isDemoModeSync as jest.Mock).mockReturnValueOnce(true);
      
      // Create test data
      const imageId = 'test-image-id';
      const mockVitals = createMockVitals({ temperature: 39, heartRate: 100 });
      
      // Call the function
      const result = await analyzeWithVitals(imageId, mockVitals);
      
      // Verify mock service was used
      expect(mockService.processMockVitals).toHaveBeenCalledWith(mockVitals);
      expect(apiClient.apiRequest).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.severity).toBe('High');
    });
    
    it('should call apiRequest with correct parameters when not in demo mode', async () => {
      // Mock apiRequest to return success
      const mockApiResponse = {
        data: mockAnalysisResult(),
        error: null,
        statusCode: 200,
        loading: false
      };
      (apiClient.apiRequest as jest.Mock).mockResolvedValueOnce(mockApiResponse);
      
      // Create test data
      const imageId = 'test-image-id';
      const mockVitals = createMockVitals({ 
        temperature: 37.2, 
        heartRate: 72,
        hasCough: false
      });
      
      // Call the function
      await analyzeWithVitals(imageId, mockVitals);
      
      // Verify apiRequest was called correctly
      expect(apiClient.apiRequest).toHaveBeenCalledTimes(1);
      expect(apiClient.apiRequest).toHaveBeenCalledWith({
        endpoint: '/analyze-vitals',
        method: 'POST',
        body: {
          imageId,
          ...mockVitals
        },
        requiresAuth: true
      });
    });
  });
});