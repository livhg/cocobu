import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { CleanupService } from './services/cleanup.service';

@Global()
@Module({
  providers: [PrismaService, CleanupService],
  exports: [PrismaService],
})
export class CommonModule {}
