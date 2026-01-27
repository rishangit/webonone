# Frontend Environment Setup

## 🎯 Overview

The frontend now uses a centralized environment configuration system that manages API URLs, feature flags, and other environment variables.

## 📁 Environment Files

### 1. Environment Configuration (`src/config/environment.ts`)
- **Centralized config**: All environment variables in one place
- **Type safety**: TypeScript interfaces for configuration
- **API endpoints**: Pre-configured API endpoints for all services
- **Development utilities**: Logging, debugging, and development helpers

### 2. Environment Template (`.env.example`)
- **Template file**: Copy this to create your `.env` file
- **All variables**: Complete list of available environment variables
- **Documentation**: Comments explaining each variable

## 🚀 Quick Setup

### Option 1: Automatic Setup
```bash
cd front-end
npm run setup:env
```

### Option 2: Manual Setup
```bash
cd front-end
cp .env.example .env
```

## 🔧 Environment Variables

### API Configuration
```env
# Backend API URLs
VITE_API_BASE_URL=http://localhost:5007/api
VITE_API_URL=http://localhost:5007
```

### Application Settings
```env
# App Information
VITE_APP_NAME=AppointmentPro
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Full-stack appointment booking application
```

### Development Settings
```env
# Development Mode
VITE_DEV_MODE=true
VITE_DEBUG_MODE=false
```

### Feature Flags
```env
# Feature Toggles
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_TOOLS=true
VITE_ENABLE_MOCK_DATA=false
```

### External Services
```env
# Third-party Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_SENTRY_DSN=your_sentry_dsn
```

## 📋 Available API Endpoints

The environment configuration provides pre-configured endpoints for all services:

### Authentication
- `apiEndpoints.auth.login` - User login
- `apiEndpoints.auth.register` - User registration
- `apiEndpoints.auth.logout` - User logout
- `apiEndpoints.auth.me` - Get current user
- `apiEndpoints.auth.refresh` - Refresh token
- `apiEndpoints.auth.verify` - Verify token

### Users
- `apiEndpoints.users.list` - List users
- `apiEndpoints.users.profile(id)` - Get user profile
- `apiEndpoints.users.stats` - User statistics

### Appointments
- `apiEndpoints.appointments.list` - List appointments
- `apiEndpoints.appointments.create` - Create appointment
- `apiEndpoints.appointments.update(id)` - Update appointment
- `apiEndpoints.appointments.delete(id)` - Delete appointment
- `apiEndpoints.appointments.stats` - Appointment statistics

### Services
- `apiEndpoints.services.list` - List services
- `apiEndpoints.services.create` - Create service
- `apiEndpoints.services.update(id)` - Update service
- `apiEndpoints.services.delete(id)` - Delete service
- `apiEndpoints.services.search(term)` - Search services

### Categories
- `apiEndpoints.categories.list` - List categories
- `apiEndpoints.categories.active` - Active categories
- `apiEndpoints.categories.create` - Create category
- `apiEndpoints.categories.update(id)` - Update category
- `apiEndpoints.categories.delete(id)` - Delete category

## 🛠️ Usage in Code

### Import Configuration
```typescript
import { config, apiEndpoints, log } from '../config/environment';

// Use configuration
const apiUrl = config.apiBaseUrl;
const isDev = config.devMode;

// Use API endpoints
const response = await fetch(apiEndpoints.auth.login, {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Use logging
log.info('User logged in successfully');
log.error('API call failed', error);
```

### Environment Checks
```typescript
import { isDevelopment, isProduction, isDebugMode } from '../config/environment';

if (isDevelopment) {
  console.log('Development mode enabled');
}

if (isDebugMode) {
  console.log('Debug information:', data);
}
```

## 🔄 Development Workflow

### 1. Start Development
```bash
# Setup environment (first time only)
npm run setup:env

# Start development server
npm run dev
```

### 2. Customize Configuration
Edit the `.env` file to customize:
- API URLs for different environments
- Feature flags for testing
- External service keys
- Debug settings

### 3. Build for Production
```bash
# Build with production settings
npm run build

# Preview production build
npm run preview
```

## 🌍 Environment-Specific Configuration

### Development
```env
VITE_API_BASE_URL=http://localhost:5007/api
VITE_DEV_MODE=true
VITE_DEBUG_MODE=true
VITE_ENABLE_DEBUG_TOOLS=true
```

### Staging
```env
VITE_API_BASE_URL=https://staging-api.appointmentpro.com/api
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

### Production
```env
VITE_API_BASE_URL=https://api.appointmentpro.com/api
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_TOOLS=false
```

## 🔍 Debugging

### Enable Debug Mode
```env
VITE_DEBUG_MODE=true
```

### Debug Logging
```typescript
import { log } from '../config/environment';

// These will only log in debug mode
log.debug('API request:', requestData);
log.debug('API response:', responseData);
```

### Development Tools
```typescript
import { config } from '../config/environment';

if (config.enableDebugTools) {
  // Show debug panel
  // Enable performance monitoring
  // Display API call logs
}
```

## 📦 Build Configuration

### Vite Configuration
The environment variables are automatically loaded by Vite:
- Variables prefixed with `VITE_` are available in the browser
- Variables are replaced at build time
- Type safety is maintained through TypeScript

### Build Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "setup:env": "node scripts/setup-env.js"
  }
}
```

## 🚨 Security Notes

### Environment Variables
- Only variables prefixed with `VITE_` are exposed to the browser
- Never put sensitive data in environment variables
- Use server-side environment variables for secrets

### API Keys
- Store API keys in environment variables
- Use different keys for different environments
- Rotate keys regularly in production

## 🎉 Benefits

1. **Centralized Configuration**: All environment settings in one place
2. **Type Safety**: TypeScript interfaces prevent configuration errors
3. **API Endpoints**: Pre-configured endpoints for all services
4. **Development Tools**: Built-in logging and debugging utilities
5. **Environment-Specific**: Easy configuration for different environments
6. **Feature Flags**: Toggle features without code changes
7. **External Services**: Easy integration with third-party services

The environment system is now fully configured and ready to use!





