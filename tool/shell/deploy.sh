#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
  echo "sshpass could not be found. Please install sshpass to proceed."
  exit 1
fi

# Default values
DEFAULT_SERVER_ADDRESS="52.221.220.151"
DEFAULT_USERNAME="ubuntu"

# Read inputs from the user with default values
read -p "Enter server address [${DEFAULT_SERVER_ADDRESS}]: " serverAddress
serverAddress=${serverAddress:-$DEFAULT_SERVER_ADDRESS}

read -p "Enter username [${DEFAULT_USERNAME}]: " username
username=${username:-$DEFAULT_USERNAME}

yarn build
rsync -avz \
    -e "ssh -i aws-access-key.pem" \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude '.git' \
    ./ \
    "$username"@"$serverAddress":/home/ubuntu/apps/hackimore-backend
