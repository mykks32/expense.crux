---
name: run
description: Launch expense.crux locally via Docker Compose (server + MongoDB) for manual verification or smoke testing.
---

# Running expense.crux

All env vars come from a single `env/server.env` (git-ignored) — copy `env/server.env.example` there first and fill in real secrets. `MONGO_URI`'s host depends on how you run it (see the comment in that file): `localhost` for local dev, `mongo` for docker compose (either mode below).

## Docker compose, build from local Dockerfile (default)

```bash
cp env/server.env.example env/server.env   # first time only; use MONGO_URI host "mongo"
cd docker
docker compose up --build
```

- Server: `http://localhost:3000`
- MongoDB: `localhost:27017`
- Manual API testing: `.http` files in `apps/server/http/` (REST Client / IntelliJ HTTP Client format)

Health check: `curl -s http://localhost:3000/v1/expenses` should return a `401` `ApiResponseSerializer` envelope (no auth token) rather than a connection error. All routes are URI-versioned (`main.ts`'s `enableVersioning`) — `/expenses` with no `/v1` prefix now 404s.

## Docker compose, published GHCR image instead of building

`docker/docker-compose.yml`'s `server` service builds from the local Dockerfile by default. Edit that one file to switch: comment out its `build:` block and uncomment the `image: ghcr.io/mykks32/expense-crux-server:latest` line above it, then:

```bash
cp env/server.env.example env/server.env   # first time only; use MONGO_URI host "mongo"
cd docker
docker compose up
```

If the GHCR package is private, run `docker login ghcr.io` with a PAT that has `read:packages` first.

## Local (no Docker for the server)

```bash
cd docker && docker compose up mongo -d   # Mongo only

cd ../..
pnpm install
cp env/server.env.example env/server.env   # first time only; use MONGO_URI host "localhost"

pnpm --filter @expense.crux/server run build
pnpm --filter @expense.crux/server run start
```

`ConfigModule` loads `env/server.env` relative to the server package's cwd (`../../env/server.env`) — see `apps/server/src/app.module.ts`.

## Gotchas

- `pnpm-workspace.yaml` is the source of truth for the workspace, not `package.json`'s `workspaces` field (pnpm ignores that).
- `packages/contracts` must build before `apps/server` — the Docker build does this in the right order already; if building manually, run `pnpm --filter @mykks32/expense-crux-contracts run build` first.
- Env validation runs at startup (`apps/server/src/config/validate-env.ts`) — a missing/malformed required var fails fast with a clear error rather than a silent misconfiguration.
- `env/server.env`'s `MONGO_URI` host must match the run mode (see above) — mixing them up is the most common way this breaks.
