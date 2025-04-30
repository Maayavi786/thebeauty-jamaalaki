#!/usr/bin/env node

/**
 * Script to start Firebase emulators with initial seed data
 * This provides a local Firebase environment for development and testing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
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

// Check if firebase-tools is installed
try {
  log.title('Checking for Firebase CLI...');
  execSync('firebase --version', { stdio: 'ignore' });
  log.success('Firebase CLI is installed');
} catch (error) {
  log.error('Firebase CLI is not installed');
  log.info('Installing Firebase CLI globally...');
  
  try {
    execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    log.success('Firebase CLI installed successfully');
  } catch (installError) {
    log.error('Failed to install Firebase CLI');
    log.info('Please run: npm install -g firebase-tools');
    process.exit(1);
  }
}

// Check if the user is logged in to Firebase
try {
  log.title('Checking Firebase authentication status...');
  execSync('firebase login:list', { stdio: 'ignore' });
  log.success('User is authenticated with Firebase');
} catch (error) {
  log.warning('Not logged in to Firebase');
  log.info('This is okay for emulator use, but you will not be able to deploy');
}

// Create seed data directory if it doesn't exist
const seedDir = path.join(__dirname, '..', 'firebase-data-seed');
if (!fs.existsSync(seedDir)) {
  log.title('Creating seed data directory...');
  fs.mkdirSync(seedDir, { recursive: true });
  fs.mkdirSync(path.join(seedDir, 'firestore'), { recursive: true });
  log.success('Seed data directory created');
}

// Create default export script if it doesn't exist
const exportScript = path.join(__dirname, 'export-emulator-data.js');
if (!fs.existsSync(exportScript)) {
  log.title('Creating emulator data export script...');
  fs.writeFileSync(exportScript, `#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

// Export data from emulators to the seed directory
console.log('Exporting emulator data...');
execSync('firebase emulators:export ../firebase-data-seed', {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});
console.log('Export complete!');
`);
  fs.chmodSync(exportScript, '755');
  log.success('Export script created');
}

// Start the emulators with data seeding
log.title('Starting Firebase emulators...');
try {
  const command = 'firebase emulators:start --import=./firebase-data-seed --export-on-exit';
  log.info(`Running: ${command}`);
  execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} catch (error) {
  log.error('Failed to start emulators');
  log.info(error.message);
  process.exit(1);
}
