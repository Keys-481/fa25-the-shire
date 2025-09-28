# Frontend Build
FROM docker.io/library/node:20-alpine AS fe-builder
WORKDIR /app/frontend
RUN apk add --no-cache git python3 make g++ bash

# Install dependencies with caching
COPY frontend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build
COPY frontend/ ./
# Build and verify output directory exists
RUN npm run build && test -d dist

# Backend Build
FROM docker.io/library/node:20-alpine AS be-deps
WORKDIR /app/backend
RUN apk add --no-cache git python3 make g++ bash

COPY backend/package*.json ./
# Install production dependencies only for runtime
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Runtime
FROM docker.io/library/node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copy backend dependencies and source
COPY --from=be-deps /app/backend/node_modules ./backend/node_modules
COPY --from=be-deps /app/backend/package*.json ./backend/
COPY backend/ ./backend/

# Copy built frontend assets to where backend can serve them
COPY --from=fe-builder /app/frontend/dist ./backend/dist

# Configure the port the app listens on
ENV PORT=3000
EXPOSE 3000

# Start the backend server
CMD ["node", "backend/server.js"]