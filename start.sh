#!/bin/bash

echo "Starting Headscale Admin Panel..."

# Create necessary directories
mkdir -p postgres/data
mkdir -p headscale/config
mkdir -p headscale/data

# Check if .env exists
if [ ! -f "think-app/.env" ]; then
    echo "Creating .env file from .example.env..."
    cp think-app/.example.env think-app/.env
fi

# Start Docker Compose
echo "Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check status
docker-compose ps

echo ""
echo "========================================="
echo "Headscale Admin Panel is starting!"
echo "========================================="
echo ""
echo "Web Interface: http://localhost:8080"
echo "PostgreSQL:    localhost:5432"
echo ""
echo "To view logs:    docker-compose logs -f"
echo "To stop:         docker-compose down"
echo ""
