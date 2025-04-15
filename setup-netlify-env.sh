#!/bin/bash

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI is not installed. Please install it first:"
    echo "npm install -g netlify-cli"
    exit 1
fi

# Function to prompt for sensitive input
prompt_for_secret() {
    local prompt="$1"
    local var_name="$2"
    read -s -p "$prompt: " value
    echo
    netlify env:set "$var_name" "$value"
}

# Function to set non-sensitive variables
set_env_var() {
    local var_name="$1"
    local value="$2"
    netlify env:set "$var_name" "$value"
}

# Login to Netlify if not already logged in
if ! netlify whoami &> /dev/null; then
    echo "Please login to Netlify..."
    netlify login
fi

# Set site ID (you'll need to replace this with your actual site ID)
SITE_ID="thebeauty.netlify.app"

# Set the site context
netlify link --name "$SITE_ID"

# Set environment variables
echo "Setting up environment variables..."

# Database configuration
prompt_for_secret "Enter your DATABASE_URL" "DATABASE_URL"

# Session configuration
prompt_for_secret "Enter your SESSION_SECRET" "SESSION_SECRET"

# API and CORS configuration
set_env_var "VITE_API_BASE_URL" "https://thebeauty.netlify.app"
set_env_var "ALLOWED_ORIGINS" "https://thebeauty.netlify.app,http://localhost:5173"

# Verify the environment variables
echo "Verifying environment variables..."
netlify env:list

echo "Environment variables setup complete!"
echo "Please verify the values in your Netlify dashboard." 