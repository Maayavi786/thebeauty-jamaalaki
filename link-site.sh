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

# Unlink any existing sites
echo "Unlinking any existing sites..."
netlify unlink

# Create new site or link to existing one
echo "Setting up site..."
if ! netlify link --name thebeauty; then
    echo "Site 'thebeauty' not found. Creating new site..."
    netlify sites:create --name thebeauty
    netlify link --name thebeauty
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

echo "Site linking complete!"
echo "Your site is configured at https://thebeauty.netlify.app" 