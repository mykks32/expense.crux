# expense.crux

Expense tracking monorepo: NestJS backend (`apps/backend`), mobile app (`apps/mobile`), and a shared contracts package (`packages/contracts`) published to GitHub Packages.

## Running locally

```bash
cp docker/backend.env.example docker/backend.env   # first time only — edit secrets as needed
cd docker
docker compose up --build
```

`docker-compose.yml` reads the backend's env vars from `docker/backend.env` (git-ignored) via `env_file`, rather than hardcoding them inline. Backend on `http://localhost:3000`, MongoDB on `:27017`. See `apps/backend/http/` for ready-made `.http` requests.

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

Copy the example env file and fill in real values — this is the recommended way, not a list of `-e` flags to keep in sync by hand. **Don't reuse `apps/backend/.env.example`'s `MONGO_URI` here** — it points at `localhost`, which only works for local *non-Docker* dev. Inside a container, `localhost` is the container itself, so Mongo would be unreachable and the app hangs retrying `ECONNREFUSED`.

```bash
cp docker/backend.env.example backend.env
# edit backend.env: MONGO_URI must point at a Mongo reachable from *inside* this
# container — a managed instance (Atlas, etc), or a Mongo container on the same
# Docker network (see below) — never localhost. Also set JWT_ACCESS_SECRET/JWT_REFRESH_SECRET.

docker run -d --name expense-crux-backend -p 3000:3000 --env-file backend.env \
  ghcr.io/mykks32/expense-crux-backend:latest
```

If the GHCR package is private, run `docker login ghcr.io` with a PAT that has `read:packages` first.

### No external Mongo? Run one alongside it on a shared network

```bash
docker network create expense-crux-standalone

docker run -d --name expense-crux-mongo --network expense-crux-standalone \
  -e MONGO_INITDB_ROOT_USERNAME=mongo \
  -e MONGO_INITDB_ROOT_PASSWORD=mongo \
  -e MONGO_INITDB_DATABASE=expense_crux \
  mongo:7

# in backend.env: MONGO_URI=mongodb://mongo:mongo@expense-crux-mongo:27017/expense_crux?authSource=admin

docker run -d --name expense-crux-backend --network expense-crux-standalone -p 3000:3000 \
  --env-file backend.env \
  ghcr.io/mykks32/expense-crux-backend:latest
```

If you'd rather not manage the network by hand, use `docker compose` instead (see "Running locally" above) — it already wires this up for you.
