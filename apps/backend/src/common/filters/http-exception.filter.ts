import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseSerializer } from '../serializers/api-response.serializer';
import { GlobalHttpException } from '../exceptions/global-http.exception';

/**
 * Global filter that reshapes every thrown `HttpException` into the
 * standard {@link ApiResponseSerializer} error envelope, so callers never
 * see Nest's default `{ statusCode, message, error }` error body.
 *
 * {@link GlobalHttpException} instances are handled specially — their
 * `errorCode`/`requestId` are used directly. Any other `HttpException`
 * (e.g. the framework's built-ins, or `ValidationPipe` failures) falls back
 * to a generic mapping.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * @param exception - The thrown exception.
   * @param host - Gives access to the underlying Express request/response.
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const requestId = request.headers['x-request-id'] as string | undefined;

    if (exception instanceof GlobalHttpException) {
      response.status(exception.statusCode).json(
        ApiResponseSerializer.error({
          errorName: exception.errorCode,
          message: exception.message,
          statusCode: exception.statusCode,
          requestId: exception.requestId ?? requestId,
        }),
      );
      return;
    }

    const statusCode = exception.getStatus();
    const message = this.extractMessage(exception.getResponse(), exception.message);

    response.status(statusCode).json(ApiResponseSerializer.error({ message, statusCode, requestId }));
  }

  /**
   * Pulls a human-readable message out of Nest's default exception
   * response shape, flattening `ValidationPipe`'s array-of-messages into a
   * single comma-separated string.
   *
   * @param exceptionResponse - The raw value from `exception.getResponse()`.
   * @param fallback - Used if no `message` field can be found.
   * @returns A single message string.
   */
  private extractMessage(exceptionResponse: unknown, fallback: string): string {
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse) {
      const message = exceptionResponse.message;
      return Array.isArray(message) ? message.join(', ') : String(message);
    }
    return fallback;
  }
}
