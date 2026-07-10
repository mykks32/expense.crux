# expense.crux

Expense tracking monorepo: NestJS backend (`apps/backend`), mobile app (`apps/mobile`), and a shared contracts package (`packages/contracts`) published to GitHub Packages.

## Running locally

```bash
cd docker
docker compose up --build
```

Backend on `http://localhost:3000`, MongoDB on `:27017`. See `apps/backend/http/` for ready-made `.http` requests.

## Releasing

Publishing `@mykks32/expense-crux-contracts` (GitHub Packages) and the backend Docker image (GHCR) both happen via `.github/workflows/publish.yml`, which runs two independent jobs (`publish-contracts`, `publish-docker-image`) triggered by pushing a version tag, or manually via `workflow_dispatch`.

1. **Get the code onto GitHub**, if you haven't already: `git push -u origin main`.
2. **One-time permission check**: the workflow declares `permissions: packages: write` per job, which normally overrides the repo default. If publishing fails with a permissions error, check **Settings → Actions → General → Workflow permissions** isn't locked down further.
3. **Bump the contracts version** — npm/GitHub Packages refuses to republish an existing version:
   ```bash
   # edit packages/contracts/package.json — bump "version"
   git add packages/contracts/package.json
   git commit -m "chore(contracts): bump version to X.Y.Z"
   git push
   ```
4. **Tag and push — this is what actually triggers the workflow**:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
   Or trigger it manually: GitHub → **Actions** tab → **Publish** → **Run workflow**.
5. **Watch it run**: GitHub → **Actions** tab → the "Publish" run, two parallel jobs.
6. **First release only**: on GitHub, open each package under the repo's **Packages** tab (right sidebar) and link it to the repo / set it public if you want it pullable without auth — otherwise consumers need a PAT with `read:packages`.

After the first release, steps 1–2 and 6 are one-time only — every future release is just bump version → tag → push tag.

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
