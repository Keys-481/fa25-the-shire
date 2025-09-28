#!/usr/bin/env bash
set -euo pipefail

# Config
IMAGE_NAME_DEFAULT="$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')"
IMAGE_NAME="${IMAGE_NAME:-$IMAGE_NAME_DEFAULT}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
FULL_TAG="${IMAGE_NAME}:${IMAGE_TAG}"
APP_IMAGE="${APP_IMAGE:-$FULL_TAG}"
DB_CONTAINER="${DB_CONTAINER:-${IMAGE_NAME}-db}"
DB_NETWORK="${DB_NETWORK:-${IMAGE_NAME}-net}"
DB_IMAGE="${DB_IMAGE:-docker.io/postgres:16}"

# Parse args for no-cache and skip-db
NO_CACHE=false
SKIP_DB=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-cache) NO_CACHE=true; shift ;;
    --skip-db)  SKIP_DB=true; shift ;;
    -h|--help)
      cat <<'EOF'
Usage: $0 [--no-cache] [--skip-db]

This script:
  • Requires an existing .env at repo root (not created automatically)
  • Starts/initializes a Postgres container (unless --skip-db)
  • Creates DB & user from .env (idempotent), applies schema/seeds if present
  • Builds the app image (frontend+backend) as ${APP_IMAGE}

Expected .env keys (must exist):
  DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT
EOF
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# Preflight
if ! command -v podman >/dev/null 2>&1; then
	echo "Error: podman is not installed." >&2
	exit 1
fi

if [[ ! -d frontend || ! -d backend ]]; then
  echo "Error: Expected frontend/ and backend/ directories in project root." >&2
  exit 1
fi

if [[ ! -f backend/server.js ]]; then
  echo "Error: Expected backend/server.js file." >&2
  exit 1
fi

if [[ ! -f Dockerfile ]]; then
  echo "Error: Expected Dockerfile in project root." >&2
  exit 1
fi

# Check .env file
if [[ ! -f .env ]]; then
  cat >&2 <<'EOF'
Error: .env file not found in project root.

Please create a .env file with the following variables:
DB_HOST=localhost
DB_USER=your_database_username
DB_PASS=your_database_password
DB_NAME=your_database_name
DB_PORT=5432

Then re-run this script.
EOF
  exit 1
fi

# Load .env variables
set -a
# shellcheck disable=SC1091
source ./.env
set +a

# Validate required DB vars
: "${DB_HOST:?Missing DB_HOST in .env}"
: "${DB_USER:?Missing DB_USER in .env}"
: "${DB_PASS:?Missing DB_PASS in .env}"
: "${DB_NAME:?Missing DB_NAME in .env}"
: "${DB_PORT:?Missing DB_PORT in .env}"

# Start DB if not skipped
if ! $SKIP_DB; then
  # Create network if not exists
  if ! podman network inspect "${DB_NETWORK}" >/dev/null 2>&1; then
  	echo "Creating Podman network: $DB_NETWORK"
	podman network create "$DB_NETWORK" >/dev/null
  fi

  # Publish DB vars with defaults
  EXPOSE_DB="${EXPOSE_DB:-false}"

  # Port flags
  PORT_FLAGS=()
  if [[ "$EXPOSE_DB" == "true" ]]; then
  	if ss -ltn "sport = :${DB_PORT}" 2>/dev/null | grep -q ":${DB_PORT}"; then
  		echo "Port ${DB_PORT} is busy on host. Starting DB without publishing a host port."
	else
		PORT_FLAGS=(-p "${DB_PORT}":5432)
	fi
  fi

  # Start Postgres container if not running
  if ! podman ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
	# Remove stopped container with same name if exists
	if podman ps -a --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
		podman rm "$DB_CONTAINER" >/dev/null
	fi
	echo "Starting Postgres container: $DB_CONTAINER"
	podman run -d --name "$DB_CONTAINER" \
		--network "$DB_NETWORK" \
		-e POSTGRES_PASSWORD="$DB_PASS" \
		-e POSTGRES_USER="postgres" \
		-e POSTGRES_DB="postgres" \
		"${PORT_FLAGS[@]}" \
		"$DB_IMAGE" >/dev/null
  else
	echo "Postgres container $DB_CONTAINER is already running."
  fi

  echo "Waiting for Postgres to be ready..."
  for i in {1..60}; do
	if podman exec "$DB_CONTAINER" pg_isready -U postgres -h 127.0.0.1 >/dev/null 2>&1; then
		echo "Postgres is ready."
		break
	fi
	sleep 1
	[[ $i -eq 60 ]] && { echo "Error: Postgres did not become ready in time." >&2; exit 1; }
  done

  echo "Ensuring database and user exist..."

  # Escape quotes for SQL commands
  DB_USER_Q=${DB_USER//\"/\"\"}
  DB_NAME_Q=${DB_NAME//\"/\"\"}
  DB_PASS_SQL=${DB_PASS//\'/\'\'}

  # Ensure role exists
  podman exec -i "$DB_CONTAINER" psql -U postgres -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
      EXECUTE 'CREATE USER "$DB_USER_Q" WITH PASSWORD ''$DB_PASS_SQL''';
   END IF;
END
\$\$;
SQL

  # Ensure database exists
  if ! podman exec -i "$DB_CONTAINER" psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
  	podman exec -i "$DB_CONTAINER" psql -U postgres -c "CREATE DATABASE \"$DB_NAME_Q\" OWNER \"$DB_USER_Q\";"
  fi

  # Grant all privileges
  podman exec -i "$DB_CONTAINER" psql -U postgres -c \
    "GRANT ALL PRIVILEGES ON DATABASE \"$DB_NAME_Q\" TO \"$DB_USER_Q\";"

	echo "Applying schema and seed data if present..."
	CANDIDATES_SCHEMA=("database/schema.sql")
	CANDIDATES_SEEDS=("database/seeds.sql")

	apply_sql () {
		local file="$1"
		[[ -f "$file" ]] || return 1
		echo "Applying $file..."
		podman exec -i "$DB_CONTAINER" psql -U postgres -d "$DB_NAME" -v ON_ERROR_STOP=1 < "$file"
		return 0
	}

	any=false
	for f in "${CANDIDATES_SCHEMA[@]}"; do apply_sql "$f" && any=true && break; done || true
	for f in "${CANDIDATES_SEEDS[@]}"; do apply_sql "$f" && any=true && break; done || true
	$any || echo "No schema or seed files found to apply."
fi

# Application image build banner
echo "========================================"
echo "    Building App Image: ${APP_IMAGE}"
echo "========================================"

# Build:
# Avoids bind mounts so that everything happens inside the build,
# and nothing persists on host unless it's in the final image.
BUILD_FLAGS=()
$NO_CACHE && BUILD_FLAGS+=(--no-cache)

# Create podman container image using Dockerfile
podman build "${BUILD_FLAGS[@]}" -t "${APP_IMAGE}" -f Dockerfile .

# Outro banner
echo "========================================"
echo "    Build Complete"
echo "    Image: ${APP_IMAGE}"
echo 
if ! $SKIP_DB; then
  echo "    Run the app on the same network as the DB:"
  echo "    podman run --rm --name ${IMAGE_NAME} --network ${DB_NETWORK} --env-file .env -p 3000:3000 ${APP_IMAGE}"
else
  echo "    Run the app (ensure it can access the DB specified in .env):"
  echo "    podman run --rm --name ${IMAGE_NAME} --env-file .env -p 3000:3000 ${APP_IMAGE}"
fi
echo "========================================"