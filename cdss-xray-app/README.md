# CDSS X-Ray Analysis Application

A Clinical Decision Support System (CDSS) web application that assists healthcare professionals in analyzing chest X-ray images using AI-powered diagnostic suggestions. This comprehensive semi-graduation project combines frontend (Next.js), backend (Django), and AI components into a cohesive system with clean architecture principles across three distinct service layers. Completed in under a week, it demonstrates rapid development capabilities without sacrificing code quality or feature richness.

## Features

- Upload and analyze chest X-ray images using AI models
- Record and analyze patient vitals alongside X-ray images
- View detailed analysis with confidence scores and heatmaps
- Interactive visualization of regions of interest in X-rays
- Evidence-based treatment recommendations
- Severity classification (Low, Moderate, High)
- Comprehensive differential diagnosis
- Downloadable diagnostic reports
- Light and dark mode for different clinical environments
- Supports both API-powered and demo modes for flexibility

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables by creating a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

### Development

Run the development server:
```
npm run dev
```

### Testing

Run the test suite:
```
npm test
```

Run with coverage:
```
npm run test:coverage
```

### Production Build

```
npm run build
npm start
```

## Project Architecture

The application follows a clean architecture with three distinct service layers:

1. **Frontend Service**: 
   - Built with Next.js 15.3, React 19, TypeScript, and Tailwind CSS
   - Handles user interface, interactions, and data visualization
   - Provides responsive design for various devices and clinical settings
   - Features interactive heatmap visualization of X-ray regions of interest
   - Includes light/dark mode for different working environments

2. **Backend Service**: 
   - Developed with Django 4.2, Python 3.12, and Django REST Framework
   - Manages API endpoints, authentication, and user management
   - Handles image processing and metadata extraction
   - Implements clinical data validation and processing

3. **AI Analysis Service**: 
   - Integrates deep learning models for chest X-ray pathology detection
   - Analyzes images for conditions like pneumonia, COVID-19, cardiomegaly
   - Incorporates rule-based systems for diagnostic refinement using patient vitals
   - Generates heatmaps highlighting regions of interest in X-rays
   - Provides severity classification and treatment recommendations

### Key Libraries

- **Next.js 15.3** - React framework for server-rendered applications
- **React 19** - UI component library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Jest & React Testing Library** - Testing frameworks
- **React Dropzone** - For file uploads
- **Recharts** - For data visualization
- **Django 4.2** - Backend web framework
- **Django REST Framework** - API toolkit
- **PyTorch/TensorFlow** - ML model implementation

### Directory Structure

- `/app` - Next.js app directory (pages and layouts)
- `/components` - React components
- `/hooks` - Custom React hooks
- `/utils` - Utility functions
- `/types` - TypeScript type definitions
- `/public` - Static assets

## Core Concepts

### Development Approach

This semi-graduation project was completed in less than a week by implementing:

- Clean architecture principles with three distinct service layers
- Comprehensive error handling and fallback mechanisms
- Dual operation modes (demo or backend integration)
- Test-driven development for core components
- Modular components with clear responsibilities
- Responsive design patterns for all device types
- Progressive web app capabilities with offline support

### Unified API Client

All network requests are handled through a unified API client (`utils/apiClient.ts`) which provides:

- Consistent error handling and retries
- Authentication token management
- Transparent demo mode detection
- Consistent response formatting

To use the API client:

```typescript
import { apiRequest } from '@/utils/apiClient';

// GET request
const response = await apiRequest({
  endpoint: '/some-endpoint',
  method: 'GET',
  requiresAuth: true
});

// POST request with JSON body
const response = await apiRequest({
  endpoint: '/submit-data',
  method: 'POST',
  body: { key: 'value' },
  requiresAuth: true
});

// POST with form data
const formData = new FormData();
formData.append('file', fileObject);

const response = await apiRequest({
  endpoint: '/upload',
  method: 'POST',
  body: formData,
  formData: true,
  requiresAuth: true
});
```

### Demo Mode

The application supports a demo mode that works without a backend API. This is useful for:

- Development without a backend
- Demonstrations and presentations
- Testing UI without API dependencies
- Fallback when API is unavailable

Demo mode can be configured in three ways:


### Authentication

The application uses JWT-based authentication with the following features:

- Secure token storage in localStorage
- Token refresh functionality
- Mock authentication in demo mode
- Persistent sessions

Authentication state is managed through the `useAuth` hook:

```typescript
const { user, isAuthenticatedUser, login, register, logout, error } = useAuth();
```

### X-Ray Analysis

X-ray image analysis is handled through specialized services that integrate with the unified API client:

- `utils/xrayAnalysisService.ts` - Core image analysis functions
- `utils/mockService.ts` - Mock data generation for demo mode

## Development Guidelines

### Adding New Features

1. Use the unified API client for all network requests
2. Ensure demo mode compatibility for all features
3. Write tests for all new functionality
4. Maintain TypeScript type safety

### Testing Strategy

- Unit tests for utilities and hooks
- Component tests for UI elements
- Integration tests for key workflows
- Mock API requests in tests

### Error Handling

All API requests should use the unified error handling from the API client:

```typescript
try {
  const response = await apiRequest({...});
  
  if (response.error) {
    // Handle API error
    console.error(response.error);
    return;
  }
  
  // Handle success
  const data = response.data;
} catch (error) {
  // Handle unexpected errors
}
```

## License

[MIT](LICENSE)

## Author

**Mahmoud Mansy**  
[GitHub Profile](https://github.com/MMansy19)

This semi-graduation project was completed in less than one week, showcasing the ability to rapidly develop a complex medical application with clean architecture principles and comprehensive features.
