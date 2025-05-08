import { analyzeXray } from '../xrayAnalysisService';
import * as apiClient from '../apiClient';
import { createMockXrayFile, mockAnalysisResult } from '../testUtils';
import { PatientVitals } from '@/types';

// Mock apiClient
jest.mock('../apiClient');

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
    it('should call apiRequest with correct parameters', async () => {
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
        endpoint: '/api/upload-scan',
        method: 'POST',
        body: expect.any(FormData),
        formData: true,
        requiresAuth: true
      });
    });
    
    it('should throw error when API request fails', async () => {
      // Mock API error
      const apiError = new Error('API Error');
      (apiClient.apiRequest as jest.Mock).mockRejectedValueOnce(apiError);
      
      // Create test data
      const mockImage = createMockXrayFile();
      const mockVitals = createMockVitals({ temperature: 37, heartRate: 80 });
      
      // Call the function and expect it to throw
      await expect(analyzeXray(mockImage, mockVitals)).rejects.toThrow('API Error');
      
      // Verify apiRequest was called
      expect(apiClient.apiRequest).toHaveBeenCalledTimes(1);
    });
    
    it('should throw error when missing required parameters', async () => {
      // Call without image
      await expect(analyzeXray(undefined, createMockVitals({ temperature: 37 }))).rejects.toThrow('Both image and vitals are required');
      
      // Call without vitals
      await expect(analyzeXray(createMockXrayFile(), undefined)).rejects.toThrow('Both image and vitals are required');
      
      // Verify API was not called
      expect(apiClient.apiRequest).not.toHaveBeenCalled();
    });
  });
});