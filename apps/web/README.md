# expense.crux web

Web app for expense.crux, built with [TanStack Start](https://tanstack.com/start) (Vite + [TanStack Router](https://tanstack.com/router) + SSR).

## Get started

From the repo root:

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Point the app at the backend

   ```bash
   cp env/web.env.example env/web.env   # then edit VITE_API_URL if the backend isn't on localhost:3000
   ```

   Same shared `env/` directory convention as the backend (see root `README.md`) — `vite.config.ts` loads `env/web.env` directly, there's no `apps/web/.env`.

3. Start the backend (`cd docker && docker compose up --build`, or see root `README.md`), then start the web app

   ```bash
   pnpm --filter @expense.crux/web dev
   ```

   Runs at `http://localhost:3001`.

## How it was set up

- **Scaffold**: hand-assembled rather than via `create-tanstack-app`, to match this repo's existing conventions (standalone `tsconfig.json`, flat-config ESLint like `apps/server`, workspace dependency on `@mykks32/expense-crux-contracts`).
- **`vite.config.ts`**: `@tanstack/react-start/plugin/vite`'s `tanstackStart()` (SSR + file-based router codegen) + `@tailwindcss/vite` (Tailwind v4) + `@vitejs/plugin-react`. Path aliases (`@/*` → `./src/*`) resolve via Vite's native `resolve.tsconfigPaths: true` — no `vite-tsconfig-paths` plugin needed.
- **`src/router.tsx`**: exports `getRouter()` (the name TanStack Start's SSR entry expects) building a `createRouter` off the generated `src/routeTree.gen.ts`. That file is codegen'd by the `tanstackStart()` plugin from `src/routes/**` on every `dev`/`build` — it's git-ignored, never hand-edited.
- **Routing convention**: nested folders (`_authenticated/expenses/new.tsx`), not TanStack Router's alternative flat dot-notation (`_authenticated.expenses.new.tsx`) — chosen to mirror `apps/mobile`'s Expo Router directory structure (`(app)/expenses/new.tsx`).
- **UI kit**: [shadcn/ui](https://ui.shadcn.com) primitives hand-copied into `src/components/ui/` (Tailwind v4 + Radix, `new-york` style, `neutral` base color — see `components.json`), plus [`@tanstack/react-table`](https://tanstack.com/table) for the expenses list (headless; only column defs + `flexRender` live here, pagination is server-driven via the backend's `meta`).

## Architecture

Feature-based, mirroring `apps/mobile`:

```
src/
├── routes/            # thin TanStack Router route files — no business logic
├── features/
│   ├── auth/           api.ts, store.ts, schema.ts, components/ (forms)
│   ├── expenses/        api.ts, schema.ts, filters.ts
│   │                     components/  reusable pieces (form, filter sheet, table)
│   │                     pages/       route-level orchestration (query/mutation/nav)
│   └── theme/           store.ts, components/theme-toggle.tsx
├── components/
│   ├── ui/              shadcn primitives only
│   ├── shared/           generic cross-app pieces (FullPageSpinner)
│   └── layout/           app shell / nav
└── lib/                api.ts, cookies.ts, query-provider.tsx
```

- **Routes vs. pages vs. components**: a route file (`src/routes/...`) only wires a URL to a component — no `useQuery`/`useMutation` inside it. Page-level orchestration (data fetching, mutations, navigation) lives in `features/<name>/pages/`. Reusable, presentational pieces (forms, tables, panels) live in `features/<name>/components/`. Auth is the one exception: `LoginForm`/`RegisterForm` double as both, since there's no separate orchestration beyond the mutation itself.

### Routing (TanStack Router, file-based)

Every file under `src/routes/` is scanned by the `tanstackStart()` Vite plugin and compiled into `src/routeTree.gen.ts` on `dev`/`build` — you never edit that file, or register a route by hand anywhere. The **folder path mirrors the URL path**; a few filename conventions change what a file means instead of just naming a URL segment:

| Convention | Meaning | Example in this app |
| --- | --- | --- |
| `__root.tsx` | Top-level document shell (`<html>`/`<head>`/`<body>`) — every route renders inside it | `src/routes/__root.tsx` |
| `<folder>/route.tsx` | The **layout** for everything else in that folder — renders an `<Outlet />` its children fill in | `_auth/route.tsx`, `_authenticated/route.tsx` |
| `_<name>` folder prefix | **Pathless layout** — groups/wraps child routes without adding a URL segment | `_auth/` wraps `/login`, `/register`; `_authenticated/` wraps `/`, `/expenses/*` |
| `$<name>` | Dynamic URL segment, typed and available via `Route.useParams()` | `_authenticated/expenses/$expenseId.tsx` → `/expenses/:expenseId` |
| `index.tsx` | Matches the folder's own path exactly (no further segment) | `_authenticated/index.tsx` → `/` |
| plain `<name>.tsx` | A literal path segment | `_auth/login.tsx` → `/login` |

How that maps to this app's actual routes:

| File | URL | Guarded by |
| --- | --- | --- |
| `_auth/route.tsx` | *(layout only, no URL)* | redirects to `/` once logged in |
| `_auth/login.tsx` | `/login` | — |
| `_auth/register.tsx` | `/register` | — |
| `_authenticated/route.tsx` | *(layout only, no URL)* | redirects to `/login` once logged out |
| `_authenticated/index.tsx` | `/` (expenses list) | `_authenticated` |
| `_authenticated/expenses/new.tsx` | `/expenses/new` | `_authenticated` |
| `_authenticated/expenses/$expenseId.tsx` | `/expenses/:expenseId` | `_authenticated` |

Each route file exports a `Route` built with `createFileRoute('<route-id>')({ component })` — the id string is the same regardless of whether you lay files out in nested folders or flat dot-notation (`_authenticated.expenses.new.tsx`); this app uses nested folders (see "How it was set up" above) purely for readability, matching `apps/mobile`'s Expo Router directory layout. Navigation is done via `@tanstack/react-router`'s `<Link to="/expenses/$expenseId" params={{ expenseId }}>` or `useNavigate()` — both are type-checked against the generated route tree, so a typo'd path or a missing param is a compile error, not a runtime 404.

### Auth: cookies, not localStorage

- `src/lib/cookies.ts` — plain `document.cookie` get/set/remove, SSR-guarded (`typeof document === 'undefined'` short-circuits server-side).
- `src/lib/api.ts` — the shared axios instance. Reads `AUTH_TOKEN`/`REFRESH_TOKEN` cookies directly (no intermediate storage abstraction). Attaches `Authorization: Bearer <token>` to every request except `/auth/{login,register,refresh}`; on a `401` it calls `/auth/refresh` once (concurrent 401s share a single in-flight refresh) and retries. If refresh itself fails, it clears the cookies and notifies the auth store via `setSessionExpiredHandler` — a setter rather than a direct import, since the store depends on `features/auth/api.ts`, which depends on this client (a cycle otherwise).
- `src/features/auth/store.ts` — Zustand store holding `user`/`loading`/`initialized`. `onAuthSuccess` persists a session (cookies + a `USER` cookie caching the profile). `initialize()` restores a session from the `REFRESH_TOKEN` cookie on first mount — this backend has no `/auth/me`, so `/auth/refresh` is the only way to both validate the session and get fresh user data.
- **Why the auth guard runs at render time, not in `beforeLoad`**: tokens live only in a browser cookie the SSR pass doesn't parse — a `beforeLoad` redirect would see "no session" on every full page load and incorrectly bounce an already-logged-in user to `/login` before the client ever got a chance to check. Instead, `_auth/route.tsx` and `_authenticated/route.tsx` render a loading spinner until the client-side `initialize()` call resolves, then decide to render or `navigate()` away — mirrors `apps/mobile`'s `Stack.Protected` gating pattern, just checked imperatively instead of declaratively.

### Production build & Docker

`vite build` emits `dist/client/` (static assets) and `dist/server/server.js` — the latter is a portable `{ fetch }` handler (built on [`srvx`](https://github.com/h3js/srvx)), not a self-listening Node server, so `node dist/server/server.js` exits immediately with no output. `pnpm start` runs `vite preview` instead, which does bind a port and correctly serves the SSR build (verified: renders real server-rendered HTML, not just static assets).

`docker/web.Dockerfile` (context = repo root, alongside `docker/server.Dockerfile`) mirrors that: the production stage still runs `vite preview`, so unlike the server image it keeps the **full** `node_modules` (not a `--prod`-only reinstall) — `vite.config.ts`'s plugins (`vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, the `tanstackStart` plugin) must be resolvable at container runtime, not just at build time. It also copies `apps/web/src/` alongside `dist/` — the `tanstackStart()` plugin's config resolution (route tree, router entry) reads from source even when `vite preview` is just serving prebuilt output; omitting it crashes on startup with `Could not resolve entry for router entry: router`.

`VITE_API_URL` is inlined into the client bundle at **build** time (Vite's `import.meta.env`), not read at container runtime — the Docker build needs `env/web.env` to already exist in the build context, same file/mechanism as local dev (`vite.config.ts` loads it via `dotenv`). Locally that's just `cp env/web.env.example env/web.env` (already required — see "Get started" above). In CI, `.github/workflows/publish.yml`'s `publish-web-docker-image` job generates it from the `VITE_API_URL` repo variable (Settings → Actions → Variables) right before the build step. `.dockerignore` excludes `env/` from every image's build context except this one file (`!env/web.env`) — `env/server.env`'s real secrets stay excluded. Whatever value you use, it must be a URL the **browser** can reach, not the Docker Compose network — `http://localhost:3000`, never the internal service name `server` (browsers can't resolve Compose service names).

**No server-side equivalent is needed**: the auth guard (`_auth/route.tsx`, `_authenticated/route.tsx`) renders only a loading spinner during SSR — `initialize()` runs inside a `useEffect`, and React never executes effects during server rendering, so `initialized` is always `false` server-side and no route that actually calls the API (the expenses list, forms, etc.) is ever reached before the client hydrates. The web container's own Node process never makes an outbound API call, so there's nothing to route to the internal Docker Compose network — only the browser ever calls the server, always via `VITE_API_URL`.

## Conventions

Same as the rest of the repo (see root `CLAUDE.md`): no `any`, add new HTTP-facing types to `packages/contracts` first, JSDoc only where behavior is non-obvious. ESLint runs with `typescript-eslint`'s type-checked rules (`recommendedTypeChecked`), same as `apps/server` — notably `no-floating-promises`/`no-misused-promises`, so promise-returning handlers (`navigate()`, `logout()`, `handleSubmit(...)`) are always explicitly `void`-marked or awaited.
