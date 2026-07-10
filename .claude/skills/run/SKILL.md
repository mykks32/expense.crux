---
name: run
description: Launch expense.crux locally via Docker Compose (backend + MongoDB) for manual verification or smoke testing.
---

# Running expense.crux

## Docker (preferred — starts backend + MongoDB together)

```bash
cd docker
docker compose up --build
```

- Backend: `http://localhost:3000`
- MongoDB: `localhost:27017`
- Manual API testing: `.http` files in `apps/backend/http/` (REST Client / IntelliJ HTTP Client format)

Health check: `curl -s http://localhost:3000/expenses` should return a `401` `ApiResponseSerializer` envelope (no auth token) rather than a connection error.

## Local (no Docker for the backend)

```bash
# Mongo only, via Docker
cd docker && docker compose up mongo -d

# From repo root
cd ../.. && pnpm install
cp apps/backend/.env.example apps/backend/.env

pnpm --filter @expense.crux/backend run build
pnpm --filter @expense.crux/backend run start
```

## Gotchas

- `pnpm-workspace.yaml` is the source of truth for the workspace, not `package.json`'s `workspaces` field (pnpm ignores that).
- `packages/contracts` must build before `apps/backend` — the Docker build does this in the right order already; if building manually, run `pnpm --filter @mykks32/expense-crux-contracts run build` first.
- Env validation runs at startup (`apps/backend/src/config/validate-env.ts`) — a missing/malformed required var fails fast with a clear error rather than a silent misconfiguration.
