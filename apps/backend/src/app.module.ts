import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnv } from './config/validate-env';
import { appConfig } from './config/app.config';
import { mongoConfig } from './config/mongo.config';
import { jwtConfig } from './config/jwt.config';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Local (non-Docker) dev reads env/backend.env from the repo root.
      // In Docker/compose, env vars are injected directly into process.env
      // (via env_file/-e), so a missing file here is expected and harmless.
      envFilePath: '../../env/backend.env',
      validate: validateEnv,
      load: [appConfig, mongoConfig, jwtConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [mongoConfig.KEY],
      /**
       * Builds the Mongoose connection options from the namespaced `mongo` config.
       *
       * @param configuration - Resolved `mongo` config (see {@link mongoConfig}).
       * @returns Mongoose root module options.
       */
      useFactory: (configuration: ConfigType<typeof mongoConfig>) => ({
        uri: configuration.uri,
      }),
    }),
    AuthModule,
    ExpensesModule,
  ],
})
export class AppModule implements NestModule {
  /**
   * Registers app-wide middleware, applied in order to every route:
   * request-id tagging first, then HTTP access logging (which reads the
   * request id set by the first middleware).
   *
   * @param consumer - Nest's middleware consumer for this module.
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
