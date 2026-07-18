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

# VITE_API_URL is inlined into the client bundle at build time (Vite's import.meta.env,
# not a runtime process.env read like the backend's config) — bake it in via a build
# arg rather than env/web.env, so a CI-published image doesn't need that file at all.
# Changing it later means rebuilding the image, not just restarting the container.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

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

# Unlike apps/backend, this doesn't reinstall with --prod only: the production
# command is `vite preview` (TanStack Start's build emits a portable {fetch}
# handler, not a self-listening Node server — see apps/web/README.md), and `vite
# preview` needs vite.config.ts's plugins (vite, @vitejs/plugin-react,
# @tailwindcss/vite, the tanstackStart plugin) resolvable at runtime, not just
# build time. So the full node_modules from the build stage is carried forward.
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/apps/web/node_modules ./apps/web/node_modules

# apps/web/node_modules/@mykks32/expense-crux-contracts is a symlink to
# ../../../../packages/contracts (pnpm's workspace:* link) — its target must
# exist in this image too, or the symlink dangles.
COPY --chown=node:node --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --chown=node:node --from=build /app/packages/contracts/package.json ./packages/contracts/package.json

# Copy built output + the config files `vite preview` reads at startup
COPY --chown=node:node --from=build /app/apps/web/dist ./apps/web/dist
COPY --chown=node:node --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --chown=node:node --from=build /app/apps/web/vite.config.ts ./apps/web/vite.config.ts
COPY --chown=node:node --from=build /app/apps/web/tsconfig.json ./apps/web/tsconfig.json

WORKDIR /app/apps/web

# Switch to non-root user for runtime safety
USER node

EXPOSE 3001

# Start the application
CMD ["node_modules/.bin/vite", "preview"]
