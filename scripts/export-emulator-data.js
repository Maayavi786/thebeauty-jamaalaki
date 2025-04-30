#!/usr/bin/env node

/**
 * Script to export data from Firebase emulators
 * This allows saving emulator state for future sessions
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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

// Create the seed directory if it doesn't exist
const seedDir = path.join(__dirname, '..', 'firebase-data-seed');
if (!fs.existsSync(seedDir)) {
  log.title('Creating seed data directory...');
  fs.mkdirSync(seedDir, { recursive: true });
  log.success('Seed data directory created');
}

// Export data from emulators to the seed directory
log.title('Exporting emulator data...');
try {
  execSync('firebase emulators:export ./firebase-data-seed', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  log.success('Export complete! Emulator data saved for future sessions.');
} catch (error) {
  log.error('Failed to export emulator data');
  log.warning('Make sure the emulators are running before using this script.');
  log.info('Start emulators with: npm run emulators');
  process.exit(1);
}
