import { registerAs } from '@nestjs/config';

/**
 * Namespaced `jwt` config, injectable via `@Inject(jwtConfig.KEY)` or
 * `ConfigType<typeof jwtConfig>`. Access and refresh tokens intentionally
 * use separate secrets and TTLs — see {@link AuthService}.
 *
 * @returns Access-token secret/TTL (`JWT_ACCESS_SECRET`, `ACCESS_TOKEN_TTL`,
 * default `15m`) and refresh-token secret/TTL (`JWT_REFRESH_SECRET`,
 * `REFRESH_TOKEN_TTL`, default `7d`).
 */
export const jwtConfig = registerAs('jwt', () => ({
  accessTokenSecret: process.env.JWT_ACCESS_SECRET,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_TTL || '7d',
}));
