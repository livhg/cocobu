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
  keyPrefix: string;
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
      // Find or create rate limit record for this email and window
      const rateLimit = await this.prisma.rateLimit.findUnique({
        where: {
          email_windowStart: {
            email,
            windowStart,
          },
        },
      });

      if (rateLimit) {
        // Check if limit exceeded
        if (rateLimit.count >= points) {
          const retryAfter = Math.ceil(
            (windowStart.getTime() + duration * 1000 - now.getTime()) / 1000,
          );

          this.logger.warn(
            `Rate limit exceeded for email: ${email} (${rateLimit.count}/${points} requests)`,
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

        // Increment count
        await this.prisma.rateLimit.update({
          where: { id: rateLimit.id },
          data: { count: { increment: 1 } },
        });
      } else {
        // Create new rate limit record
        await this.prisma.rateLimit.create({
          data: {
            email,
            windowStart,
            count: 1,
          },
        });
      }

      return true;
    } catch (error) {
      // Re-throw HTTP exceptions
      if (error instanceof HttpException) {
        throw error;
      }

      // Log other errors but allow the request
      this.logger.error('Rate limit check failed', error);
      return true;
    }
  }
}
