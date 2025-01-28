#!/bin/bash

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

if [ "$ARCH" = "x86_64" ]; then
  ARCH="amd64"
elif [ "$ARCH" = "aarch64" ]; then
  ARCH="arm64"
fi

# Set PocketBase version
VERSION="0.23.5"

# Set download URL based on OS and architecture
if [ "$OS" = "darwin" ]; then
  URL="https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_darwin_${ARCH}.zip"
elif [ "$OS" = "linux" ]; then
  URL="https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_linux_${ARCH}.zip"
else
  echo "Unsupported operating system: $OS"
  exit 1
fi

# Create pocketbase directory if it doesn't exist
mkdir -p pocketbase

# Download and extract PocketBase
echo "Downloading PocketBase v${VERSION} for ${OS}_${ARCH}..."
curl -L "$URL" -o pocketbase.zip
unzip -o pocketbase.zip -d pocketbase
rm pocketbase.zip

# Make PocketBase executable
chmod +x pocketbase/pocketbase

# Copy schema file
cp pb_schema.json pocketbase/

echo "PocketBase setup complete!"
echo "To start PocketBase, run: cd pocketbase && ./pocketbase serve" 