import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Define BookType enum locally to match Prisma schema
// This avoids circular dependency and works even if Prisma client isn't generated
export enum BookType {
  personal = 'personal',
  split = 'split',
}

export class CreateBookDto {
  @ApiProperty({
    example: 'personal',
    description: 'Book type',
    enum: BookType,
  })
  @IsEnum(BookType)
  type!: BookType;

  @ApiProperty({
    example: '我的帳本',
    description: 'Book name',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    example: 'TWD',
    description: 'Currency code (ISO 4217, 3 letters)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;
}
