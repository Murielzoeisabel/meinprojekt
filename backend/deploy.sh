#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "=== STARTING DEPLOY SCRIPT ==="

# Set Node version to 20
echo "Setting Node version to 20..."
echo "20" > ~/.nodeversion

# Load system and user profiles to initialize the environment path
echo "Sourcing profiles..."
source /etc/profile || true
source ~/.profile || true
source ~/.bashrc || true

# Add fallback Node/NPM paths
export PATH=$PATH:/usr/local/bin:/usr/node/bin:/opt/node/bin

echo "=== DIAGNOSTICS ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node -v 2>&1 || echo 'not found')"
echo "NPM version: $(npm -v 2>&1 || echo 'not found')"
echo "PATH: $PATH"

# Change directory to backend
cd ~/meinprojekt/backend || { echo "Failed to change directory to ~/meinprojekt/backend"; exit 1; }

echo "=== RUNNING NPM CI ==="
npm ci --omit=dev

echo "=== RUNNING PRISMA GENERATE ==="
npx prisma generate

echo "=== RUNNING PRISMA MIGRATE ==="
npx prisma migrate deploy

echo "=== RESTARTING PASSENGER ==="
mkdir -p tmp
touch tmp/restart.txt

echo "=== DEPLOYMENT SUCCESSFUL ==="
