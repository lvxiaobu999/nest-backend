import { Module } from '@nestjs/common';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
  providers: [MenusService],
  controllers: [MenusController],
})
export class MenusModule {}
