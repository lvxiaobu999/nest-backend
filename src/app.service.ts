import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo() {
    return {
      message: 'Nest + Prisma + PostgreSQL 服务已启动',
      endpoints: {
        root: 'GET /',
        users: 'GET /users',
      },
      document: 'README.md',
    };
  }
}
