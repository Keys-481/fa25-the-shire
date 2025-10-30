# Frontend Build Stage
FROM node:22-alpine AS fe-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Build to /app/frontend/dist
RUN npm run build

# Backend Build Stage
FROM node:22-alpine AS be-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Final Runtime Stage
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copy backend dependencies
COPY --from=be-deps /app/backend/node_modules /app/backend/node_modules
COPY backend/ /app/backend/

# Copy frontend build output
COPY --from=fe-build /app/frontend/dist /app/frontend_dist

# Expose backend port
EXPOSE 3000

# Start the backend server
CMD ["node", "backend/server.js"]