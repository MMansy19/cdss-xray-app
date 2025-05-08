/**
 * Standard error messages used throughout the application
 * Using constants ensures consistency between implementation and tests
 */

export const API_ERRORS = {
  SERVER_ERROR: 'The server encountered an error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTH_ERROR: 'Authentication failed. Please sign in again.',
  VALIDATION_ERROR: 'Please check your input and try again',
  DEMO_MODE_ERROR: 'DEMO_MODE_ENABLED'
};

export const USER_MESSAGES = {
  UPLOAD_ERROR: 'There was an error uploading your file. Please try again.',
  UNSUPPORTED_FILE: 'Please upload a valid image file (JPG, JPEG, PNG)',
  FILE_TOO_LARGE: 'File is too large. Please upload a smaller image.',
  SERVER_UNAVAILABLE: 'The server is currently unavailable. Using demo mode instead.'
};