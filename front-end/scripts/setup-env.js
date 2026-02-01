#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up frontend environment configuration...');

// Environment template
const envTemplate = `# Frontend Environment Variables

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5007/api
VITE_API_URL=http://localhost:5007

# Application Configuration
VITE_APP_NAME=webonone
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Full-stack appointment booking application

# Development Configuration
VITE_DEV_MODE=true
VITE_DEBUG_MODE=false

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_TOOLS=true
VITE_ENABLE_MOCK_DATA=false

# External Services (if needed)
VITE_GOOGLE_MAPS_API_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_SENTRY_DSN=

# Build Configuration
VITE_BUILD_TARGET=production
VITE_OUTPUT_DIR=dist`;

// Check if .env file already exists
const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../.env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
} else {
  try {
    // Create .env file
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env file');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    process.exit(1);
  }
}

// Create .env.example file
try {
  fs.writeFileSync(envExamplePath, envTemplate);
  console.log('✅ Created .env.example file');
} catch (error) {
  console.error('❌ Failed to create .env.example file:', error.message);
}

console.log('🎉 Frontend environment setup completed!');
console.log('📝 You can now customize the .env file with your specific values');
console.log('🔗 API Base URL: http://localhost:5007/api');
console.log('🌐 Frontend URL: http://localhost:3007');





