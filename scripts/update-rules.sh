#!/bin/bash

# Install dependencies if needed
npm install pocketbase

# Set admin credentials as environment variables
export PB_ADMIN_EMAIL="hello@ashrafali.net"
export PB_ADMIN_PASSWORD="rjq4dgb-dvc2EXP2xnu"

# Run the script
node scripts/update-collection-rules.js

# Clear the environment variables
unset PB_ADMIN_EMAIL
unset PB_ADMIN_PASSWORD
