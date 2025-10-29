import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Clean up expired magic link tokens
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredMagicLinkTokens() {
    try {
      const now = new Date();
      const result = await this.prisma.magicLinkToken.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(
          `Cleaned up ${result.count} expired magic link tokens`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to clean up expired magic link tokens', error);
    }
  }

  /**
   * Clean up old rate limit records
   * Keep rate limits for 24 hours after window start
   * Runs every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async cleanupOldRateLimits() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = await this.prisma.rateLimit.deleteMany({
        where: {
          windowStart: {
            lt: yesterday,
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} old rate limit records`);
      }
    } catch (error) {
      this.logger.error('Failed to clean up old rate limit records', error);
    }
  }
}
