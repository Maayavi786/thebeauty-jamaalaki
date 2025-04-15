#!/bin/bash

# Configuration
SITE_ID="069c9446-cee2-4862-acb3-716877b79f6b"
NETLIFY_API_URL="https://api.netlify.com/api/v1"
DEPLOY_URL="https://app.netlify.com/sites/thebeauty/deploys"
MAX_RETRIES=5
RETRY_DELAY=30
NETLIFY_AUTH_TOKEN="nfp_vRpjLtxpBKiC5fA7D4CpTQf8yxFq1tZT1ae4"

# Security: Clean up sensitive data on exit
cleanup() {
    unset NETLIFY_AUTH_TOKEN
    exit 0
}
trap cleanup EXIT

# Function to make authenticated API calls
netlify_api_call() {
    local endpoint=$1
    local response=$(curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
        "$NETLIFY_API_URL/sites/$SITE_ID/$endpoint")
    if [ $? -ne 0 ]; then
        echo "Error: Failed to make API call to $endpoint"
        return 1
    fi
    echo "$response"
}

# Function to check deployment status
check_deploy_status() {
    local deploy_id=$1
    local response=$(netlify_api_call "deploys/$deploy_id")
    if [ $? -ne 0 ]; then
        echo "error"
        return 1
    fi
    local status=$(echo "$response" | jq -r '.state // empty')
    if [ -z "$status" ]; then
        echo "error"
        return 1
    fi
    echo "$status"
}

# Function to get error log
get_error_log() {
    local deploy_id=$1
    local response=$(netlify_api_call "deploys/$deploy_id")
    if [ $? -ne 0 ]; then
        echo "Error: Failed to get error log"
        return 1
    fi
    echo "$response" | jq -r '.error_message // empty'
}

# Function to get latest deploy ID
get_latest_deploy_id() {
    local response=$(netlify_api_call "deploys")
    if [ $? -ne 0 ]; then
        echo "Error: Failed to get latest deploy ID"
        return 1
    fi
    local deploy_id=$(echo "$response" | jq -r '.[0].id // empty')
    if [ -z "$deploy_id" ]; then
        echo "Error: No deployments found"
        return 1
    fi
    echo "$deploy_id"
}

# Function to fix common build errors
fix_build_errors() {
    local error_log=$1
    
    # Check for Vite plugin errors in production mode
    if grep -q "Cannot find package '@vitejs/plugin-react'" "$error_log"; then
        echo "Fixing Vite plugin error in production mode..."
        # Move @vitejs/plugin-react to dependencies
        sed -i 's/"@vitejs\/plugin-react":.*,//' client/package.json
        sed -i '/"dependencies": {/a\    "@vitejs/plugin-react": "^4.2.1",' client/package.json
        # Also move vite to dependencies
        sed -i 's/"vite":.*,//' client/package.json
        sed -i '/"dependencies": {/a\    "vite": "^5.4.18",' client/package.json
        git add client/package.json
        git commit -m "fix: move vite and @vitejs/plugin-react to dependencies for production build"
        git push
        return 0
    fi

    # Check for TypeScript type errors
    if grep -q "Cannot find type definition file for 'vite/client'" "$error_log"; then
        echo "Fixing TypeScript type error..."
        # Update tsconfig.json
        sed -i 's/"types": \[.*\]/"types": ["vite\/client", "node"]/' client/tsconfig.json
        git add client/tsconfig.json
        git commit -m "fix: update TypeScript types configuration"
        git push
        return 0
    fi

    # Check for bcrypt version errors
    if grep -q "No matching version found for bcrypt@" "$error_log"; then
        echo "Fixing bcrypt version error..."
        # Update bcrypt version
        sed -i 's/"bcrypt": ".*"/"bcrypt": "^5.1.1"/' package.json
        git add package.json
        git commit -m "fix: update bcrypt version"
        git push
        return 0
    fi

    # Check for express-session version errors
    if grep -q "No matching version found for express-session@" "$error_log"; then
        echo "Fixing express-session version error..."
        # Update express-session version
        sed -i 's/"express-session": ".*"/"express-session": "^1.17.3"/' package.json
        git add package.json
        git commit -m "fix: update express-session version"
        git push
        return 0
    fi

    # Check for React Query version errors
    if grep -q "No matching version found for react-query@" "$error_log"; then
        echo "Fixing React Query version error..."
        # Remove react-query and ensure @tanstack/react-query is used
        sed -i '/"react-query":.*,/d' client/package.json
        git add client/package.json
        git commit -m "fix: remove duplicate react-query package"
        git push
        return 0
    fi

    # Check for Node.js version compatibility
    if grep -q "engine.*node" "$error_log"; then
        echo "Fixing Node.js version compatibility..."
        # Update engines field in package.json
        sed -i '/"engines": {/,/}/d' package.json
        sed -i '/"dependencies": {/i\  "engines": {\n    "node": ">=20.0.0"\n  },' package.json
        git add package.json
        git commit -m "fix: update Node.js version requirements"
        git push
        return 0
    fi

    # Check for dependency conflicts
    if grep -q "ERESOLVE.*conflict" "$error_log"; then
        echo "Fixing dependency conflicts..."
        # Remove node_modules and package-lock.json
        rm -rf node_modules package-lock.json client/node_modules client/package-lock.json
        # Reinstall dependencies
        npm install
        git add package.json package-lock.json client/package.json client/package-lock.json
        git commit -m "fix: resolve dependency conflicts"
        git push
        return 0
    fi

    # Add more error patterns and fixes as needed
    return 1
}

# Main deployment monitoring loop
monitor_deployment() {
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        echo "Starting deployment monitoring..."
        
        # Get latest deploy ID
        deploy_id=$(get_latest_deploy_id)
        if [ $? -ne 0 ]; then
            echo "Failed to get latest deploy ID"
            return 1
        fi
        
        echo "Monitoring deployment: $deploy_id"
        
        # Monitor deployment status
        while true; do
            status=$(check_deploy_status "$deploy_id")
            
            case "$status" in
                "ready")
                    echo "Deployment successful!"
                    return 0
                    ;;
                "error")
                    echo "Deployment failed. Checking error log..."
                    error_log=$(get_error_log "$deploy_id")
                    
                    # Create temporary file for error log
                    echo "$error_log" > /tmp/netlify_error.log
                    
                    if [ -s /tmp/netlify_error.log ] && fix_build_errors /tmp/netlify_error.log; then
                        echo "Fixed build error. Retrying deployment..."
                        rm -f /tmp/netlify_error.log
                        retry_count=$((retry_count + 1))
                        break
                    else
                        echo "Could not fix build error. Error message:"
                        cat /tmp/netlify_error.log
                        rm -f /tmp/netlify_error.log
                        return 1
                    fi
                    ;;
                *)
                    echo "Deployment status: $status"
                    sleep $RETRY_DELAY
                    ;;
            esac
        done
    done
    
    echo "Maximum retry attempts reached. Manual intervention required."
    return 1
}

# Start monitoring
monitor_deployment 