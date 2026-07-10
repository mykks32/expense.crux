import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { User, UserSchema } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConfig } from '../config/jwt.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      /**
       * Builds the default `JwtService` options from the namespaced `jwt`
       * config. These are the access-token settings; refresh tokens are
       * signed/verified separately in {@link AuthService} with their own
       * secret and TTL.
       *
       * @param configuration - Resolved `jwt` config (see {@link jwtConfig}).
       * @returns `JwtModule` options for the access token.
       */
      useFactory: (configuration: ConfigType<typeof jwtConfig>) => ({
        secret: configuration.accessTokenSecret,
        signOptions: { expiresIn: configuration.accessTokenExpiresIn },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
