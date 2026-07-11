# expense.crux

Expense tracking monorepo: NestJS backend (`apps/backend`), mobile app (`apps/mobile`), and a shared contracts package (`packages/contracts`) published to GitHub Packages.

## Environment file

One shared template: copy `env/backend.env.example` to `env/backend.env` (git-ignored via `env/*.env`) and fill in real secrets. It's used for local dev and docker compose alike — the only thing you edit per run mode is `MONGO_URI`'s host (see the comment in the file):

- local (non-Docker) dev → `localhost`
- docker compose → `mongo` (the compose service name)

Mixing these up is the most common way this breaks (backend hangs retrying `ECONNREFUSED`).

## Running locally

```bash
cp env/backend.env.example env/backend.env   # first time only — use MONGO_URI host "mongo"
cd docker
docker compose up --build
```

Backend on `http://localhost:3000`, MongoDB on `:27017`. See `apps/backend/http/` for ready-made `.http` requests.

## Running the published backend image

`docker/docker-compose.yml`'s `backend` service builds from the local Dockerfile by default. To run the published GHCR image instead, edit that file: comment out `build:` and uncomment the `image:` line above it, then:

```bash
cp env/backend.env.example env/backend.env   # first time only — use MONGO_URI host "mongo"
cd docker
docker compose up
```

If the GHCR package is private, run `docker login ghcr.io` with a PAT that has `read:packages` first.

## Releasing

Publishing `@mykks32/expense-crux-contracts` (GitHub Packages) and the backend Docker image (GHCR) both happen via `.github/workflows/publish.yml`, which runs two independent jobs (`publish-contracts`, `publish-docker-image`) triggered by pushing a version tag, or manually via `workflow_dispatch`.

1. **Get the code onto GitHub**, if you haven't already: `git push -u origin main`.
2. **One-time permission check**: the workflow declares `permissions: packages: write` per job, which normally overrides the repo default. If publishing fails with a permissions error, check **Settings → Actions → General → Workflow permissions** isn't locked down further.
3. **Bump the contracts version** (only if `packages/contracts/src` changed) — npm/GitHub Packages refuses to republish an existing version — then commit and push. Docker-only fixes don't need this; the image still needs a new tag to rebuild, but the `publish-contracts` job will just no-op-fail on an unchanged version while `publish-docker-image` succeeds independently.
4. **Tag and push — this is what actually triggers the workflow**: `git tag vX.Y.Z && git push origin vX.Y.Z`. Or trigger it manually: GitHub → **Actions** tab → **Publish** → **Run workflow**.
5. **Watch it run**: GitHub → **Actions** tab → the "Publish" run, two parallel jobs.
6. **First release only**: on GitHub, open each package under the repo's **Packages** tab (right sidebar) and link it to the repo / set it public if you want it pullable without auth — otherwise consumers need a PAT with `read:packages`.

After the first release, steps 1–2 and 6 are one-time only — every future release is just bump version → tag → push tag.

## Changelog

### contracts 0.1.2 / backend (unreleased)

- **API versioning**: every backend route now lives under `/v1/...` (`app.enableVersioning` in `main.ts`). A future breaking change ships as `/v2/...` without breaking existing mobile installs.
- **`GET /expenses` filtering/search/sort**: new `category`, `currency`, `search` (partial title match), `minAmount`/`maxAmount`, `dateFrom`/`dateTo`, and `sortBy` (comma-separated `"field:order"`, e.g. `"date:desc,amount:asc"`) query params.
- **Pagination meta**: `PaginationMeta` gained `hasNextPage`/`hasPreviousPage`.
- **contracts additions**: `ListExpensesQuery`, `EXPENSE_SORT_FIELDS`, `SORT_ORDERS` — shared source of truth for sortable fields/orders, so the backend's validation and the mobile filter UI can't drift apart.
