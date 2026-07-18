# expense.crux

Expense tracking monorepo: NestJS server (`apps/server`), web app (`apps/web`), mobile app (`apps/mobile`), and a shared contracts package (`packages/contracts`) published to GitHub Packages.

## Environment files

All three apps' env files live under the shared `env/` directory, each with its own `<app>.env.example` template (git-ignored via `env/*.env` for the real files):

- **`env/server.env`** — used for local (non-Docker) dev and `docker compose` alike; `MONGO_URI`'s host is the only thing you edit per run mode (see the comment in the file):
  - local (non-Docker) dev → `localhost`
  - docker compose → `mongo` (the compose service name)

  Mixing these up is the most common way this breaks (server hangs retrying `ECONNREFUSED`).
- **`env/web.env`** — read directly by `apps/web/vite.config.ts` (there's no `apps/web/.env`); see `apps/web/README.md`.
- **`env/mobile.env.example`** — canonical template, but the working copy has to be copied to `apps/mobile/.env`: Expo's env loading always reads from the project root, with no supported way to point it at `env/` directly.

## Running locally

```bash
cp env/server.env.example env/server.env   # first time only — use MONGO_URI host "mongo"
cp env/web.env.example env/web.env         # first time only
cd docker
docker compose up --build
```

Server on `http://localhost:3000`, web app on `http://localhost:3001`, MongoDB on `:27017`. See `apps/server/http/` for ready-made `.http` requests.

## Running the published images

`docker/docker-compose.yml`'s `server` and `web` services both build from the local Dockerfile by default. To run the published GHCR images instead, edit that file for each service: comment out `build:` and uncomment the `image:` line above it, then:

```bash
cp env/server.env.example env/server.env   # first time only — use MONGO_URI host "mongo"
cd docker
docker compose up
```

If the GHCR packages are private, run `docker login ghcr.io` with a PAT that has `read:packages` first.

## Releasing

Publishing `@mykks32/expense-crux-contracts` (GitHub Packages), the server Docker image, and the web Docker image (both GHCR) all happen via `.github/workflows/publish.yml`, which runs three independent jobs (`publish-contracts`, `publish-server-docker-image`, `publish-web-docker-image`) triggered by pushing a version tag, or manually via `workflow_dispatch`.

1. **Get the code onto GitHub**, if you haven't already: `git push -u origin main`.
2. **One-time permission check**: the workflow declares `permissions: packages: write` per job, which normally overrides the repo default. If publishing fails with a permissions error, check **Settings → Actions → General → Workflow permissions** isn't locked down further.
3. **(Optional) Set the `VITE_API_URL` repo variable** (Settings → Actions → Variables) — `publish-web-docker-image` generates `env/web.env` from it right before building (same mechanism `apps/web/vite.config.ts` uses for local dev), and it gets baked into the web image's client bundle at build time (Vite's `import.meta.env`, not a runtime env read), so it must be whatever URL **browsers** should reach the server at — never the Docker Compose service name. Defaults to `http://localhost:3000` if unset, which only works when the browser and the published image are on the same machine.
4. **Bump the contracts version** (only if `packages/contracts/src` changed) — npm/GitHub Packages refuses to republish an existing version — then commit and push. Docker-only fixes don't need this; the images still need a new tag to rebuild, but `publish-contracts` will just no-op-fail on an unchanged version while the two Docker jobs succeed independently.
5. **Tag and push — this is what actually triggers the workflow**: `git tag vX.Y.Z && git push origin vX.Y.Z`. Or trigger it manually: GitHub → **Actions** tab → **Publish** → **Run workflow**.
6. **Watch it run**: GitHub → **Actions** tab → the "Publish" run, three parallel jobs.
7. **First release only**: on GitHub, open each package under the repo's **Packages** tab (right sidebar) and link it to the repo / set it public if you want it pullable without auth — otherwise consumers need a PAT with `read:packages`.

After the first release, steps 1–3 and 7 are one-time only — every future release is just bump version → tag → push tag.

## Changelog

### web Docker image fixes (unreleased)

- **Fixed startup crash**: `docker/web.Dockerfile`'s production stage was missing `apps/web/src/` — the `tanstackStart()` Vite plugin resolves the router entry/route tree from source even when `vite preview` is just serving prebuilt `dist/` output, so the container crash-looped with `Could not resolve entry for router entry: router`.
- **Fixed external access**: `apps/web/vite.config.ts`'s `server`/`preview` now set `host: true` — without it, `vite dev`/`vite preview` only bind the container's loopback interface, so Docker's port mapping (`-p 3001:3001`) couldn't reach the process from outside the container at all (requests from inside the container worked; every request via the host-mapped port was refused).
- **Simplified `VITE_API_URL` injection**: dropped the `--build-arg`/`ARG`/`ENV` plumbing in favor of generating `env/web.env` directly (in CI, from the `VITE_API_URL` repo variable; locally, the same file a developer already creates for `vite dev`) — one mechanism for both instead of two. `.dockerignore` now has a single, explicit exception (`!env/web.env`) so that file reaches the build context while everything else under `env/` (including `env/server.env`'s real secrets) stays excluded.
- **Removed unneeded `INTERNAL_API_URL` complexity**: briefly added a second, runtime-only API base URL for calls made from inside the web container's own Node process during SSR, before confirming the auth guard renders only a loading spinner server-side (`initialize()` runs in a `useEffect`, which React never executes during SSR) — so no route that calls the API is ever reached before the client hydrates, and the web container never actually makes an outbound API call. Reverted; `VITE_API_URL` alone is correct.

### apps/backend renamed to apps/server (unreleased)

- **Renamed**: `apps/backend` → `apps/server` (package `@expense.crux/backend` → `@expense.crux/server`), `env/backend.env(.example)` → `env/server.env(.example)`, `docker/backend.Dockerfile` → `docker/server.Dockerfile`, docker-compose service `backend` → `server`, GHCR image `expense-crux-backend` → `expense-crux-server`.
- **Migration note**: the old `ghcr.io/mykks32/expense-crux-backend` GitHub Package is now orphaned (no longer published to) — delete/archive it manually under the repo's **Packages** tab if you don't want it lingering. Anything still pointing at that image name needs to switch to `expense-crux-server`.

### web app (unreleased)

- **`apps/web`**: new TanStack Start (Vite + SSR) app, feature-based architecture mirroring `apps/mobile`. See `apps/web/README.md` for setup, routing conventions, and the cookie-based auth guard.
- **Dockerfiles moved**: both apps' Dockerfiles now live under `docker/` (`docker/server.Dockerfile`, `docker/web.Dockerfile`) instead of inside each app — still build with context `.` (repo root), just relocated for consistency.
- **`.github/workflows/publish.yml`**: added `publish-web-docker-image`, publishing `ghcr.io/<owner>/expense-crux-web`.

### contracts 0.1.3 / server (unreleased)

- **API versioning**: every server route now lives under `/v1/...` (`app.enableVersioning` in `main.ts`). A future breaking change ships as `/v2/...` without breaking existing mobile installs.
- **`GET /expenses` filtering/search/sort**: new `category`, `currency`, `search` (partial title match), `minAmount`/`maxAmount`, `dateFrom`/`dateTo`, and `sortBy` (comma-separated `"field:order"`, e.g. `"date:desc,amount:asc"`) query params.
- **Pagination meta**: `PaginationMeta` gained `hasNextPage`/`hasPreviousPage`.
- **contracts additions**: `ListExpensesQuery`, `EXPENSE_SORT_FIELDS`, `SORT_ORDERS` — shared source of truth for sortable fields/orders, so the server's validation and the mobile filter UI can't drift apart.
- **contracts package**: added the `README.md` that GitHub Packages needs to render the package page (0.1.2 published without one).
