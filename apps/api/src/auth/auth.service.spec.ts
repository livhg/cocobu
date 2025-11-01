import { describe, it, expect, beforeEach } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/services/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = new PrismaService();
    const jwtService = new JwtService({ secret: 'test-secret' });
    authService = new AuthService(prisma, jwtService);
  });

  it('creates a new user when logging in with a fresh user ID', async () => {
    const result = await authService.login({ userId: 'fresh-user' });

    expect(result.user.userId).toBe('fresh-user');

    const storedUser = await prisma.user.findFirst({
      where: { userId: 'fresh-user' },
    });

    expect(storedUser).not.toBeNull();
    expect(storedUser?.name).toBe('fresh-user');
  });

  it('reuses the same user record for repeated logins', async () => {
    const first = await authService.login({ userId: 'shared-user' });
    const second = await authService.login({ userId: 'shared-user' });

    expect(first.user.id).toBe(second.user.id);

    const allUsers = await prisma.user.findMany({});
    const sharedUsers = allUsers.filter((user) => user.userId === 'shared-user');
    expect(sharedUsers).toHaveLength(1);
  });

  it('rejects invalid user IDs', async () => {
    await expect(authService.login({ userId: '!!invalid!!' })).rejects.toThrow(
      /User ID can only contain/
    );
  });
});
