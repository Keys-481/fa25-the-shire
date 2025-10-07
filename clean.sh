#!/usr/bin/env bash
set -euo pipefail

# Verify podman installation
if ! command -v podman >/dev/null 2>&1; then
    echo "Error: podman is not installed." >&2
    exit 1;
fi

# Config
IMAGE_NAME_DEFAULT="$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')"
IMAGE_NAME="${IMAGE_NAME:-$IMAGE_NAME_DEFAULT}"
IMAGE_TAG="${IMAGE_TAG:-local}"
APP_IMAGE="${APP_IMAGE:-${IMAGE_NAME}:${IMAGE_TAG}}"
DB_CONTAINER="${DB_CONTAINER:-${IMAGE_NAME}-db}"
DB_NETWORK="${DB_NETWORK:-${IMAGE_NAME}-net}"
TAGS=("local" "latest")
REPOS=("localhost/${IMAGE_NAME}" "${IMAGE_NAME}")

# Handle command-line tags
ALL=0
DRY=0

# Usage message
usage() {
    cat <<EOF
Usage: ./clean.sh [--all] [--all-tags] [--dry-run]

Targets (derived like build.sh):
  container:  ${DB_CONTAINER}
  network:    ${DB_NETWORK}
  image:      ${APP_IMAGE}

Flags:
  --all         Also 'podman image prune -f' (dangling layers)
  --dry-run     Show actions without executing
  -h, --help    Show this help message
EOF
}

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --all) ALL=1; shift ;;
        --dry-run) DRY=1; shift ;;
        -h|--help) usage; exit 0 ;;
        *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
    esac
done

#---Helper functions---

# Runs the script or simply prints commands without execution in dry-run
run() {
    if (( DRY )); then
        printf '[dry-run] %s\n' "$*"
    else
        "$@"
    fi
}

# Checks if a container exists
container_exists() {
    podman ps -a --format '{{.Names}}' | grep -qx "$1";
}

# Checks if an image exists
image_exists() {
    podman images --format '{{.Repository}}:{{.Tag}}' | grep -qx "$1";
}

# Checks if a network exists
network_exists() {
    podman network ls --format '{{.Name}}' | grep -qx "$1";
}

#---Removal Area---

# Remove containers
if container_exists "$DB_CONTAINER"; then
    echo "Removing container: $DB_CONTAINER"
    run podman rm -f "$DB_CONTAINER" >/dev/null
else
    echo "Container not found: $DB_CONTAINER"
fi

# Remove network (if exists)
if network_exists "$DB_NETWORK"; then
    echo "Attempting to remove network: $DB_NETWORK"
    if ! run podman network rm "$DB_NETWORK" >/dev/null 2>&1; then
        echo "Network $DB_NETWORK in use, unable to remove."
    else
        echo "Network $DB_NETWORK successfully removed."
    fi
fi

# Remove images
for tag in "${TAGS[@]}"; do
    removed=0
    for repo in "${REPOS[@]}"; do
        ref="${repo}:${tag}"
        if image_exists "$ref"; then
            echo "Removing image: $ref"
            run podman rmi -f "$ref" >/dev/null || true
            removed=1
            break
        fi
    done
    if [[ $removed -eq 0 ]]; then
        echo "Image not found: $ref"
    fi
done

# Remove dangling layers (command-line)
if (( ALL )); then
    echo "Pruning dangling layers/images..."
    run podman image prune -f >/dev/null || true
fi

echo "========================================"
echo "    Cleaning process complete."
echo "========================================"