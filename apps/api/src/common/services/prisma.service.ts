import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@cocobu/database';
import { randomUUID } from 'crypto';

type MockUser = {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type MockBook = {
  id: string;
  type: 'personal' | 'split';
  name: string;
  currency: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

type MockMembership = {
  id: string;
  bookId: string;
  userId: string;
  role: 'owner' | 'admin' | 'writer' | 'reader';
  joinedAt: Date;
};

class MockPrismaClient {
  private readonly users = new Map<string, MockUser>();
  private readonly books = new Map<string, MockBook>();
  private readonly memberships = new Map<string, MockMembership>();

  constructor() {
    const now = new Date();
    const user: MockUser = {
      id: 'demo-user',
      userId: 'demo',
      name: 'Demo User',
      createdAt: now,
      updatedAt: now,
    };

    const book: MockBook = {
      id: 'demo-book',
      type: 'personal',
      name: 'Demo Book',
      currency: 'TWD',
      ownerId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    const membership: MockMembership = {
      id: randomUUID(),
      bookId: book.id,
      userId: user.id,
      role: 'owner',
      joinedAt: now,
    };

    this.users.set(user.id, user);
    this.books.set(book.id, book);
    this.memberships.set(membership.id, membership);
  }

  private clone<T>(value: T): T {
    const cloner = (
      globalThis as { structuredClone?: (value: unknown) => unknown }
    ).structuredClone;
    if (typeof cloner === 'function') {
      return cloner(value) as T;
    }

    return JSON.parse(JSON.stringify(value), (_key, val) => {
      if (typeof val === 'string') {
        const date = new Date(val);
        if (!Number.isNaN(date.getTime()) && val.includes('T')) {
          return date;
        }
      }
      return val;
    });
  }

  private applySelect<T extends Record<string, any>>(entity: T, select?: any) {
    if (!select) {
      return this.clone(entity);
    }

    const result: Record<string, any> = {};
    for (const key of Object.keys(select)) {
      if (select[key]) {
        result[key] = this.clone(entity[key as keyof T]);
      }
    }
    return result;
  }

  private findMembershipsByBook(bookId: string) {
    return Array.from(this.memberships.values()).filter(
      (membership) => membership.bookId === bookId
    );
  }

  private bookMatchesWhere(book: MockBook, where: any) {
    if (!where) {
      return true;
    }

    if (where.id && where.id !== book.id) {
      return false;
    }

    if (where.ownerId && where.ownerId !== book.ownerId) {
      return false;
    }

    if (where.memberships?.some?.userId) {
      const memberships = this.findMembershipsByBook(book.id);
      return memberships.some(
        (membership) => membership.userId === where.memberships.some.userId
      );
    }

    if (where.OR) {
      return where.OR.some((condition: any) =>
        this.bookMatchesWhere(book, condition)
      );
    }

    return true;
  }

  private userMatchesWhere(user: MockUser, where: any) {
    if (!where) {
      return true;
    }

    if (where.id && where.id !== user.id) {
      return false;
    }

    if (where.userId && where.userId !== user.userId) {
      return false;
    }

    if (where.AND) {
      return where.AND.every((condition: any) =>
        this.userMatchesWhere(user, condition)
      );
    }

    if (where.OR) {
      return where.OR.some((condition: any) =>
        this.userMatchesWhere(user, condition)
      );
    }

    return true;
  }

  private buildBookPayload(book: MockBook, args: any = {}) {
    const base: Record<string, any> = { ...book };

    if (args.include?.owner) {
      const owner = this.users.get(book.ownerId);
      if (owner) {
        base['owner'] = this.applySelect(owner, args.include.owner.select);
      }
    }

    if (args.include?.memberships) {
      const memberships = this.findMembershipsByBook(book.id);
      base['memberships'] = memberships.map((membership) => {
        if (args.include.memberships.include?.user) {
          const user = this.users.get(membership.userId);
          return {
            ...membership,
            user: user
              ? this.applySelect(
                  user,
                  args.include.memberships.include.user.select
                )
              : null,
          };
        }
        return membership;
      });
    }

    if (args.include?._count) {
      const memberships = this.findMembershipsByBook(book.id);
      const counts: Record<string, number> = {};
      const select = args.include._count.select;
      if (!select || select.memberships) {
        counts.memberships = memberships.length;
      }
      if (!select || select.entries) {
        counts.entries = 0;
      }
      base['_count'] = counts;
    }

    if (args.select) {
      return this.applySelect(base, args.select);
    }

    return base;
  }

  user = {
    findUnique: async ({ where, select }: any) => {
      if (where?.id) {
        const user = this.users.get(where.id);
        if (!user) {
          return null;
        }
        return this.applySelect(user, select);
      }

      for (const candidate of this.users.values()) {
        if (this.userMatchesWhere(candidate, where)) {
          return this.applySelect(candidate, select);
        }
      }

      return null;
    },
    findMany: async ({ where, select }: any = {}) => {
      const users = Array.from(this.users.values()).filter((user) =>
        this.userMatchesWhere(user, where)
      );
      return users.map((user) => this.applySelect(user, select));
    },
    findFirst: async ({ where, select }: any) => {
      for (const user of this.users.values()) {
        if (this.userMatchesWhere(user, where)) {
          return this.applySelect(user, select);
        }
      }
      return null;
    },
    create: async ({ data, select }: any) => {
      const now = new Date();
      const user: MockUser = {
        id: data.id ?? randomUUID(),
        userId: data.userId,
        name: data.name ?? data.userId,
        createdAt: now,
        updatedAt: now,
      };
      this.users.set(user.id, user);
      return this.applySelect(user, select);
    },
    update: async ({ where, data, select }: any) => {
      const user = await this.user.findUnique({ where });
      if (!user) {
        throw new Error('User not found');
      }
      const stored = this.users.get((user as MockUser).id)!;
      if (data.userId) {
        stored.userId = data.userId;
      }
      if (data.name) {
        stored.name = data.name;
      }
      stored.updatedAt = new Date();
      this.users.set(stored.id, stored);
      return this.applySelect(stored, select);
    },
  };

  book = {
    findMany: async (args: any) => {
      const books = Array.from(this.books.values()).filter((book) =>
        this.bookMatchesWhere(book, args?.where)
      );

      if (args?.orderBy?.createdAt === 'desc') {
        books.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      return books.map((book) => this.buildBookPayload(book, args));
    },
    findFirst: async (args: any) => {
      for (const book of this.books.values()) {
        if (this.bookMatchesWhere(book, args?.where)) {
          return this.buildBookPayload(book, args);
        }
      }
      return null;
    },
    findUnique: async ({ where, select, include }: any) => {
      const book = this.books.get(where?.id);
      if (!book) {
        return null;
      }
      return this.applySelect(this.buildBookPayload(book, { include }), select);
    },
    create: async ({ data, include }: any) => {
      const now = new Date();
      const book: MockBook = {
        id: randomUUID(),
        type: data.type,
        name: data.name,
        currency: data.currency ?? 'TWD',
        ownerId: data.ownerId,
        createdAt: now,
        updatedAt: now,
      };
      this.books.set(book.id, book);

      if (data.memberships?.create) {
        const membership: MockMembership = {
          id: randomUUID(),
          bookId: book.id,
          userId: data.memberships.create.userId,
          role: data.memberships.create.role ?? 'owner',
          joinedAt: now,
        };
        this.memberships.set(membership.id, membership);
      }

      return this.buildBookPayload(book, { include });
    },
    deleteMany: async ({ where }: any) => {
      let count = 0;
      for (const book of Array.from(this.books.values())) {
        if (
          (!where.id || where.id === book.id) &&
          (!where.ownerId || where.ownerId === book.ownerId)
        ) {
          this.books.delete(book.id);
          for (const membership of this.findMembershipsByBook(book.id)) {
            this.memberships.delete(membership.id);
          }
          count += 1;
        }
      }
      return { count };
    },
  };

  async $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return fn({
      user: this.user,
      book: this.book,
    });
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly useMock: boolean;

  constructor() {
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
    super();
    this.useMock = !hasDatabaseUrl;

    if (this.useMock) {
      this.logger.warn(
        'DATABASE_URL is not set. PrismaService is running with an in-memory mock database.'
      );
      Object.assign(this, new MockPrismaClient());
    }
  }

  async onModuleInit() {
    if (this.useMock) {
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    if (this.useMock) {
      return;
    }
    await this.$disconnect();
  }
}
