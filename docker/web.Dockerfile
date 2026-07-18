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
COPY --chown=node:node apps/web/package.json apps/web/package.json
COPY --chown=node:node packages/contracts/package.json packages/contracts/package.json

# Pre-fetch all dependencies (dev + prod)
RUN pnpm fetch

# Copy full source code into container
COPY --chown=node:node . .

# Install all dependencies for the web workspace (including dev dependencies)
RUN pnpm install --frozen-lockfile --offline --filter @expense.crux/web...

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

# Build the shared contracts package first, then the web app (Vite SSR build)
RUN pnpm --filter @mykks32/expense-crux-contracts run build
RUN pnpm --filter @expense.crux/web run build


# --------------------------------
# PRODUCTION RUNTIME IMAGE
# --------------------------------
FROM node:22-alpine AS production

# Set environment to production mode
ENV NODE_ENV=production

WORKDIR /app

# Unlike apps/backend, this carries the full node_modules forward (not a
# --prod reinstall): the production command is `vite preview`, which needs
# vite.config.ts's plugins resolvable at runtime, not just build time.
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/apps/web/node_modules ./apps/web/node_modules

# The contracts workspace:* symlink under node_modules needs its target too
COPY --chown=node:node --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --chown=node:node --from=build /app/packages/contracts/package.json ./packages/contracts/package.json

# Copy built output + the config/source files `vite preview` reads at startup
# (the tanstackStart plugin resolves the router entry/route tree from src/,
# even when only serving prebuilt dist/ output)
COPY --chown=node:node --from=build /app/apps/web/dist ./apps/web/dist
COPY --chown=node:node --from=build /app/apps/web/src ./apps/web/src
COPY --chown=node:node --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --chown=node:node --from=build /app/apps/web/vite.config.ts ./apps/web/vite.config.ts
COPY --chown=node:node --from=build /app/apps/web/tsconfig.json ./apps/web/tsconfig.json

WORKDIR /app/apps/web

# Switch to non-root user for runtime safety
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/', r => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application
CMD ["node_modules/.bin/vite", "preview"]
