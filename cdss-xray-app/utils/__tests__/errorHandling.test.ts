import {
  ApiError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  isApiError,
  isNetworkError,
  isAuthError,
  isValidationError,
  createErrorFromApiResponse,
  getUserFriendlyErrorMessage,
  formatErrorForLogging
} from '../errorHandling';

describe('Error Handling Utilities', () => {
  describe('Error Types', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError('API failure', 500, { reason: 'Server overload' });
      
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('API failure');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ reason: 'Server overload' });
    });
    
    it('should create NetworkError with correct properties', () => {
      const error = new NetworkError('Connection failed');
      
      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Connection failed');
    });
    
    it('should create AuthenticationError with correct properties', () => {
      const error = new AuthenticationError('Invalid token');
      
      expect(error.name).toBe('AuthenticationError');
      expect(error.message).toBe('Invalid token');
    });
    
    it('should create ValidationError with correct properties', () => {
      const fields = {
        email: 'Invalid email format',
        password: 'Password too short'
      };
      const error = new ValidationError('Validation failed', fields);
      
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.fields).toEqual(fields);
    });
  });
  
  describe('Error Type Guards', () => {
    it('should correctly identify error types', () => {
      const apiError = new ApiError('API Error', 400);
      const networkError = new NetworkError('Network Error');
      const authError = new AuthenticationError('Auth Error');
      const validationError = new ValidationError('Validation Error');
      const genericError = new Error('Generic Error');
      
      expect(isApiError(apiError)).toBe(true);
      expect(isApiError(networkError)).toBe(false);
      
      expect(isNetworkError(networkError)).toBe(true);
      expect(isNetworkError(apiError)).toBe(false);
      
      expect(isAuthError(authError)).toBe(true);
      expect(isAuthError(apiError)).toBe(false);
      
      expect(isValidationError(validationError)).toBe(true);
      expect(isValidationError(genericError)).toBe(false);
    });
  });
  
  describe('createErrorFromApiResponse', () => {
    it('should create AuthenticationError for 401 status', () => {
      const error = createErrorFromApiResponse(401, { message: 'Unauthorized' });
      
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe('Unauthorized');
    });
    
    it('should create ValidationError for 400 status', () => {
      const error = createErrorFromApiResponse(400, {
        email: ['Invalid format'],
        password: 'Too short'
      });
      
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).fields).toEqual({
        email: 'Invalid format',
        password: 'Too short'
      });
    });
    
    it('should create ApiError for server errors', () => {
      const error = createErrorFromApiResponse(500, { message: 'Internal server error' });
      
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Internal server error');
      expect((error as ApiError).statusCode).toBe(500);
    });
    
    it('should handle missing error message', () => {
      const error = createErrorFromApiResponse(404, {});
      
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('API error');
    });
  });
  
  describe('getUserFriendlyErrorMessage', () => {
    it('should return appropriate message for server errors', () => {
      const error = new ApiError('Something went wrong', 503);
      const message = getUserFriendlyErrorMessage(error);
      
      expect(message).toContain('server encountered an error');
    });
    
    it('should return appropriate message for network errors', () => {
      const error = new NetworkError('Failed to fetch');
      const message = getUserFriendlyErrorMessage(error);
      
      expect(message).toContain('Network error');
      expect(message).toContain('check your connection');
    });
    
    it('should return appropriate message for auth errors', () => {
      const error = new AuthenticationError('Token expired');
      const message = getUserFriendlyErrorMessage(error);
      
      expect(message).toContain('Authentication failed');
    });
    
    it('should return field messages for validation errors', () => {
      const error = new ValidationError('Invalid input', {
        name: 'Name is required',
        email: 'Invalid email format'
      });
      const message = getUserFriendlyErrorMessage(error);
      
      expect(message).toContain('Name is required');
      expect(message).toContain('Invalid email format');
    });
    
    it('should handle generic errors', () => {
      const error = new Error('Something unexpected happened');
      const message = getUserFriendlyErrorMessage(error);
      
      expect(message).toBe('Something unexpected happened');
    });
  });
  
  describe('formatErrorForLogging', () => {
    it('should format ApiError correctly', () => {
      const error = new ApiError('API Error', 400, { detail: 'Bad request' });
      const formatted = formatErrorForLogging(error);
      
      expect(formatted).toHaveProperty('name', 'ApiError');
      expect(formatted).toHaveProperty('message', 'API Error');
      expect(formatted).toHaveProperty('statusCode', 400);
      expect(formatted).toHaveProperty('details', { detail: 'Bad request' });
      expect(formatted).toHaveProperty('stack');
    });
    
    it('should format ValidationError correctly', () => {
      const error = new ValidationError('Validation failed', { field: 'Error' });
      const formatted = formatErrorForLogging(error);
      
      expect(formatted).toHaveProperty('name', 'ValidationError');
      expect(formatted).toHaveProperty('fields', { field: 'Error' });
    });
    
    it('should format generic errors correctly', () => {
      const error = new Error('Generic error');
      const formatted = formatErrorForLogging(error);
      
      expect(formatted).toHaveProperty('name', 'Error');
      expect(formatted).toHaveProperty('message', 'Generic error');
      expect(formatted).toHaveProperty('stack');
    });
  });
});