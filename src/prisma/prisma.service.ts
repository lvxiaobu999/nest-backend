import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('未找到 DATABASE_URL，请检查 .env 配置。');
    }

    // Prisma 7 需要通过 PostgreSQL 驱动适配器来创建客户端实例。
    const adapter = new PrismaPg({
      connectionString,
    });

    super({ adapter });
  }

  // 应用关闭时主动释放 Prisma 连接，避免数据库连接残留。
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
