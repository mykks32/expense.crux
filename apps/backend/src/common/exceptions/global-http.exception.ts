import { HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { HttpErrorCodeMessage, HttpErrorCodeTypes } from '../utils/http-error-code';

/**
 * The one exception type application code should throw for expected error
 * conditions (not-found, forbidden, conflicts, etc). Carries a typed,
 * machine-readable `errorCode` (looked up in {@link HttpErrorCodeMessage}
 * for its message) and its own `requestId`, so {@link HttpExceptionFilter}
 * can format it into the standard error envelope without guessing.
 */
export class GlobalHttpException extends HttpException {
  readonly requestId: string;
  readonly statusCode: HttpStatus;
  readonly errorCode: HttpErrorCodeTypes;
  readonly additional?: Record<string, unknown>;

  /**
   * @param errorCode - Machine-readable error code; its message is looked
   * up from {@link HttpErrorCodeMessage}.
   * @param statusCode - HTTP status to respond with.
   * @param additional - Optional extra context for logging/debugging.
   */
  constructor(errorCode: HttpErrorCodeTypes, statusCode: HttpStatus, additional?: Record<string, unknown>) {
    const message = HttpErrorCodeMessage[errorCode];
    super(message, statusCode);

    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.additional = additional;
    this.requestId = randomUUID();
  }
}
