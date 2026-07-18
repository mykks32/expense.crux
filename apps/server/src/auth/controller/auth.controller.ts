import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponseSerializer } from '../serializers/auth-response.serializer';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request-user.interface';
import { RequestId } from '../../common/decorators/request-id.decorator';
import { ApiResponseSerializer } from '../../common/serializers/api-response.serializer';

/**
 * HTTP entry points for registration, login, token refresh, and logout.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user and issues an initial access/refresh token pair.
   *
   * @param dto - Email, password, and optional display name.
   * @param requestId - Correlation id read from the `x-request-id` header.
   * @returns `201 Created` envelope wrapping the new session.
   * @throws {GlobalHttpException} `emailAlreadyRegistered` if the email is taken.
   */
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @RequestId() requestId?: string,
  ): Promise<ApiResponseSerializer<AuthResponseSerializer>> {
    const result = await this.authService.register(dto);
    return ApiResponseSerializer.created(result, { requestId });
  }

  /**
   * Authenticates a user by email/password and issues a fresh token pair.
   *
   * @param dto - Email and password.
   * @param requestId - Correlation id read from the `x-request-id` header.
   * @returns `200 OK` envelope wrapping the session.
   * @throws {GlobalHttpException} `invalidCredentials` on a bad email/password.
   */
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @RequestId() requestId?: string,
  ): Promise<ApiResponseSerializer<AuthResponseSerializer>> {
    const result = await this.authService.login(dto);
    return ApiResponseSerializer.ok(result, { requestId });
  }

  /**
   * Exchanges a valid, unrevoked refresh token for a new access/refresh pair
   * (refresh tokens are rotated on every use).
   *
   * @param dto - The refresh token to redeem.
   * @param requestId - Correlation id read from the `x-request-id` header.
   * @returns `200 OK` envelope wrapping the new session.
   * @throws {GlobalHttpException} `invalidRefreshToken` if the token is expired,
   * forged, or has already been rotated/revoked.
   */
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @RequestId() requestId?: string,
  ): Promise<ApiResponseSerializer<AuthResponseSerializer>> {
    const result = await this.authService.refresh(dto);
    return ApiResponseSerializer.ok(result, { requestId });
  }

  /**
   * Revokes the caller's stored refresh token, ending their session.
   *
   * @param user - The authenticated user, injected from the JWT access token.
   * @returns Resolves with no body (`204 No Content`).
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@CurrentUser() user: RequestUser): Promise<void> {
    return this.authService.logout(user.userId);
  }
}
