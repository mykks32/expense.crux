# expense.crux

Expense tracking monorepo: NestJS backend (`apps/backend`), mobile app (`apps/mobile`), and a shared contracts package (`packages/contracts`) published to GitHub Packages.

## Running locally

```bash
cd docker
docker compose up --build
```

Backend on `http://localhost:3000`, MongoDB on `:27017`. See `apps/backend/http/` for ready-made `.http` requests.

## Releasing

Publishing `@mykks32/expense-crux-contracts` (GitHub Packages) and the backend Docker image (GHCR) both happen via `.github/workflows/publish.yml`, triggered by pushing a version tag.

1. Bump the version in `packages/contracts/package.json` — npm won't let you republish the same version.
2. Tag and push:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```
3. First release only: on GitHub, open the package under the repo's Packages tab and make it public/link it to the repo if you want it pullable without auth.

## Running the published backend image

```bash
docker run -d \
  --name expense-crux-backend \
  -p 3000:3000 \
  -e MONGO_URI="mongodb://user:pass@your-mongo-host:27017/expense_crux?authSource=admin" \
  -e JWT_ACCESS_SECRET="replace-with-a-real-secret" \
  -e ACCESS_TOKEN_TTL="15m" \
  -e JWT_REFRESH_SECRET="replace-with-a-different-real-secret" \
  -e REFRESH_TOKEN_TTL="7d" \
  ghcr.io/mykks32/expense-crux-backend:latest
```

Or with an env file:

```bash
docker run -d --name expense-crux-backend -p 3000:3000 --env-file .env ghcr.io/mykks32/expense-crux-backend:latest
```

This only starts the backend — point `MONGO_URI` at a reachable MongoDB (Atlas, your own container, etc). If the GHCR package is private, run `docker login ghcr.io` with a PAT that has `read:packages` first.
