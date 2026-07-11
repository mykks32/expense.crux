# syntax=docker/dockerfile:1

# --------------------------------
# BUILD FOR LOCAL DEVELOPMENT
# --------------------------------
FROM node:22 AS development

# Install pnpm globally
RUN npm install -g pnpm@9.15.4

# Set working directory inside container
WORKDIR /app

# Copy only workspace/dependency manifests first (better caching)
COPY --chown=node:node pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY --chown=node:node apps/backend/package.json apps/backend/package.json
COPY --chown=node:node packages/contracts/package.json packages/contracts/package.json

# Pre-fetch all dependencies (dev + prod)
RUN pnpm fetch

# Copy full source code into container
COPY --chown=node:node . .

# Install all dependencies for the backend workspace (including dev dependencies)
RUN pnpm install --frozen-lockfile --offline --filter @expense.crux/backend...

# Switch to non-root user for security
USER node


# --------------------------------
# BUILD FOR PRODUCTION
# --------------------------------
FROM node:22 AS build

# Install pnpm globally
RUN npm install -g pnpm@9.15.4

# Set working directory
WORKDIR /app

# Reuse installed dependencies and source from the development stage (faster build)
COPY --chown=node:node --from=development /app ./

# Build the shared contracts package first, then the backend (TypeScript -> dist)
RUN pnpm --filter @mykks32/expense-crux-contracts run build
RUN pnpm --filter @expense.crux/backend run build

# Install only production dependencies for the backend
RUN pnpm install --prod --frozen-lockfile --offline --filter @expense.crux/backend... --config.confirmModulesPurge=false --ignore-scripts


# --------------------------------
# PRODUCTION RUNTIME IMAGE
# --------------------------------
FROM node:22-alpine AS production

# Set environment to production mode
ENV NODE_ENV=production

WORKDIR /app

# Copy production dependencies from build stage, keeping the workspace layout
# intact so pnpm's node_modules symlinks (root <-> apps/backend) still resolve
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/apps/backend/node_modules ./apps/backend/node_modules

# apps/backend/node_modules/@mykks32/expense-crux-contracts is a symlink to
# ../../../../packages/contracts (pnpm's workspace:* link) — its target must
# exist in this image too, or the symlink dangles and `require()` fails at
# runtime with MODULE_NOT_FOUND.
COPY --chown=node:node --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --chown=node:node --from=build /app/packages/contracts/package.json ./packages/contracts/package.json

# Copy compiled output
COPY --chown=node:node --from=build /app/apps/backend/dist ./apps/backend/dist

# Copy package metadata
COPY --chown=node:node --from=build /app/apps/backend/package.json ./apps/backend/package.json

WORKDIR /app/apps/backend

# Switch to non-root user for runtime safety
USER node

# Start the application
CMD ["node", "dist/main.js"]
