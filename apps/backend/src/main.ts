import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/** Boots the Nest app: wires global validation, response serialization, error formatting, and API versioning, then starts listening. */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // URI-based versioning (e.g. /v1/auth/login) — every route is v1 unless a
  // controller/handler opts into a different version via @Version(). Lets
  // future breaking changes ship as /v2/... without breaking mobile clients
  // that haven't updated yet.
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());

  const { port } = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap application:', err);
  process.exitCode = 1;
});
