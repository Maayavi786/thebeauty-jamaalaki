#!/bin/bash

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI is not installed. Installing..."
    npm install -g netlify-cli
fi

# Login to Netlify if not already logged in
if ! netlify whoami &> /dev/null; then
    echo "Please login to Netlify..."
    netlify login
fi

# Link to existing site
echo "Linking to existing site: thebeauty..."
netlify link --name thebeauty

# Set up Git remote if not already set
if ! git remote get-url netlify &> /dev/null; then
    echo "Adding Netlify remote..."
    git remote add netlify https://github.com/Maayavi786/https---github.com-Maayavi786-jamaalakiwinsurf.git
fi

# Set up environment variables
echo "Setting up environment variables..."

# Database configuration
read -p "Enter your DATABASE_URL: " db_url
netlify env:set DATABASE_URL "$db_url"

# Session configuration
read -p "Enter your SESSION_SECRET: " session_secret
netlify env:set SESSION_SECRET "$session_secret"

# API configuration
netlify env:set VITE_API_BASE_URL "https://thebeauty.netlify.app"

# CORS configuration
netlify env:set ALLOWED_ORIGINS "https://thebeauty.netlify.app,http://localhost:5173"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod

echo "Configuration complete!"
echo "Your site is configured at https://thebeauty.netlify.app"
echo "GitHub repository: https://github.com/Maayavi786/https---github.com-Maayavi786-jamaalakiwinsurf.git" 