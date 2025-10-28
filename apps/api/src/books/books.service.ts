import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
          select: { id: true, email: true, name: true },
        },
        _count: {
          select: { memberships: true, entries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(bookId: string, userId: string) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: {
        owner: {
          select: { id: true, email: true, name: true },
        },
        memberships: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
        _count: {
          select: { entries: true },
        },
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Check if user has access (owner or member)
    const hasAccess =
      book.ownerId === userId ||
      book.memberships.some((m: any) => m.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this book');
    }

    return book;
  }

  async create(userId: string, createBookDto: CreateBookDto) {
    const { type, name, currency } = createBookDto;

    // Create book
    const book = await this.prisma.book.create({
      data: {
        type: type as any,
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
          select: { id: true, email: true, name: true },
        },
        memberships: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    return book;
  }

  async delete(bookId: string, userId: string) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.ownerId !== userId) {
      throw new ForbiddenException('Only the book owner can delete it');
    }

    await this.prisma.book.delete({
      where: { id: bookId },
    });

    return { message: 'Book deleted successfully' };
  }
}
