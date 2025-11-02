import { describe, it, expect, beforeEach } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

type StoredUser = {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

class MockPrismaService {
  private readonly users = new Map<string, StoredUser>();
  private idCounter = 1;

  user = {
    findFirst: async ({ where }: { where: { userId: string } }) => {
      const user = this.users.get(where.userId);
      return user ? { ...user } : null;
    },
    create: async ({
      data,
    }: {
      data: {
        userId: string;
        name?: string;
      };
    }) => {
      const now = new Date();
      const record: StoredUser = {
        id: `user-${this.idCounter++}`,
        userId: data.userId,
        name: data.name ?? data.userId,
        createdAt: now,
        updatedAt: now,
      };

      this.users.set(record.userId, record);
      return { ...record };
    },
    findMany: async () => Array.from(this.users.values()).map((user) => ({ ...user })),
  };

  clear() {
    this.users.clear();
    this.idCounter = 1;
  }
}

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: MockPrismaService;

  beforeEach(() => {
    prisma = new MockPrismaService();
    const jwtService = new JwtService({ secret: 'test-secret' });
    authService = new AuthService(prisma as unknown as any, jwtService);
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

    const allUsers = await prisma.user.findMany();
    const sharedUsers = allUsers.filter((user) => user.userId === 'shared-user');
    expect(sharedUsers).toHaveLength(1);
  });

  it('rejects invalid user IDs', async () => {
    await expect(authService.login({ userId: '!!invalid!!' })).rejects.toThrow(
      /User ID can only contain/
    );
  });
});
