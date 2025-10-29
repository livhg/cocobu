import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../services/prisma.service';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  points: number;
  duration: number; // in seconds
}

export const RateLimit = Reflector.createDecorator<RateLimitOptions>();

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.get(
      RateLimit,
      context.getHandler(),
    );

    if (!rateLimitOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const email = request.body?.email;

    if (!email) {
      // If no email in request, allow it to pass (validation will catch it)
      return true;
    }

    const { points, duration } = rateLimitOptions;

    // Calculate the current window start (rounded to the nearest window)
    const now = new Date();
    const windowStart = new Date(
      Math.floor(now.getTime() / (duration * 1000)) * (duration * 1000),
    );

    try {
      // Use atomic upsert to prevent race conditions
      // This ensures accurate counting even with concurrent requests
      const rateLimit = await this.prisma.rateLimit.upsert({
        where: {
          email_windowStart: {
            email,
            windowStart,
          },
        },
        update: {
          count: { increment: 1 },
        },
        create: {
          email,
          windowStart,
          count: 1,
        },
      });

      // Check if limit exceeded after increment
      // Note: count reflects the value BEFORE increment due to upsert behavior
      // So we check if the current count (before this request) is >= points
      if (rateLimit.count >= points) {
        const retryAfter = Math.ceil(
          (windowStart.getTime() + duration * 1000 - now.getTime()) / 1000,
        );

        this.logger.warn(
          `Rate limit exceeded for email: ${email} (${rateLimit.count + 1}/${points} requests)`,
        );

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Too many requests. Please try again in ${retryAfter} seconds.`,
            error: 'Too Many Requests',
            retryAfter,
          },
          HttpStatus.TOO_MANY_REQUESTS,
          {
            cause: {
              retryAfter,
            },
          },
        );
      }

      return true;
    } catch (error) {
      // Re-throw HTTP exceptions (like TOO_MANY_REQUESTS)
      if (error instanceof HttpException) {
        throw error;
      }

      // FAIL CLOSED: Block requests when rate limit system is unavailable
      // This prevents bypassing rate limits during database outages
      this.logger.error('Rate limit check failed - blocking request', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Rate limit system unavailable. Please try again later.',
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
