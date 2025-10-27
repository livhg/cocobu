import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/services/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as nodemailer from 'nodemailer';

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
  private transporter: nodemailer.Transporter | null = null;
  private magicLinkTokens: Map<string, { email: string; used: boolean; expires: Date }> = new Map();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
      console.log('📧 Email service in development mode - emails will be logged to console');
    }
  }

  async login(loginDto: LoginDto) {
    const { email } = loginDto;

    // TODO: Implement rate limiting (3 requests per hour per email)
    // For MVP, skip rate limiting

    // Generate magic link token (15 minutes expiry)
    const payload: MagicLinkPayload = {
      type: 'magic-link',
      email,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Store token for single-use validation
    this.magicLinkTokens.set(token, {
      email,
      used: false,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });

    // Generate magic link URL
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const magicLink = `${frontendUrl}/auth/verify?token=${token}`;

    // Send email
    if (process.env.NODE_ENV === 'production' && this.transporter) {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM') || 'noreply@cocobu.app',
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
      console.log('\n========================================');
      console.log('📧 Magic Link Email (Development Mode)');
      console.log('========================================');
      console.log(`To: ${email}`);
      console.log(`Magic Link: ${magicLink}`);
      console.log('========================================\n');
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

    // Check if token has been used
    const tokenData = this.magicLinkTokens.get(token);
    if (!tokenData) {
      throw new UnauthorizedException('Magic link not found or already used');
    }

    if (tokenData.used) {
      throw new UnauthorizedException('Magic link has already been used');
    }

    if (tokenData.expires < new Date()) {
      this.magicLinkTokens.delete(token);
      throw new UnauthorizedException('Magic link has expired');
    }

    // Mark token as used
    tokenData.used = true;

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: payload.email,
          name: payload.email.split('@')[0], // Default name from email
        },
      });
    }

    // Generate session token (7 days expiry)
    const sessionPayload: SessionPayload = {
      type: 'session',
      sub: user.id,
      email: user.email,
    };

    const sessionToken = this.jwtService.sign(sessionPayload, { expiresIn: '7d' });

    // Clean up used magic link token after a delay
    setTimeout(() => {
      this.magicLinkTokens.delete(token);
    }, 60000); // Delete after 1 minute

    return {
      accessToken: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
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

  // Development-only: Direct login without email
  async devLogin(email: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Dev login is only available in development mode');
    }

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

    const sessionToken = this.jwtService.sign(sessionPayload, { expiresIn: '7d' });

    return {
      accessToken: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
