import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Singleton pattern pour éviter les connexions multiples
let prismaServiceInstance: PrismaService | null = null;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    if (prismaServiceInstance) {
      return prismaServiceInstance;
    }

    super({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    prismaServiceInstance = this;
  }

  async onModuleDestroy() {
    await this.$disconnect();
    prismaServiceInstance = null;
  }
}