#!/usr/bin/env node

/**
 * Script to run comprehensive tests for the application
 * This checks local environment, mock data, and Firebase configurations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  fg: {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
  }
};

// Helper functions for console output
const log = {
  info: (message) => console.log(`${colors.fg.blue}ℹ️ ${message}${colors.reset}`),
  success: (message) => console.log(`${colors.fg.green}✅ ${message}${colors.reset}`),
  warning: (message) => console.log(`${colors.fg.yellow}⚠️ ${message}${colors.reset}`),
  error: (message) => console.log(`${colors.fg.red}❌ ${message}${colors.reset}`),
  title: (message) => console.log(`\n${colors.fg.cyan}${colors.bright}${message}${colors.reset}\n`)
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if a URL is reachable
async function isUrlReachable(url, timeoutMs = 2000) {
  return new Promise(resolve => {
    const request = http.get(url, { timeout: timeoutMs }, response => {
      resolve(response.statusCode === 200);
    });
    
    request.on('error', () => {
      resolve(false);
    });
    
    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });
  });
}

// Check files and environments
async function checkEnvironment() {
  log.title('Checking Development Environment');
  
  // Check Node.js version
  try {
    const nodeVersion = execSync('node --version').toString().trim();
    log.info(`Node.js version: ${nodeVersion}`);
    
    // Validate Node.js version (ensure it's 18+)
    const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
    if (majorVersion < 18) {
      log.warning(`Node.js version should be 18 or higher. Current version: ${nodeVersion}`);
    } else {
      log.success('Node.js version is compatible');
    }
  } catch (error) {
    log.error('Failed to check Node.js version');
  }
  
  // Check npm version
  try {
    const npmVersion = execSync('npm --version').toString().trim();
    log.info(`npm version: ${npmVersion}`);
  } catch (error) {
    log.error('Failed to check npm version');
  }
  
  // Check required environment files
  const envFiles = [
    path.join(__dirname, '..', 'client', '.env.development'),
    path.join(__dirname, '..', 'client', '.env.production')
  ];
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log.success(`Found ${path.basename(file)}`);
    } else {
      log.error(`Missing ${path.basename(file)}`);
    }
  });
  
  // Check deployment configurations
  const configFiles = [
    { path: path.join(__dirname, '..', 'netlify.toml'), name: 'Netlify config' },
    { path: path.join(__dirname, '..', 'firebase.json'), name: 'Firebase config' },
    { path: path.join(__dirname, '..', 'firestore.rules'), name: 'Firestore rules' },
    { path: path.join(__dirname, '..', 'storage.rules'), name: 'Storage rules' }
  ];
  
  configFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      log.success(`Found ${file.name}`);
    } else {
      log.error(`Missing ${file.name}`);
    }
  });
}

// Test Firebase mock data implementation
async function testMockData() {
  log.title('Testing Mock Data Implementation');
  
  // Check if mock data files exist
  const mockDataFile = path.join(__dirname, '..', 'client', 'src', 'lib', 'firebase', 'mockData.ts');
  const localTestingFile = path.join(__dirname, '..', 'client', 'src', 'lib', 'firebase', 'localTesting.ts');
  
  if (fs.existsSync(mockDataFile)) {
    log.success('Found mock data implementation');
  } else {
    log.error('Missing mock data implementation');
    return;
  }
  
  if (fs.existsSync(localTestingFile)) {
    log.success('Found local testing implementation');
  } else {
    log.error('Missing local testing implementation');
    return;
  }
  
  // Check client environment file for mock data flag
  const envDevFile = path.join(__dirname, '..', 'client', '.env.development');
  if (fs.existsSync(envDevFile)) {
    const envContent = fs.readFileSync(envDevFile, 'utf8');
    if (envContent.includes('VITE_USE_MOCK_DATA=true')) {
      log.success('Mock data is enabled in development environment');
    } else {
      log.warning('Mock data is not enabled in development environment');
    }
  }
}

// Test Firebase emulator configuration
async function testFirebaseEmulators() {
  log.title('Testing Firebase Emulators Configuration');
  
  // Check if Firebase CLI is installed
  try {
    const firebaseVersion = execSync('firebase --version').toString().trim();
    log.success(`Firebase CLI version: ${firebaseVersion}`);
  } catch (error) {
    log.error('Firebase CLI is not installed. Install it with: npm install -g firebase-tools');
    return;
  }
  
  // Check if emulators are configured in Firebase JSON
  const firebaseJsonFile = path.join(__dirname, '..', 'firebase.json');
  if (fs.existsSync(firebaseJsonFile)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseJsonFile, 'utf8'));
    if (firebaseConfig.emulators) {
      log.success('Firebase emulators are configured');
      
      // Log configured emulators
      Object.entries(firebaseConfig.emulators).forEach(([emulator, config]) => {
        if (emulator !== 'ui') {
          log.info(`${emulator} emulator configured on port: ${config.port}`);
        }
      });
    } else {
      log.warning('Firebase emulators are not configured in firebase.json');
    }
  }
  
  // Check if emulator code integration exists
  const emulatorsFile = path.join(__dirname, '..', 'client', 'src', 'lib', 'firebase', 'emulators.ts');
  if (fs.existsSync(emulatorsFile)) {
    log.success('Found Firebase emulators integration code');
  } else {
    log.error('Missing Firebase emulators integration code');
  }
}

// Test Firebase production configuration
async function testFirebaseProduction() {
  log.title('Testing Firebase Production Configuration');
  
  // Check if Firebase project is configured
  try {
    const projects = execSync('firebase projects:list').toString().trim();
    log.success('Firebase projects found');
  } catch (error) {
    log.warning('Failed to list Firebase projects. Make sure you are logged in to Firebase CLI');
  }
  
  // Check production environment file for Firebase configuration
  const envProdFile = path.join(__dirname, '..', 'client', '.env.production');
  if (fs.existsSync(envProdFile)) {
    const envContent = fs.readFileSync(envProdFile, 'utf8');
    
    // Check for required configurations
    const requiredVars = [
      'VITE_USE_FIREBASE=true',
      'VITE_USE_MOCK_DATA=false',
      'VITE_USE_FIREBASE_EMULATORS=false'
    ];
    
    const missingVars = requiredVars.filter(variable => !envContent.includes(variable));
    
    if (missingVars.length === 0) {
      log.success('Production environment is correctly configured for Firebase');
    } else {
      log.warning('Production environment is missing some Firebase configurations:');
      missingVars.forEach(variable => log.info(`- Missing: ${variable}`));
    }
  }
}

// Check Netlify configuration
async function testNetlifyConfiguration() {
  log.title('Testing Netlify Configuration');
  
  // Check if Netlify CLI is installed
  try {
    const netlifyVersion = execSync('netlify --version').toString().trim();
    log.success(`Netlify CLI version: ${netlifyVersion}`);
  } catch (error) {
    log.warning('Netlify CLI is not installed. Install it with: npm install -g netlify-cli');
  }
  
  // Check Netlify functions
  const functionsDir = path.join(__dirname, '..', 'netlify', 'functions');
  if (fs.existsSync(functionsDir)) {
    // Count function files
    const functionFiles = fs.readdirSync(functionsDir)
      .filter(file => file.endsWith('.js') || file.endsWith('.ts'));
    
    if (functionFiles.length > 0) {
      log.success(`Found ${functionFiles.length} Netlify functions`);
    } else {
      log.warning('Netlify functions directory exists but contains no JavaScript/TypeScript files');
    }
  } else {
    log.error('Netlify functions directory not found');
  }
  
  // Check netlify.toml configuration
  const netlifyTomlFile = path.join(__dirname, '..', 'netlify.toml');
  if (fs.existsSync(netlifyTomlFile)) {
    const tomlContent = fs.readFileSync(netlifyTomlFile, 'utf8');
    
    // Check for required configurations
    if (tomlContent.includes('functions')) {
      log.success('Netlify functions are configured in netlify.toml');
    } else {
      log.warning('Netlify functions section not found in netlify.toml');
    }
    
    if (tomlContent.includes('redirect')) {
      log.success('Netlify redirects are configured');
    } else {
      log.warning('Netlify redirects not configured in netlify.toml');
    }
  }
}

// Main function to run all tests
async function runAllTests() {
  log.title('Starting Comprehensive Tests');
  
  try {
    await checkEnvironment();
    await testMockData();
    await testFirebaseEmulators();
    await testFirebaseProduction();
    await testNetlifyConfiguration();
    
    log.title('All Tests Completed');
    log.info('Review the results above to ensure your environment is properly configured.');
    log.info('For any warnings or errors, refer to the documentation:');
    log.info('- Local Testing: client/MOCK_TESTING.md');
    log.info('- Deployment: FIREBASE_PRODUCTION.md');
  } catch (error) {
    log.error(`Test script failed: ${error.message}`);
  }
}

// Execute all tests
runAllTests();
