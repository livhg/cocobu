import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      error: {
        code: this.getErrorCode(exception),
        message:
          typeof message === 'string'
            ? message
            : (message as { message?: string }).message || 'An error occurred',
        details:
          typeof message === 'object'
            ? (message as { error?: string }).error
            : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
    };

    // Log error for monitoring
    if (status >= 500) {
      console.error('Internal Server Error:', {
        error: exception,
        request: {
          url: request.url,
          method: request.method,
          body: request.body,
        },
      });
    }

    response.status(status).json(errorResponse);
  }

  private getErrorCode(exception: unknown): string {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          return 'BAD_REQUEST';
        case HttpStatus.UNAUTHORIZED:
          return 'UNAUTHORIZED';
        case HttpStatus.FORBIDDEN:
          return 'FORBIDDEN';
        case HttpStatus.NOT_FOUND:
          return 'NOT_FOUND';
        case HttpStatus.CONFLICT:
          return 'CONFLICT';
        case HttpStatus.UNPROCESSABLE_ENTITY:
          return 'VALIDATION_ERROR';
        default:
          return 'HTTP_ERROR';
      }
    }
    return 'INTERNAL_SERVER_ERROR';
  }
}
