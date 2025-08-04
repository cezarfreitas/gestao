#!/bin/bash

# Ecko Streetwear Lead Management System - Build Script
# Usage: ./build.sh

set -e

echo "🏗️  Building Ecko Streetwear Lead Management System"
echo "=================================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist node_modules/.vite

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --no-audit --no-fund

# Build the application
echo "⚡ Building application..."
npm run build

echo "✅ Build completed successfully!"
echo ""
echo "📁 Build artifacts:"
ls -la dist/

echo ""
echo "🚀 Ready for deployment!"
echo "To deploy with Docker: docker build -f Dockerfile.optimized -t ecko-leads-system ."
