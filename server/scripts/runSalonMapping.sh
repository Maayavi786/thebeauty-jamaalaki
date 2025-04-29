#!/bin/bash
# Script to run the salon mapping operation

# Get the username as an argument
USERNAME=$1

if [ -z "$USERNAME" ]; then
  echo "Please provide a username"
  echo "Usage: ./runSalonMapping.sh <username>"
  exit 1
fi

# Change to the server directory
cd "$(dirname "$0")/.."

# Ensure environment variables are loaded
if [ -f "../.env" ]; then
  export $(grep -v '^#' ../.env | xargs)
fi

# Run the mapping script
echo "Mapping salon ID 2 to user: $USERNAME"
node scripts/mapSalonToOwner.js "$USERNAME"

echo "Done!"
