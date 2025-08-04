#!/bin/bash

# Ecko Streetwear Lead Management System - Deploy Script
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
IMAGE_NAME="ecko-leads-system"
IMAGE_TAG="latest"
CONTAINER_NAME="ecko-leads-app"

echo "🚀 Deploying Ecko Streetwear Lead Management System"
echo "Environment: $ENVIRONMENT"
echo "======================================="

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .

# Stop and remove existing container if running
echo "🛑 Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Run the new container
echo "🏃 Starting new container..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p 8080:8080 \
  -e NODE_ENV=$ENVIRONMENT \
  -e DB_HOST=148.230.78.129 \
  -e DB_PORT=3459 \
  -e DB_USER=leads \
  -e DB_PASSWORD=e35dc30e2cfa66364f67 \
  -e DB_NAME=leads \
  -v $(pwd)/logs:/app/logs \
  $IMAGE_NAME:$IMAGE_TAG

# Wait for container to be healthy
echo "⏳ Waiting for application to start..."
sleep 10

# Check if container is running
if docker ps | grep -q $CONTAINER_NAME; then
  echo "✅ Container is running!"
  
  # Test the API
  if curl -f http://localhost:8080/api/ping > /dev/null 2>&1; then
    echo "✅ API is responding!"
    echo "🎉 Deployment successful!"
    echo ""
    echo "Application is running at: http://localhost:8080"
    echo "API endpoint: http://localhost:8080/api/ping"
  else
    echo "❌ API is not responding. Check container logs:"
    docker logs $CONTAINER_NAME
    exit 1
  fi
else
  echo "❌ Container failed to start. Check logs:"
  docker logs $CONTAINER_NAME
  exit 1
fi

# Show container status
echo ""
echo "📊 Container Status:"
docker ps | grep $CONTAINER_NAME

echo ""
echo "📝 To view logs: docker logs -f $CONTAINER_NAME"
echo "🛑 To stop: docker stop $CONTAINER_NAME"
echo "🗑️  To remove: docker rm $CONTAINER_NAME"
