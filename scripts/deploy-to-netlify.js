#!/usr/bin/env node

/**
 * Script to deploy the application to Netlify
 * This handles the build and deployment process with proper environment variables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if netlify-cli is installed
log.title('Checking for Netlify CLI...');
try {
  execSync('netlify --version', { stdio: 'ignore' });
  log.success('Netlify CLI is installed');
} catch (error) {
  log.error('Netlify CLI is not installed');
  log.info('Installing Netlify CLI globally...');
  
  try {
    execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    log.success('Netlify CLI installed successfully');
  } catch (installError) {
    log.error('Failed to install Netlify CLI');
    log.info('Please run: npm install -g netlify-cli');
    process.exit(1);
  }
}

// Check if user is logged in to Netlify
log.title('Checking Netlify authentication status...');
try {
  execSync('netlify status', { stdio: 'ignore' });
  log.success('User is authenticated with Netlify');
} catch (error) {
  log.warning('Not logged in to Netlify');
  log.info('Please log in to Netlify...');
  
  try {
    execSync('netlify login', { stdio: 'inherit' });
    log.success('Netlify login successful');
  } catch (loginError) {
    log.error('Failed to log in to Netlify');
    process.exit(1);
  }
}

// Deployment function
async function deploy() {
  try {
    // Ask for deployment confirmation
    log.title('Ready to deploy to Netlify');
    log.warning('This will build and deploy the application to production.');
    log.info('Make sure you have configured all environment variables in Netlify UI:');
    log.info('- Firebase API key');
    log.info('- Firebase Auth Domain');
    log.info('- Firebase Project ID');
    log.info('- Firebase Storage Bucket');
    log.info('- Firebase Messaging Sender ID');
    log.info('- Firebase App ID');
    log.info('- Firebase Private Key (for functions)');
    log.info('- Firebase Client Email (for functions)');
    
    // Ask for confirmation
    rl.question('Proceed with deployment? (y/n): ', (answer) => {
      if (answer.toLowerCase() !== 'y') {
        log.info('Deployment cancelled');
        rl.close();
        return;
      }
      
      // Deploy to Netlify
      log.title('Deploying to Netlify...');
      try {
        // Check if netlify.toml exists
        const netlifyTomlPath = path.join(__dirname, '..', 'netlify.toml');
        if (!fs.existsSync(netlifyTomlPath)) {
          log.error('netlify.toml not found. Make sure you are in the correct directory.');
          rl.close();
          return;
        }
        
        // Run Netlify deploy
        log.info('Running Netlify deploy...');
        execSync('netlify deploy --prod', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        
        log.success('Deployment completed successfully!');
        log.info('Your application is now live on Netlify.');
      } catch (deployError) {
        log.error(`Deployment failed: ${deployError.message}`);
        log.info('Check the error message and try again.');
      }
      
      rl.close();
    });
  } catch (error) {
    log.error(`Deployment script error: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

// Run the deployment process
deploy();
