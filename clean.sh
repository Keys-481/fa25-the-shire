#!/usr/bin/env bash
set -euo pipefail

# Detect docker compose
if command -v docker >/dev/null 2>&1; then
    if docker compose version >/dev/null 2>&1; then
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
    echo "Docker is not installed. Please install Docker to proceed."
    exit 1
fi

echo "=========================================="
echo "Stopping and removing services..."
$COMPOSE down -v
echo "Done."
echo "=========================================="