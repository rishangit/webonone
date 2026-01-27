#!/usr/bin/env node

/**
 * Oracle Cloud Environment Setup Script
 * This script helps create a .env.oracle file with your Oracle Cloud MySQL configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupOracleEnv() {
  console.log('🚀 Oracle Cloud Environment Setup\n');
  console.log('This script will help you create a .env.oracle file for Oracle Cloud deployment.\n');

  // Get MySQL endpoint
  const dbHost = await question('Enter MySQL endpoint (from OCI Console > MySQL > Endpoints): ');
  const dbPort = await question('Enter MySQL port (default: 3306): ') || '3306';
  const dbUser = await question('Enter MySQL username (default: admin): ') || 'admin';
  const dbPassword = await question('Enter MySQL password: ');
  const dbName = await question('Enter database name (default: appapp): ') || 'appapp';

  // Server configuration
  const port = await question('Enter server port (default: 5007): ') || '5007';
  const nodeEnv = await question('Enter NODE_ENV (default: production): ') || 'production';

  // JWT configuration
  const jwtSecret = await question('Enter JWT secret (or press Enter to generate): ');
  const finalJwtSecret = jwtSecret || require('crypto').randomBytes(32).toString('base64');

  // CORS configuration
  const frontendUrl = await question('Enter frontend URL (e.g., https://yourdomain.com): ');

  // Rate limiting
  const rateLimitWindow = await question('Enter rate limit window in ms (default: 900000): ') || '900000';
  const rateLimitMax = await question('Enter max requests per window (default: 2000): ') || '2000';

  // Google Maps API
  const googleMapsKey = await question('Enter Google Maps API key: ');

  // Generate .env content
  const envContent = `# Oracle Cloud Infrastructure (OCI) MySQL Database Configuration
# Generated on: ${new Date().toISOString()}
# DB System: mysql-appapp
# Region: uk-london-1

# Database Configuration
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}

# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# JWT Configuration
JWT_SECRET=${finalJwtSecret}
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=${frontendUrl}

# Rate Limiting (Production settings)
RATE_LIMIT_WINDOW_MS=${rateLimitWindow}
RATE_LIMIT_MAX_REQUESTS=${rateLimitMax}

# Google Maps API
GOOGLE_MAPS_API_KEY=${googleMapsKey}
`;

  // Write to file
  const envPath = path.join(__dirname, '.env.oracle');
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Successfully created .env.oracle file!');
  console.log(`📁 Location: ${envPath}\n`);
  console.log('⚠️  IMPORTANT:');
  console.log('   - Never commit .env.oracle to version control');
  console.log('   - Keep your credentials secure');
  console.log('   - Use this file when deploying to Oracle Cloud\n');

  rl.close();
}

// Run the setup
setupOracleEnv().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
