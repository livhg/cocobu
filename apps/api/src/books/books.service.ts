import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findUserBooks(userId: string) {
    // Find books where user is owner or has membership using a single query
    return this.prisma.book.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            memberships: {
              some: { userId },
            },
          },
        ],
      },
      include: {
        owner: {
          select: { id: true, userId: true, name: true },
        },
        _count: {
          select: { memberships: true, entries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(bookId: string, userId: string) {
    // Query with access check built into WHERE clause for better performance
    const book = await this.prisma.book.findFirst({
      where: {
        id: bookId,
        OR: [
          { ownerId: userId },
          {
            memberships: {
              some: { userId },
            },
          },
        ],
      },
      include: {
        owner: {
          select: { id: true, userId: true, name: true },
        },
        memberships: {
          include: {
            user: {
              select: { id: true, userId: true, name: true },
            },
          },
        },
        _count: {
          select: { entries: true },
        },
      },
    });

    if (!book) {
      // Distinguish between "not found" and "no access"
      const bookExists = await this.prisma.book.findUnique({
        where: { id: bookId },
        select: { id: true },
      });

      if (!bookExists) {
        throw new NotFoundException('Book not found');
      }

      throw new ForbiddenException('You do not have access to this book');
    }

    return book;
  }

  async create(userId: string, createBookDto: CreateBookDto) {
    const { type, name, currency } = createBookDto;

    // Create book
    const book = await this.prisma.book.create({
      data: {
        type,
        name,
        currency: currency || 'TWD',
        ownerId: userId,
        memberships: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        owner: {
          select: { id: true, userId: true, name: true },
        },
        memberships: {
          include: {
            user: {
              select: { id: true, userId: true, name: true },
            },
          },
        },
      },
    });

    return book;
  }

  async delete(bookId: string, userId: string) {
    // Atomic delete operation: only deletes if both bookId and ownerId match
    const result = await this.prisma.book.deleteMany({
      where: {
        id: bookId,
        ownerId: userId,
      },
    });

    // If no rows deleted, determine if book doesn't exist or user doesn't own it
    if (result.count === 0) {
      const book = await this.prisma.book.findUnique({
        where: { id: bookId },
        select: { id: true },
      });

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      throw new ForbiddenException('Only the book owner can delete it');
    }

    return { message: 'Book deleted successfully' };
  }
}
