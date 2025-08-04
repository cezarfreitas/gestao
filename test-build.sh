#!/bin/bash

# Test Docker build script
echo "🧪 Testing Docker build..."

# Try optimized Dockerfile first
if [ -f "Dockerfile.optimized" ]; then
  echo "Testing optimized Dockerfile..."
  docker build -f Dockerfile.optimized -t ecko-leads-test:latest . --no-cache
  if [ $? -eq 0 ]; then
    echo "✅ Optimized Dockerfile build successful!"
    echo "🏃 Testing container startup..."
    docker run --rm -d --name ecko-test -p 8081:8080 ecko-leads-test:latest
    sleep 10
    
    # Test health check
    if curl -f http://localhost:8081/api/ping > /dev/null 2>&1; then
      echo "✅ Container is healthy!"
      docker stop ecko-test
      echo "🎉 Build and test successful!"
      exit 0
    else
      echo "❌ Container health check failed"
      docker stop ecko-test
      docker logs ecko-test
      exit 1
    fi
  else
    echo "❌ Optimized Dockerfile build failed"
  fi
fi

# Fallback to standard Dockerfile
echo "Testing standard Dockerfile..."
docker build -t ecko-leads-test:latest . --no-cache
if [ $? -eq 0 ]; then
  echo "✅ Standard Dockerfile build successful!"
else
  echo "❌ Both Dockerfiles failed to build"
  exit 1
fi
