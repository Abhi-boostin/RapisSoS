# RapidSoS Frontend

A production-ready emergency services platform built with React, Vite, Tailwind CSS, and React Router.

## Features

- **Role-based Authentication**: Support for Citizens, Police Officers, and Ambulance Crews
- **OTP Verification**: Secure phone-based authentication with E.164 format support
- **Emergency Requests**: Geolocation-based SOS requests for ambulance and police services
- **Real-time Dashboard**: Request management for emergency responders with status controls
- **Mobile-first Design**: Responsive UI optimized for all device sizes
- **Robust Error Handling**: Clear error messages with backend integration
- **State Persistence**: Local storage integration for seamless user experience

## Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Architecture

### State Management
- **React Context**: Global state management for role and phone number
- **localStorage**: Persistent storage with automatic synchronization
- **Custom Hooks**: Reusable logic for countdown timers and local storage

### API Integration
- **Axios Client**: Centralized HTTP client with error interceptors
- **TypeScript Types**: Full type safety for all API endpoints
- **Error Handling**: Standardized error parsing and display

### Component Structure
- **Pages**: Role-based dashboards and authentication flows
- **Components**: Reusable UI components with consistent styling
- **Hooks**: Custom hooks for common functionality

## Usage Guide

### Citizen Flow
1. Select "Citizen" role on the landing page
2. Enter phone number and verify with OTP
3. Use emergency buttons to request ambulance or police
4. View assigned responder details and contact information

### Emergency Responder Flow
1. Select "Police Officer" or "Ambulance Crew" role
2. Complete phone verification process
3. Toggle availability status in the header
4. View and respond to pending emergency requests
5. Accept or decline requests with automatic reassignment

## API Endpoints

The application integrates with the following backend endpoints:

- **Health**: `GET /health`
- **User Authentication**: `/users/sendotp`, `/users/verifyotp`
- **Emergency Requests**: `/users/sos/ambulance`, `/users/sos/officer`
- **Ambulance Management**: `/ambulances/*` endpoints
- **Officer Management**: `/officers/*` endpoints

## Configuration

### Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL (default: http://localhost:5000)

### Phone Format

All phone numbers must be in E.164 format (e.g., +91XXXXXXXXXX)

### Location Format

Coordinates are provided as GeoJSON Point format: `[longitude, latitude]`

## Error Handling

- **Network Errors**: Automatic retry and user-friendly messages
- **API Errors**: Backend error messages displayed with status codes
- **Validation**: Real-time form validation with clear feedback
- **Geolocation**: Fallback to manual coordinate entry if location access denied

## Performance Features

- **Code Splitting**: Automatic route-based code splitting
- **Optimized Builds**: Production builds with minification and tree shaking
- **Efficient Re-renders**: Optimized React patterns and memoization
- **Fast Refresh**: Hot module replacement for development

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style and component patterns
2. Use TypeScript for all new code
3. Maintain responsive design principles
4. Test across different screen sizes and browsers
5. Ensure proper error handling for all user actions

## Security

- **Input Validation**: All user inputs are validated and sanitized
- **Error Messages**: No sensitive information exposed in error messages
- **Local Storage**: Only non-sensitive data stored locally
- **HTTPS**: Enforce HTTPS in production environments