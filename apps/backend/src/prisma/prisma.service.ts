import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '../../../../packages/database/generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
    this.logger.log('PrismaService instantiated (without connection)');
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma service initialized and connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma service disconnected');
  }
}
