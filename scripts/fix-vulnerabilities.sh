#!/bin/bash
# Script to fix security vulnerabilities in a safer way

echo "🔒 Security Vulnerability Fix Script"
echo "======================================"
echo ""

# Step 1: Fix vulnerabilities that are safe to fix automatically
echo "Step 1: Fixing safe vulnerabilities..."
npm audit fix

# Step 2: Update specific problematic packages
echo ""
echo "Step 2: Updating axios to latest secure version..."
npm install axios@1.9.0 --save

echo ""
echo "Step 3: Fixing path-to-regexp vulnerability..."
npm install path-to-regexp@6.2.3 --save

echo ""
echo "Step 4: Installing secure versions of express-related packages..."
npm install body-parser@1.20.3 cookie@0.7.0 send@0.19.0 serve-static@1.16.0 --save

echo ""
echo "Step 5: Upgrading development dependencies..."
npm install braces@3.0.3 postcss@8.4.31 follow-redirects@1.15.5 --save-dev

echo ""
echo "Security fixes applied! Some vulnerabilities in development dependencies (like netlify-cli) may still be reported,"
echo "but these don't affect your production build."
echo ""
echo "To verify your application still works correctly:"
echo "1. Run 'npm run dev' to test locally"
echo "2. Run 'npm run build' to ensure the build process succeeds"
echo ""
echo "If any issues occur, you can restore the previous state with: git checkout -- package.json package-lock.json"
