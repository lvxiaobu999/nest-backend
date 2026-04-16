import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return project info', () => {
      expect(appController.getAppInfo()).toEqual({
        message: 'Nest + Prisma + PostgreSQL 服务已启动',
        endpoints: {
          root: 'GET /',
          users: 'GET /users',
        },
        document: 'README.md',
      });
    });
  });
});
