import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/services/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AUTH_CONSTANTS } from '../common/constants/auth.constants';

interface SessionPayload {
  type: 'session';
  sub: string;
  userId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  private normalizeUserId(userId: string): string {
    return userId.trim();
  }

  private ensureValidUserId(userId: string) {
    if (userId.length < AUTH_CONSTANTS.USER_ID_MIN_LENGTH) {
      throw new BadRequestException(
        `User ID must be at least ${AUTH_CONSTANTS.USER_ID_MIN_LENGTH} characters`
      );
    }

    if (userId.length > AUTH_CONSTANTS.USER_ID_MAX_LENGTH) {
      throw new BadRequestException(
        `User ID must be at most ${AUTH_CONSTANTS.USER_ID_MAX_LENGTH} characters`
      );
    }

    if (!AUTH_CONSTANTS.USER_ID_REGEX.test(userId)) {
      throw new BadRequestException(
        'User ID can only contain lowercase letters, numbers, and hyphen'
      );
    }
  }

  private async findOrCreateUser(userId: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: { userId },
    });

    if (existingUser) {
      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        userId,
        name: userId,
      },
    });
  }

  private buildSessionPayload(user: { id: string; userId: string }) {
    const sessionPayload: SessionPayload = {
      type: 'session',
      sub: user.id,
      userId: user.userId,
    };

    return this.jwtService.sign(sessionPayload, {
      expiresIn: AUTH_CONSTANTS.SESSION_EXPIRY,
    });
  }

  private mapUserResponse(user: {
    id: string;
    userId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      userId: user.userId,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async login(loginDto: LoginDto) {
    const normalizedUserId = this.normalizeUserId(loginDto.userId);
    this.ensureValidUserId(normalizedUserId);

    const user = await this.findOrCreateUser(normalizedUserId);
    const accessToken = this.buildSessionPayload(user);

    this.logger.debug(`User ${normalizedUserId} logged in`);

    return {
      accessToken,
      user: this.mapUserResponse(user),
    };
  }

  async devLogin(userId: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException(
        'Dev login is only available in development mode'
      );
    }

    const normalizedUserId = this.normalizeUserId(userId);
    this.ensureValidUserId(normalizedUserId);

    const user = await this.findOrCreateUser(normalizedUserId);
    const accessToken = this.buildSessionPayload(user);

    this.logger.debug(`Dev login for user ${normalizedUserId}`);

    return {
      accessToken,
      user: this.mapUserResponse(user),
    };
  }
}
