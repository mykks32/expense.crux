import { registerAs } from '@nestjs/config';

/**
 * Namespaced `mongo` config, injectable via `@Inject(mongoConfig.KEY)` or
 * `ConfigType<typeof mongoConfig>`.
 *
 * @returns The MongoDB connection string (`MONGO_URI`).
 */
export const mongoConfig = registerAs('mongo', () => ({
  uri: process.env.MONGO_URI,
}));
