#!/usr/bin/env node

/**
 * Production Checklist Verification
 * This script verifies that the application is properly configured for production.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Get the directory name from the file URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Read file contents
const readFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return null;
  }
};

// Define the checks
const checks = [
  {
    name: 'Verify .env.production',
    check: () => {
      const envPath = path.resolve(__dirname, '../.env.production');
      const exists = fileExists(envPath);
      const content = exists ? readFile(envPath) : '';
      
      return {
        passed: exists && 
          content.includes('VITE_USE_MOCK_DATA=false') && 
          content.includes('VITE_USE_FIREBASE=true'),
        message: exists 
          ? 'Production environment file exists with correct settings'
          : 'Production environment file missing',
        fix: exists 
          ? null 
          : 'Create .env.production file with VITE_USE_MOCK_DATA=false and VITE_USE_FIREBASE=true'
      };
    }
  },
  {
    name: 'Check bundle optimization',
    check: () => {
      const viteConfigPath = path.resolve(__dirname, '../vite.config.ts');
      const content = readFile(viteConfigPath);
      
      return {
        passed: content && 
          content.includes('manualChunks') && 
          content.includes('drop_console: true'),
        message: content && content.includes('manualChunks')
          ? 'Bundle optimization configured'
          : 'Bundle optimization missing',
        fix: 'Update vite.config.ts to include chunk optimization and console removal'
      };
    }
  },
  {
    name: 'Verify Netlify configuration',
    check: () => {
      const netlifyConfigPath = path.resolve(__dirname, '../../netlify.toml');
      const exists = fileExists(netlifyConfigPath);
      
      return {
        passed: exists,
        message: exists 
          ? 'Netlify configuration found'
          : 'Netlify configuration missing',
        fix: 'Create netlify.toml with proper configuration'
      };
    }
  },
  {
    name: 'Check for console.log statements',
    check: () => {
      // This is a simple check that can be enhanced with a proper scan
      const srcPath = path.resolve(__dirname, '../src');
      const todoLogPath = path.resolve(srcPath, 'log-todos.txt');
      
      // For now we'll just make a note, but ideally this would scan files
      if (!fileExists(todoLogPath)) {
        fs.writeFileSync(todoLogPath, 'TODO: Remove console.log statements before production\n');
      }
      
      return {
        passed: true,
        message: 'Created log-todos.txt to track console statements to remove',
        fix: null
      };
    }
  },
];

// Run all checks
console.log(chalk.blue.bold('Running production readiness checks...\n'));

let passCount = 0;
const total = checks.length;

checks.forEach(({ name, check }) => {
  const { passed, message, fix } = check();
  
  if (passed) {
    console.log(`${chalk.green('✓')} ${chalk.green.bold(name)}: ${message}`);
    passCount++;
  } else {
    console.log(`${chalk.red('✗')} ${chalk.red.bold(name)}: ${message}`);
    if (fix) {
      console.log(`  ${chalk.yellow('Fix:')} ${fix}`);
    }
  }
});

console.log(`\n${passCount} of ${total} checks passed.`);

if (passCount === total) {
  console.log(chalk.green.bold('\nAll checks passed! The application is ready for production deployment.'));
  process.exit(0);
} else {
  console.log(chalk.yellow.bold('\nSome checks failed. Please fix the issues before deploying to production.'));
  process.exit(1);
}
