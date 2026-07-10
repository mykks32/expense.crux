import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentVariables } from './environment-variables';

/**
 * `ConfigModule.forRoot({ validate })` hook: validates `process.env` against
 * {@link EnvironmentVariables} at startup, so a missing/malformed required
 * variable fails fast with a clear error instead of surfacing later as a
 * confusing runtime crash.
 *
 * @param config - The raw environment variable map.
 * @returns The validated, type-converted config.
 * @throws {Error} If any variable fails validation, listing every failure.
 */
export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.toString()).join('\n'));
  }

  return validatedConfig;
}
