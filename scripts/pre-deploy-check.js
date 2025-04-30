#!/usr/bin/env node

/**
 * Pre-deployment check script
 * This script verifies that all necessary configurations are in place for a successful deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Check if a file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Check if a string exists in a file
function fileContains(filePath, searchString) {
  if (!fileExists(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes(searchString);
}

// Check Firebase configuration
function checkFirebaseConfig() {
  log.title('Checking Firebase Configuration');
  
  // Check firebase.json
  const firebaseJsonPath = path.join(__dirname, '..', 'firebase.json');
  if (fileExists(firebaseJsonPath)) {
    log.success('firebase.json exists');
    
    // Check for key configurations
    const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    
    if (firebaseJson.firestore) {
      log.success('Firestore configuration found');
    } else {
      log.warning('Firestore configuration missing in firebase.json');
    }
    
    if (firebaseJson.hosting) {
      log.success('Hosting configuration found');
    } else {
      log.warning('Hosting configuration missing in firebase.json');
    }
    
    if (firebaseJson.emulators) {
      log.success('Emulators configuration found');
    } else {
      log.warning('Emulators configuration missing in firebase.json');
    }
  } else {
    log.error('firebase.json does not exist');
  }
  
  // Check .firebaserc
  const firebaseRcPath = path.join(__dirname, '..', '.firebaserc');
  if (fileExists(firebaseRcPath)) {
    log.success('.firebaserc exists');
    
    // Check for project ID
    const firebaseRc = JSON.parse(fs.readFileSync(firebaseRcPath, 'utf8'));
    if (firebaseRc.projects && firebaseRc.projects.default) {
      log.success(`Default project ID found: ${firebaseRc.projects.default}`);
    } else {
      log.warning('Default project ID missing in .firebaserc');
    }
  } else {
    log.warning('.firebaserc does not exist. Run "firebase init" to configure Firebase project.');
  }
  
  // Check security rules
  const firestoreRulesPath = path.join(__dirname, '..', 'firestore.rules');
  if (fileExists(firestoreRulesPath)) {
    log.success('firestore.rules exists');
  } else {
    log.error('firestore.rules does not exist');
  }
  
  const storageRulesPath = path.join(__dirname, '..', 'storage.rules');
  if (fileExists(storageRulesPath)) {
    log.success('storage.rules exists');
  } else {
    log.error('storage.rules does not exist');
  }
}

// Check environment files
function checkEnvironmentFiles() {
  log.title('Checking Environment Configuration');
  
  // Check client .env.production
  const envProductionPath = path.join(__dirname, '..', 'client', '.env.production');
  if (fileExists(envProductionPath)) {
    log.success('.env.production exists');
    
    // Check for key configurations
    const envProduction = fs.readFileSync(envProductionPath, 'utf8');
    
    if (envProduction.includes('VITE_USE_FIREBASE=true')) {
      log.success('Firebase is enabled in production');
    } else {
      log.error('Firebase is not enabled in production (VITE_USE_FIREBASE)');
    }
    
    if (envProduction.includes('VITE_USE_MOCK_DATA=false')) {
      log.success('Mock data is disabled in production');
    } else {
      log.warning('Mock data may be enabled in production (VITE_USE_MOCK_DATA)');
    }
  } else {
    log.error('client/.env.production does not exist');
  }
  
  // Check client .env.development
  const envDevelopmentPath = path.join(__dirname, '..', 'client', '.env.development');
  if (fileExists(envDevelopmentPath)) {
    log.success('.env.development exists');
  } else {
    log.warning('client/.env.development does not exist');
  }
}

// Check deployment configuration
function checkDeploymentConfig() {
  log.title('Checking Deployment Configuration');
  
  // Check netlify.toml
  const netlifyTomlPath = path.join(__dirname, '..', 'netlify.toml');
  if (fileExists(netlifyTomlPath)) {
    log.success('netlify.toml exists');
    
    // Check for Firebase CSP configuration
    if (fileContains(netlifyTomlPath, 'firebaseio.com')) {
      log.success('Firebase domains allowed in Content Security Policy');
    } else {
      log.warning('Firebase domains may not be allowed in Content Security Policy');
    }
  } else {
    log.error('netlify.toml does not exist');
  }
  
  // Check deployment documentation
  const deploymentMdPath = path.join(__dirname, '..', 'DEPLOYMENT.md');
  if (fileExists(deploymentMdPath)) {
    log.success('DEPLOYMENT.md exists');
  } else {
    log.warning('DEPLOYMENT.md does not exist');
  }
  
  const firebaseProdMdPath = path.join(__dirname, '..', 'FIREBASE_PRODUCTION.md');
  if (fileExists(firebaseProdMdPath)) {
    log.success('FIREBASE_PRODUCTION.md exists');
  } else {
    log.warning('FIREBASE_PRODUCTION.md does not exist');
  }
}

// Check client implementations
function checkClientImplementation() {
  log.title('Checking Client Implementation');
  
  // Check mock data implementation
  const mockDataPath = path.join(__dirname, '..', 'client', 'src', 'lib', 'firebase', 'mockData.ts');
  if (fileExists(mockDataPath)) {
    log.success('Mock data implementation exists');
  } else {
    log.error('Mock data implementation does not exist');
  }
  
  // Check mock data indicator
  const mockIndicatorPath = path.join(__dirname, '..', 'client', 'src', 'components', 'MockDataIndicator.tsx');
  if (fileExists(mockIndicatorPath)) {
    log.success('Mock data indicator component exists');
  } else {
    log.warning('Mock data indicator component does not exist');
  }
  
  // Check emulator configuration
  const emulatorsPath = path.join(__dirname, '..', 'client', 'src', 'lib', 'firebase', 'emulators.ts');
  if (fileExists(emulatorsPath)) {
    log.success('Emulators configuration exists');
  } else {
    log.warning('Emulators configuration does not exist');
  }
  
  // Check query client implementation
  const queryClientPath = path.join(__dirname, '..', 'client', 'src', 'lib', 'queryClient.ts');
  if (fileExists(queryClientPath)) {
    log.success('Query client implementation exists');
    
    // Check for mock Firebase request handler
    if (fileContains(queryClientPath, 'handleMockFirebaseRequest')) {
      log.success('Mock Firebase request handler found in queryClient.ts');
    } else {
      log.error('Mock Firebase request handler not found in queryClient.ts');
    }
  } else {
    log.error('Query client implementation does not exist');
  }
}

// Check for Firebase CLI
function checkFirebaseCLI() {
  log.title('Checking Firebase CLI');
  
  try {
    const output = execSync('firebase --version', { stdio: 'pipe' }).toString().trim();
    log.success(`Firebase CLI is installed (${output})`);
  } catch (error) {
    log.error('Firebase CLI is not installed or not accessible');
    log.info('Install Firebase CLI with: npm install -g firebase-tools');
  }
}

// Run all checks
function runAllChecks() {
  log.title('Running Pre-Deployment Checks');
  
  checkFirebaseConfig();
  checkEnvironmentFiles();
  checkDeploymentConfig();
  checkClientImplementation();
  checkFirebaseCLI();
  
  log.title('Pre-Deployment Checks Complete');
  log.info('Review the results above to ensure your configuration is correct before deploying.');
}

// Run the checks
runAllChecks();
