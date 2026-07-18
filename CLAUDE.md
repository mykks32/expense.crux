# expense.crux

Expense tracking monorepo: a NestJS + MongoDB server, a TanStack Start web app, a mobile app, and a shared TypeScript contracts package published to GitHub Packages so all three apps consume the same wire types.

## Layout

```
apps/server/       NestJS API (source of truth for behavior)
apps/web/           TanStack Start (Vite + SSR) web app, feature-based — see apps/web/README.md
apps/mobile/        Expo (React Native) mobile app, feature-based
packages/contracts/  @mykks32/expense-crux-contracts — shared interfaces (User, Expense, ApiResponse<T>, auth payloads)
docker/            docker-compose.yml (server + web + mongo), server.Dockerfile, web.Dockerfile
.github/workflows/ publish.yml — publishes contracts to GH Packages + server/web images to GHCR on version tags
```

pnpm workspaces via `pnpm-workspace.yaml` (the source of truth pnpm reads — **not** a `workspaces` field in root `package.json`, which pnpm ignores).

## Server architecture (apps/server/src)

Each feature module (`auth/`, `expenses/`) is split into:

- `entities/` — Mongoose schemas (`@Schema`/`@Prop` classes)
- `repositories/` — the only layer that touches the Mongoose `Model` directly
- `service/` — business logic; depends on repositories, never on `Model` directly
- `controller/` — HTTP layer; thin, delegates to services
- `dto/` — **request** validation, `class-validator` decorated (`@IsString`, `@IsEmail`, etc). DTOs `implement` the matching interface from `@mykks32/expense-crux-contracts` for compile-time contract checking.
- `serializers/` — **response** shaping, `class-transformer` decorated (`@Expose`/`@Type`), built via a static `fromEntity()` factory. Never reuse a `dto/` class for output — DTO = input validation, serializer = output shaping. This distinction is intentional; don't collapse it.
- `interfaces/` — types used only within that one module (e.g. `JwtPayload` in `auth/`)

`common/` holds cross-module concerns only (used by 2+ modules):
- `serializers/` — `ApiResponseSerializer<T>` (the response envelope, see below), pagination meta/links serializers
- `dto/pagination-query.dto.ts` — `?page=&limit=` query params
- `exceptions/global-http.exception.ts` + `utils/http-error-code.ts` — see Error handling below
- `filters/http-exception.filter.ts` — global exception → envelope formatter
- `middleware/` — `RequestIdMiddleware` (tags every request with `x-request-id`) then `LoggerMiddleware` (logs using that id) — registered in that order in `app.module.ts`
- `decorators/` — `@CurrentUser()` (auth-specific, lives under `auth/decorators/` not `common/`), `@RequestId()`
- `interfaces/request-user.interface.ts` — `RequestUser` shape, shared by auth and expenses
- `types/express.d.ts` — augments `Express.User` (not `Express.Request.user` directly — that would conflict with `@types/passport`'s own augmentation of the same property; extending `Express.User` is the canonical fix)

`config/` — namespaced config via `@nestjs/config`'s `registerAs()` (`app.config.ts`, `mongo.config.ts`, `jwt.config.ts`), injected via `ConfigType<typeof xConfig>` and `@Inject(xConfig.KEY)` — never inject the raw `ConfigService` and call `.get('SOME_VAR')` in application code. Env vars are validated at startup by `config/validate-env.ts` (`class-validator`-based, mirrors the DTO/serializer style used everywhere else) — a missing/malformed required var fails fast at boot with a clear error.

## API response envelope

**Every** controller response is wrapped in `ApiResponseSerializer<T>` (`common/serializers/api-response.serializer.ts`), matching the shared `ApiResponse<T>` contract:

```json
{ "success": true, "message": "...", "statusCode": 200, "data": {...}, "meta": {...}, "links": {...}, "timestamp": "...", "requestId": "..." }
```

Build responses via the static factories — never the constructor: `ApiResponseSerializer.ok()`, `.created()`, `.error()`, `.paginated()`. List endpoints use `buildPagination()` (`common/utils/pagination.util.ts`) to produce `meta`/`links` from a `PaginationQueryDto`.

204 No Content responses (logout, delete) are the one exception — no envelope, no body.

## API versioning

Every route is URI-versioned — `app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })` in `main.ts` — so all endpoints live under `/v1/...` (e.g. `/v1/auth/login`, `/v1/expenses`) with no per-controller changes needed. Both clients append `/v1` once at the `baseURL` level — mobile's `apiClient` (`apps/mobile/src/lib/api.ts`) off `EXPO_PUBLIC_API_URL`, web's `apiClient` (`apps/web/src/lib/api.ts`) off `VITE_API_URL`. A future breaking change ships as `/v2/...` (via `@Version('2')` on the affected controller/handler) without breaking installs still on `/v1`.

## Error handling

Throw `GlobalHttpException(errorCode, httpStatus, additional?)` (`common/exceptions/global-http.exception.ts`) for all expected error conditions — **not** Nest's built-in `NotFoundException`/`UnauthorizedException`/etc. Error codes are a closed set in `common/utils/http-error-code.ts` (`HttpErrorCodeMessage`); add new codes there rather than inlining ad-hoc messages. The global `HttpExceptionFilter` catches every `HttpException`, formats `GlobalHttpException` using its own `errorCode`/`requestId`, and falls back to a generic mapping for anything else (e.g. `ValidationPipe` failures).

## Auth

Access and refresh tokens are deliberately asymmetric and use **separate secrets**:

- `JWT_ACCESS_SECRET` / `ACCESS_TOKEN_TTL` (default `15m`) — short-lived, signed via the default `JwtService.sign()`
- `JWT_REFRESH_SECRET` / `REFRESH_TOKEN_TTL` (default `7d`) — long-lived, signed with explicit `{ secret, expiresIn }` overrides in `AuthService`

Refresh tokens are never stored raw — only a bcrypt hash (`User.refreshTokenHash`) — and are rotated on every `/auth/refresh` call. `/auth/logout` clears the hash to revoke. If you ever touch this, keep the two-secret separation; it was a repeated, explicit requirement.

**Gotcha:** a Mongoose `@Prop()` on a TS union type (e.g. `string | null`) crashes at boot with `CannotDetermineTypeError` — `reflect-metadata` can't infer a schema type from a union. Always pass an explicit `@Prop({ type: String, ... })` for nullable/union-typed fields.

## Shared contracts package

`packages/contracts` (`@mykks32/expense-crux-contracts`) holds pure interfaces only — no runtime code, no classes with behavior. Server DTOs/serializers `implement` these interfaces. It's a real pnpm workspace dependency (`workspace:*`) in `apps/server`, `apps/web`, and `apps/mobile`, meant to be published to GitHub Packages so all three stay in sync without copy-pasting types.

**Gotcha:** the Docker build must build `packages/contracts` (via `pnpm --filter @mykks32/expense-crux-contracts run build`) *before* building the server or web app — `tsc`/Vite need its `dist/*.d.ts` to resolve the import. Also: `.dockerignore` must **not** exclude `packages/` — it did at one point (leftover from before contracts existed) and broke the build.

## Running it

```bash
cd docker && docker compose up --build   # server :3000, web :3001, mongo :27017
```

See root `README.md` for the local (non-Docker) dev flow and the release process (`.github/workflows/publish.yml`, triggered by pushing a `v*.*.*` tag).

## Conventions to keep

- No `any`, anywhere. If TS/reflect-metadata forces an implicit `any` (e.g. Express augmentation edge cases), fix the typing rather than casting to `any`.
- Every function/method gets a JSDoc block, but keep it terse — a one-line summary is enough for simple/obvious functions; reserve multi-line `@param`/`@returns`/`@throws` detail for genuinely non-obvious behavior. Still an explicit, repeated ask; just don't let it bloat simple code.
- Docker/env var naming: `JWT_ACCESS_SECRET`, `ACCESS_TOKEN_TTL`, `JWT_REFRESH_SECRET`, `REFRESH_TOKEN_TTL` — fully symmetric naming was requested explicitly; don't drift back to asymmetric names like `JWT_SECRET`/`JWT_EXPIRES_IN`.
- When adding a new HTTP-facing type, add the shared interface to `packages/contracts` first, then `implement` it from the server DTO/serializer.
- Git commits: never add a `Co-Authored-By` trailer (Claude or otherwise). This overrides the default git-commit instructions.
