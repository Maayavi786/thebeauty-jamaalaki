#!/usr/bin/env node

/**
 * Script to test the mock data implementation
 * Useful for verifying that the mock Firebase implementation works correctly
 */

import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the current file path (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Main function to run the mock data tests
async function runMockTests() {
  log.title('Running Mock Data Tests');
  
  // Create a temporary test runner file
  const tempTestFile = path.join(__dirname, 'temp-mock-test-runner.js');
  
  try {
    // Write the test runner code to a temporary file
    fs.writeFileSync(tempTestFile, `
    // Temp file to run mock data tests
    import { runAllMockTests } from '../src/lib/firebase/tests/mockDataTestUtil.js';
    
    async function runTests() {
      console.log('Starting mock data tests...');
      
      const results = await runAllMockTests();
      
      // Print auth test results
      console.log('\\n[AUTH_TEST_RESULTS]');
      console.log(JSON.stringify(results.auth, null, 2));
      
      // Print firestore test results
      console.log('\\n[FIRESTORE_TEST_RESULTS]');
      console.log(JSON.stringify(results.firestore, null, 2));
      
      // Print CRUD test results
      console.log('\\n[CRUD_TEST_RESULTS]');
      console.log(JSON.stringify(results.crud, null, 2));
      
      process.exit(0);
    }
    
    runTests().catch(error => {
      console.error('Error running tests:', error);
      process.exit(1);
    });
    `);
    
    // Create a temporary package.json for the test runner
    const tempPackageFile = path.join(__dirname, 'temp-package.json');
    fs.writeFileSync(tempPackageFile, JSON.stringify({
      "name": "mock-data-tests",
      "private": true,
      "type": "module"
    }));
    
    // Run the test
    log.info('Executing mock data tests...');
    log.info('This will test authentication, Firestore operations, and CRUD functionality');
    log.info('');
    
    // Execute the tests using Node.js with ESM support
    const result = execSync('NODE_ENV=development node --experimental-specifier-resolution=node --experimental-modules --es-module-specifiers temp-mock-test-runner.js', {
      cwd: __dirname,
      stdio: 'pipe'
    }).toString();
    
    // Parse and display the results
    const authResults = result.match(/\[AUTH_TEST_RESULTS\]([\s\S]*?)\n\[/m);
    const firestoreResults = result.match(/\[FIRESTORE_TEST_RESULTS\]([\s\S]*?)\n\[/m);
    const crudResults = result.match(/\[CRUD_TEST_RESULTS\]([\s\S]*?)$/m);
    
    if (authResults) {
      try {
        const parsedAuth = JSON.parse(authResults[1].trim());
        log.title('Authentication Tests');
        if (parsedAuth.success) {
          log.success('Authentication tests passed');
        } else {
          log.error('Authentication tests failed');
          parsedAuth.errors.forEach(err => log.warning(err));
        }
      } catch (error) {
        log.error('Failed to parse auth test results');
      }
    }
    
    if (firestoreResults) {
      try {
        const parsedFirestore = JSON.parse(firestoreResults[1].trim());
        log.title('Firestore Tests');
        if (parsedFirestore.success) {
          log.success('Firestore tests passed');
          log.info('Successfully fetched mock data for:');
          Object.entries(parsedFirestore)
            .filter(([key, value]) => key !== 'success' && key !== 'errors' && value === true)
            .forEach(([collection]) => log.info(`- ${collection}`));
        } else {
          log.error('Firestore tests failed');
          parsedFirestore.errors.forEach(err => log.warning(err));
        }
      } catch (error) {
        log.error('Failed to parse Firestore test results');
      }
    }
    
    if (crudResults) {
      try {
        const parsedCrud = JSON.parse(crudResults[1].trim());
        log.title('CRUD Operation Tests');
        if (parsedCrud.success) {
          log.success('CRUD operation tests passed');
          log.info('Successfully tested:');
          log.info('- Create: ✅');
          log.info('- Read: ✅');
          log.info('- Update: ✅');
          log.info('- Delete: ✅');
        } else {
          log.error('CRUD operation tests failed');
          parsedCrud.errors.forEach(err => log.warning(err));
        }
      } catch (error) {
        log.error('Failed to parse CRUD test results');
      }
    }
  } catch (error) {
    log.error(`Error running tests: ${error.message}`);
    if (error.stdout) {
      log.info('Test output:');
      console.log(error.stdout.toString());
    }
    if (error.stderr) {
      log.error('Test errors:');
      console.log(error.stderr.toString());
    }
  } finally {
    // Clean up temporary files
    try {
      if (fs.existsSync(tempTestFile)) {
        fs.unlinkSync(tempTestFile);
      }
      if (fs.existsSync(path.join(__dirname, 'temp-package.json'))) {
        fs.unlinkSync(path.join(__dirname, 'temp-package.json'));
      }
    } catch (cleanupError) {
      log.warning(`Error cleaning up temporary files: ${cleanupError.message}`);
    }
  }
}

// Run the tests
runMockTests();
