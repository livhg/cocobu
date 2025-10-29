import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/services/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AUTH_CONSTANTS } from '../common/constants/auth.constants';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

interface MagicLinkPayload {
  type: 'magic-link';
  email: string;
}

interface SessionPayload {
  type: 'session';
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {
    // Initialize email transporter
    // For development, use ethereal.email (fake SMTP)
    // In production, configure with real SMTP settings
    if (process.env.NODE_ENV === 'production') {
      this.transporter = nodemailer.createTransport({
        host: configService.get('SMTP_HOST'),
        port: configService.get('SMTP_PORT') || 587,
        secure: false,
        auth: {
          user: configService.get('SMTP_USER'),
          pass: configService.get('SMTP_PASS'),
        },
      });
    } else {
      // Development mode: log to console instead of sending email
      this.logger.log(
        '📧 Email service in development mode - emails will be logged to console'
      );
    }
  }

  async login(loginDto: LoginDto) {
    const { email } = loginDto;

    // Generate magic link token (15 minutes expiry)
    const payload: MagicLinkPayload = {
      type: 'magic-link',
      email,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: AUTH_CONSTANTS.MAGIC_LINK_EXPIRY,
    });

    // Store token hash in database for single-use validation
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.magicLinkToken.create({
      data: {
        tokenHash,
        email,
        expiresAt,
      },
    });

    // Generate magic link URL
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const magicLink = `${frontendUrl}/auth/verify?token=${token}`;

    // Send email
    if (process.env.NODE_ENV === 'production' && this.transporter) {
      await this.transporter.sendMail({
        from:
          this.configService.get('SMTP_FROM') ||
          AUTH_CONSTANTS.DEFAULT_FROM_EMAIL,
        to: email,
        subject: 'CocoBu 登入連結 / Login Link',
        text: `
Click the link below to log in to CocoBu:

${magicLink}

This link will expire in 15 minutes.

If you didn't request this, please ignore this email.

---
CocoBu 叩叩簿
        `.trim(),
      });
    } else {
      // Development mode: log magic link
      this.logger.log('\n========================================');
      this.logger.log('📧 Magic Link Email (Development Mode)');
      this.logger.log('========================================');
      this.logger.log(`To: ${email}`);
      this.logger.log(`Magic Link: ${magicLink}`);
      this.logger.log('========================================\n');
    }

    return {
      message: 'Magic link sent to your email',
      // In development, return the link for easier testing
      ...(process.env.NODE_ENV !== 'production' && { magicLink }),
    };
  }

  async verify(token: string) {
    // Validate token signature and expiry
    let payload: MagicLinkPayload;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired magic link');
    }

    if (payload.type !== 'magic-link') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Hash the token to look it up in the database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Use atomic transaction to prevent race conditions
    // This ensures only one request can successfully mark the token as used
    try {
      await this.prisma.$transaction(async (tx) => {
        // Check if token exists and get it atomically
        const tokenData = await tx.magicLinkToken.findUnique({
          where: { tokenHash },
        });

        if (!tokenData) {
          throw new UnauthorizedException(
            'Magic link not found or already used',
          );
        }

        if (tokenData.used) {
          throw new UnauthorizedException('Magic link has already been used');
        }

        if (tokenData.expiresAt < new Date()) {
          // Clean up expired token
          await tx.magicLinkToken.delete({
            where: { tokenHash },
          });
          throw new UnauthorizedException('Magic link has expired');
        }

        // Mark token as used atomically within the transaction
        await tx.magicLinkToken.update({
          where: { tokenHash },
          data: { used: true },
        });
      });
    } catch (error) {
      // Re-throw UnauthorizedException as-is
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Log and throw for unexpected errors
      this.logger.error('Failed to verify magic link token', error);
      throw new UnauthorizedException('Failed to verify magic link');
    }

    // Create session for user (outside transaction)
    return this.createSessionForUser(payload.email);
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // Helper method to create or get user and generate session token
  private async createSessionForUser(email: string) {
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
        },
      });
    }

    const sessionPayload: SessionPayload = {
      type: 'session',
      sub: user.id,
      email: user.email,
    };

    const sessionToken = this.jwtService.sign(sessionPayload, {
      expiresIn: AUTH_CONSTANTS.SESSION_EXPIRY,
    });

    return {
      accessToken: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // Development-only: Direct login without email
  async devLogin(email: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException(
        'Dev login is only available in development mode'
      );
    }

    return this.createSessionForUser(email);
  }
}
