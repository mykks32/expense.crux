import { registerAs } from '@nestjs/config';

/**
 * Namespaced `app` config, injectable via `@Inject(appConfig.KEY)` or
 * `ConfigType<typeof appConfig>`.
 *
 * @returns The HTTP port to listen on (`PORT`, default `3000`).
 */
export const appConfig = registerAs('app', () => ({
  port: Number(process.env.PORT) || 3000,
}));
