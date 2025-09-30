#!/usr/bin/env bash
set -Eeuo pipefail

# Config variables
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"
BACKEND_DIR="${ROOT_DIR}/backend"

# Function to load user .env file
load_dotenv() {
    [ -f "$1" ] || return 0

    # Export all variables
    set -a
    # shellcheck disable=SC1090
    . "$1"
    set +a
}

# Load .env.test if exists, else .env
if [ -f "${ROOT_DIR:-}/.env.test" ]; then
    echo "Loading ${ROOT_DIR}/.env.test"
    load_dotenv "${ROOT_DIR}/.env.test"
elif [ -f "${ROOT_DIR:-}/.env" ]; then
    echo "Loading ${ROOT_DIR}/.env"
    load_dotenv "${ROOT_DIR}/.env"
fi

# Config variables
FRONTEND_PORT="${FRONTEND_PORT:-${VITE_PORT:-5173}}"
BACKEND_PORT="${BACKEND_PORT:-${PORT:-3000}}"
WEB_URL="http://127.0.0.1:${FRONTEND_PORT}"

# Normalize DB env vars with PG* equivalents
# Many Postgres libraries and tools (like psql) use these standard PG* env vars
PGHOST="${PGHOST:-${DB_HOST:-127.0.0.1}}"
PGPORT="${PGPORT:-${DB_PORT:-5432}}"
PGUSER="${PGUSER:-${DB_USER:-postgres}}"
PGPASSWORD="${PGPASSWORD:-${DB_PASS:-postgres}}"
PGDATABASE="${PGDATABASE:-${DB_NAME:-shire_test}}"

if [ -z "${DATABASE_URL:-}" ]; then
    DATABASE_URL="postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
fi

export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE DATABASE_URL

#---HELPER FUNCTIONS---#

# Check if command exists
has_cmd() {
    command -v "$1" >/dev/null 2>&1
}

# Run npm script if it exists
run_if_script() {
    local dir="$1"; shift
    local script="$1"; shift || true
    if [ -f "${dir}/package.json" ] && jq -e --arg s "$script" '.scripts[$s]' < "${dir}/package.json" >/dev/null 2>&1; then
        echo "Running npm run $script in $dir"
        (cd "$dir" && npm run "$script" --silent "$@")
    else
        return 1
    fi
}

# Wait for HTTP service to be available
wait_for_http() {
    local url="$1"; local tries="${2:-60}"
    echo -n "Waiting for $url"
    for i in $(seq 1 "$tries"); do
        if curl -fsS "$url" >/dev/null 2>&1; then echo "Found!"; return 0; fi
        echo -n "."
        sleep 1
    done
    echo
    echo "Timed out waiting for $url" >&2
    return 1
}

# Kill process tree by PID
kill_tree() {
    if [ -n "${1:-}" ]; then
        if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            taskkill //PID "$1" //T //F >/dev/null 2>&1 || true
        else
            pkill -P "$1" >/dev/null 2>&1 || true
            kill -9 "$1" >/dev/null 2>&1 || true
        fi
    fi
}

# Cleanup function to stop frontend on exit
cleanup() {
    set +e
    if [ -n "${FRONTEND_PID:-}" ]; then
        echo "Stopping frontend (PID ${FRONTEND_PID})..."
        kill_tree "$FRONTEND_PID"
    fi
}
trap cleanup INT TERM EXIT

# Function to start ephemeral Postgres container
start_ephemeral_pg() {
    EPHEMERAL_PG_CONTAINER="${EPHEMERAL_PG_CONTAINER:-shire_test_pg}"
    EPHEMERAL_PG_PORT="${PGPORT:-55432}"
    EPHEMERAL_PG_DB="${PGDATABASE:-shire_test}"
    EPHEMERAL_PG_PW="${PGPASSWORD:-postgres}"

    if ! podman ps --format '{{.Names}}' | grep -qx "$EPHEMERAL_PG_CONTAINER"; then
        echo "Starting ephemeral Postgres container on: 127.0.0.1:${EPHEMERAL_PG_PORT}"
        podman pull docker.io/library/postgres:16 >/dev/null 2>&1 || true
        podman run -d --rm \
            --name "$EPHEMERAL_PG_CONTAINER" \
            -e POSTGRES_USER="postgres" \
            -e POSTGRES_PASSWORD="$EPHEMERAL_PG_PW" \
            -e POSTGRES_DB="$EPHEMERAL_PG_DB" \
            -p "${EPHEMERAL_PG_PORT}":5432 \
            docker.io/library/postgres:16 >/dev/null
        EPHEMERAL_PG_STARTED=1
    fi

    echo "Waiting for ephemeral Postgres to be ready..."
    for i in $(seq 1 60); do
        if podman exec -e PGPASSWORD="$EPHEMERAL_PG_PW" "$EPHEMERAL_PG_CONTAINER" \
            bash -lc "pg_isready -U ${PGUSER:-postgres} -d ${EPHEMERAL_PG_DB} -h 127.0.0.1 -p 5432 >/dev/null 2>&1 && psql -U ${PGUSER:-postgres} -d ${EPHEMERAL_PG_DB} -h 127.0.0.1 -p 5432 -c 'SELECT 1' >/dev/null 2>&1"
        then
            echo "Ephemeral Postgres is ready."
            return 0
        fi
        echo -n "."
        sleep 1
    done
    echo
    echo "Error: Postgres did not become ready in time." >&2
    return 1
}

# Function to stop ephemeral Postgres container
stop_ephemeral_pg() {
    set +e
    if [ "${EPHEMERAL_PG_STARTED:-0}" = "1" ] && [ -n "${EPHEMERAL_PG_CONTAINER:-}" ]; then
        echo "Stopping ephemeral Postgres container: $EPHEMERAL_PG_CONTAINER"
        podman stop "$EPHEMERAL_PG_CONTAINER" >/dev/null 2>&1 || true
    fi
}
trap stop_ephemeral_pg INT TERM EXIT

#---PRECONDITIONS---#

# Validate Node.js installation
NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ]; then
    NODE_BIN="$(command -v nodejs || true)"
fi
if [ -z "$NODE_BIN" ]; then
    echo "Error: Node.js is not installed. Please install Node.js to proceed." >&2
    echo "'sudo apt-get install nodejs npm' on Ubuntu, 'brew install node' on macOS, or download from https://nodejs.org/" >&2
    exit 1
fi

if ! has_cmd jq; then
    echo "Error: jq is not installed. Please install jq to proceed." >&2
    echo "'brew install jq' on macOS, 'sudo apt-get install jq' on Ubuntu, or use Git for Windows with jq." >&2
    exit 1
fi

if ! has_cmd npm; then
    echo "Error: npm is not installed. Please install Node.js and npm to proceed." >&2
    echo "'sudo apt-get install nodejs npm' on Ubuntu, 'brew install node' on macOS, or download from https://nodejs.org/" >&2
    exit 1
fi

if ! has_cmd npx; then
    echo "Error: npx is not installed. Please install Node.js and npm to proceed." >&2
    echo "'sudo apt-get install nodejs npm' on Ubuntu, 'brew install node' on macOS, or download from https://nodejs.org/" >&2
    exit 1
fi

if ! has_cmd podman; then
    echo "Error: podman is not installed. Please install podman to proceed." >&2
    echo "'sudo apt-get install podman' on Ubuntu, 'brew install podman' on macOS, or download from https://podman.io/getting-started/installation" >&2
    exit 1
fi

#---INSTALL DEPENDENCIES---#

echo "========================================"
echo "    Installing dependencies..."
echo "========================================"
[ -f "${BACKEND_DIR}/package-lock.json" ] && (cd "$BACKEND_DIR" && npm ci) || true
[ -f "${FRONTEND_DIR}/package-lock.json" ] && (cd "$FRONTEND_DIR" && npm ci) || true

#---SETUP DATABASE---#

if ! (echo >"/dev/tcp/${PGHOST}/${PGPORT}") >/dev/null 2>&1; then
    echo "No database found at ${PGHOST}:${PGPORT}, starting ephemeral Podman container..."
    start_ephemeral_pg || echo "Failed to start ephemeral Postgres container." >&2
fi

export NODE_ENV="test"
export DOTENV_CONFIG_PATH="${ROOT_DIR}/.env.test"

if [ -f "${BACKEND_DIR}/db_setup.js" ]; then
    echo "========================================"
    echo "     Setting up database..."
    echo "========================================"
    (cd "$BACKEND_DIR" && "$NODE_BIN" -r dotenv/config db_setup.js)
else
    echo "No database setup script found at ${BACKEND_DIR}/db_setup.js, skipping database setup."
fi

#---BACKEND: JEST TESTS---#

echo "========================================"
echo "    Backend: Running Jest tests..."
echo "========================================"

if run_if_script "$BACKEND_DIR" test -- --coverage; then
    :
elif [ -f "${BACKEND_DIR}/package.json" ]; then
    echo "No 'test' script found in ${BACKEND_DIR}/package.json, invoking npx jest directly."
    (cd "$BACKEND_DIR" && npx jest --runInBand --coverage)
else
    echo "${BACKEND_DIR}/package.json not found, skipping backend tests." >&2
fi

#---FRONTEND: PLAYWRIGHT TESTS---#

echo "========================================"
echo "    Frontend: Running Playwright tests..."
echo "========================================"

if [ -f "${FRONTEND_DIR}/package.json" ]; then
    # Ensure Playwright is installed and browsers are set up
    if ! jq -e '.devDependencies["@playwright/test"]' < "${FRONTEND_DIR}/package.json" >/dev/null; then
        echo "@playwright/test not found in frontend devDependencies."
        echo "Run: cd frontend && npm i -D @playwright/test && npx playwright install --with-deps" >&2
        exit 1
    fi

    (cd "$FRONTEND_DIR" && npx playwright install --with-deps >/dev/null)

    # Start vite preview server
    echo "Building frontend..."
    (cd ${FRONTEND_DIR} && npm run build --silent)

    echo "Starting vite preview server on port ${FRONTEND_PORT}..."
    (cd "$FRONTEND_DIR" && npx vite preview --port "${FRONTEND_PORT}" --host 127.0.0.1 >/dev/null 2>&1) &
    FRONTEND_PID=$!
    sleep 0.5

    wait_for_http "$WEB_URL"

    # Run Playwright tests
    echo "Running Playwright tests against ${WEB_URL}..."
    (cd "$FRONTEND_DIR" && BASE_URL="${WEB_URL}" FRONTEND_PORT="${FRONTEND_PORT}" npx playwright test)
else
    echo "${FRONTEND_DIR}/package.json not found, skipping frontend tests." >&2
fi

echo "All tests finished."