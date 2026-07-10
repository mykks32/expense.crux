import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponseSerializer, AuthTokens } from '../serializers/auth-response.serializer';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { jwtConfig } from '../../config/jwt.config';
import { GlobalHttpException } from '../../common/exceptions/global-http.exception';

const SALT_ROUNDS = 10;

/**
 * Registration, login, and refresh-token lifecycle for users.
 *
 * Access tokens are short-lived and signed with `JWT_ACCESS_SECRET`; refresh
 * tokens are long-lived, signed with a *different* secret
 * (`JWT_REFRESH_SECRET`), and stored bcrypt-hashed on the user document so
 * they can be verified and revoked without ever persisting the raw token.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  /**
   * Creates a new user with a bcrypt-hashed password and issues a session.
   *
   * @param dto - Registration input (email, password, optional name).
   * @returns The new session's access/refresh tokens and public user profile.
   * @throws {GlobalHttpException} `emailAlreadyRegistered` if the email is taken.
   */
  async register(dto: RegisterDto): Promise<AuthResponseSerializer> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new GlobalHttpException('emailAlreadyRegistered', HttpStatus.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    return this.issueAuthResponse(user);
  }

  /**
   * Verifies email/password credentials and issues a session.
   *
   * @param dto - Login input (email, password).
   * @returns The session's access/refresh tokens and public user profile.
   * @throws {GlobalHttpException} `invalidCredentials` if the email is unknown
   * or the password doesn't match.
   */
  async login(dto: LoginDto): Promise<AuthResponseSerializer> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new GlobalHttpException('invalidCredentials', HttpStatus.UNAUTHORIZED);
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new GlobalHttpException('invalidCredentials', HttpStatus.UNAUTHORIZED);
    }

    return this.issueAuthResponse(user);
  }

  /**
   * Redeems a refresh token for a brand-new access/refresh pair, rotating
   * the stored refresh token hash so the redeemed token can't be reused.
   *
   * @param dto - The refresh token to redeem.
   * @returns The new session's access/refresh tokens and public user profile.
   * @throws {GlobalHttpException} `invalidRefreshToken` if the token fails
   * signature/expiry verification, the user no longer has a stored hash, or
   * the token doesn't match the stored hash (already rotated/revoked).
   */
  async refresh(dto: RefreshTokenDto): Promise<AuthResponseSerializer> {
    const payload = this.verifyRefreshToken(dto.refreshToken);

    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new GlobalHttpException('invalidRefreshToken', HttpStatus.UNAUTHORIZED);
    }

    const matches = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new GlobalHttpException('invalidRefreshToken', HttpStatus.UNAUTHORIZED);
    }

    return this.issueAuthResponse(user);
  }

  /**
   * Ends a user's session by clearing their stored refresh token hash, so
   * any outstanding refresh token for them stops working immediately.
   *
   * @param userId - The authenticated user's id.
   */
  async logout(userId: string): Promise<void> {
    await this.userRepository.setRefreshTokenHash(userId, null);
  }

  /**
   * Verifies a refresh token's signature and expiry against the refresh
   * secret (distinct from the access-token secret).
   *
   * @param refreshToken - The raw refresh token string.
   * @returns The decoded JWT payload.
   * @throws {GlobalHttpException} `invalidRefreshToken` if verification fails.
   */
  private verifyRefreshToken(refreshToken: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.jwtConfiguration.refreshTokenSecret,
      });
    } catch {
      throw new GlobalHttpException('invalidRefreshToken', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Generates a fresh token pair for a user and wraps it with their public
   * profile in the auth response shape.
   *
   * @param user - The user to issue a session for.
   * @returns The serialized session response.
   */
  private async issueAuthResponse(user: User): Promise<AuthResponseSerializer> {
    const tokens = await this.generateTokens(user);
    return AuthResponseSerializer.fromEntity(tokens, user);
  }

  /**
   * Signs a new access token (short-lived, default secret) and refresh
   * token (long-lived, separate secret), then persists the refresh token's
   * bcrypt hash so it can be verified and revoked later.
   *
   * @param user - The user to sign tokens for.
   * @returns The raw access and refresh token strings.
   */
  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.jwtConfiguration.refreshTokenSecret,
      expiresIn: this.jwtConfiguration.refreshTokenExpiresIn,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.userRepository.setRefreshTokenHash(user.id, refreshTokenHash);

    return { accessToken, refreshToken };
  }
}
