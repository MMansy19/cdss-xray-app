/**
 * Error handling utilities for consistent error management across the application
 */

// Custom error types
export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

// Functions to check error types
export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: any): error is NetworkError {
  return error instanceof NetworkError;
}

export function isAuthError(error: any): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError;
}

// Helper to create appropriate error objects from API responses
export function createErrorFromApiResponse(status: number, data: any): Error {
  // Authentication errors
  if (status === 401 || status === 403) {
    return new AuthenticationError(data?.message || 'Authentication failed');
  }
  
  // Validation errors
  if (status === 422 || status === 400) {
    const fields: Record<string, string> = {};
    
    // Handle different validation error formats
    if (data && typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          fields[key] = (value as string[]).join(', ');
        } else if (typeof value === 'string') {
          fields[key] = value;
        }
      });
    }
    
    return new ValidationError(data?.message || 'Validation failed', fields);
  }
  
  // Server errors
  if (status >= 500) {
    return new ApiError('Server error', status, data);
  }
  
  // Default case
  return new ApiError(data?.message || 'API error', status, data);
}

// User-friendly error messages
export function getUserFriendlyErrorMessage(error: Error): string {
  if (isApiError(error)) {
    if (error.statusCode >= 500) {
      return 'The server encountered an error. Please try again later.';
    }
    return error.message || 'An API error occurred';
  }
  
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (isAuthError(error)) {
    return 'Authentication failed. Please sign in again.';
  }
  
  if (isValidationError(error)) {
    const validationError = error as ValidationError;
    const fieldMessages = Object.values(validationError.fields);
    if (fieldMessages.length > 0) {
      return fieldMessages.join(', ');
    }
    return validationError.message || 'Please check your input and try again';
  }
  
  // Return the original message for generic errors
  return (error as Error).message || 'An unexpected error occurred. Please try again.';
}

// Format error for logging
export function formatErrorForLogging(error: Error): Record<string, any> {
  const result: Record<string, any> = {
    name: error.name,
    message: error.message,
    stack: error.stack
  };
  
  if (isApiError(error)) {
    result.statusCode = error.statusCode;
    result.details = error.details;
  }
  
  if (isValidationError(error)) {
    result.fields = error.fields;
  }
  
  return result;
}