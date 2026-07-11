---
name: run
description: Launch expense.crux locally via Docker Compose (backend + MongoDB) for manual verification or smoke testing.
---

# Running expense.crux

All env vars come from a single `env/backend.env` (git-ignored) — copy `env/backend.env.example` there first and fill in real secrets. `MONGO_URI`'s host depends on how you run it (see the comment in that file): `localhost` for local dev, `mongo` for docker compose (either mode below).

## Docker compose, build from local Dockerfile (default)

```bash
cp env/backend.env.example env/backend.env   # first time only; use MONGO_URI host "mongo"
cd docker
docker compose up --build
```

- Backend: `http://localhost:3000`
- MongoDB: `localhost:27017`
- Manual API testing: `.http` files in `apps/backend/http/` (REST Client / IntelliJ HTTP Client format)

Health check: `curl -s http://localhost:3000/expenses` should return a `401` `ApiResponseSerializer` envelope (no auth token) rather than a connection error.

## Docker compose, published GHCR image instead of building

`docker/docker-compose.yml`'s `backend` service builds from the local Dockerfile by default. Edit that one file to switch: comment out its `build:` block and uncomment the `image: ghcr.io/mykks32/expense-crux-backend:latest` line above it, then:

```bash
cp env/backend.env.example env/backend.env   # first time only; use MONGO_URI host "mongo"
cd docker
docker compose up
```

If the GHCR package is private, run `docker login ghcr.io` with a PAT that has `read:packages` first.

## Local (no Docker for the backend)

```bash
cd docker && docker compose up mongo -d   # Mongo only

cd ../..
pnpm install
cp env/backend.env.example env/backend.env   # first time only; use MONGO_URI host "localhost"

pnpm --filter @expense.crux/backend run build
pnpm --filter @expense.crux/backend run start
```

`ConfigModule` loads `env/backend.env` relative to the backend package's cwd (`../../env/backend.env`) — see `apps/backend/src/app.module.ts`.

## Gotchas

- `pnpm-workspace.yaml` is the source of truth for the workspace, not `package.json`'s `workspaces` field (pnpm ignores that).
- `packages/contracts` must build before `apps/backend` — the Docker build does this in the right order already; if building manually, run `pnpm --filter @mykks32/expense-crux-contracts run build` first.
- Env validation runs at startup (`apps/backend/src/config/validate-env.ts`) — a missing/malformed required var fails fast with a clear error rather than a silent misconfiguration.
- `env/backend.env`'s `MONGO_URI` host must match the run mode (see above) — mixing them up is the most common way this breaks.
