# CDSS X-Ray Analysis Application

A Clinical Decision Support System (CDSS) web application built with Next.js and Tailwind CSS that provides AI-powered diagnostic suggestions from chest X-ray images.

## Features

- Upload and analyze chest X-ray images using AI models
- Record and analyze patient vitals alongside X-ray images
- View detailed analysis with confidence scores and heatmaps
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

### Key Libraries

- **Next.js** - React framework for server-rendered applications
- **Tailwind CSS** - Utility-first CSS framework
- **Jest & React Testing Library** - Testing frameworks
- **React Dropzone** - For file uploads
- **Recharts** - For data visualization

### Directory Structure

- `/app` - Next.js app directory (pages and layouts)
- `/components` - React components
- `/hooks` - Custom React hooks
- `/utils` - Utility functions
- `/types` - TypeScript type definitions
- `/public` - Static assets

## Core Concepts

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
