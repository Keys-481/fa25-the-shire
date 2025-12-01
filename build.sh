#!/usr/bin/env bash
set -euo pipefail

# Detect docker compose
if command -v docker >/dev/null 2>&1; then
    if docker compose version > /dev/null 2>&1; then
        COMPOSE="docker compose"
    elif command -v docker-compose >/dev/null 2>&1; then
        COMPOSE="docker-compose"
    else
        echo "Docker Compose is not installed. Please install Docker Compose to proceed." >&2
        exit 1
    fi
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE="docker-compose"
else
    echo "Docker is not installed. Please install Docker to proceed." >&2
    exit 1
fi

echo "Building images and starting services using: $COMPOSE"

# Build and start the services in detached mode
$COMPOSE up --build -d

echo "========================================="
echo "All services are up and running!"
echo "    Current status:"
$COMPOSE ps
echo
echo "View logs: $COMPOSE logs -f"
echo "Stop services: ./clean.sh"
echo "========================================="