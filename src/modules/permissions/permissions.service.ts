import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { QueryPermissionsDto } from './dto/query-permissions.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

const permissionInclude = Prisma.validator<Prisma.PermissionInclude>()({
  menu: {
    select: {
      id: true,
      title: true,
      path: true,
      enabled: true,
    },
  },
  roles: {
    select: {
      id: true,
      name: true,
      code: true,
      enabled: true,
    },
  },
  _count: {
    select: {
      roles: true,
    },
  },
});

export type PermissionWithRelations = Prisma.PermissionGetPayload<{
  include: typeof permissionInclude;
}>;

@Injectable()
export class PermissionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: QueryPermissionsDto): Promise<PermissionWithRelations[]> {
    return this.prismaService.permission.findMany({
      where: this.buildWhereInput(query),
      include: permissionInclude,
      orderBy: {
        createTime: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<PermissionWithRelations | null> {
    return this.prismaService.permission.findUnique({
      where: { id },
      include: permissionInclude,
    });
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionWithRelations> {
    return this.prismaService.permission.create({
      include: permissionInclude,
      data: {
        name: createPermissionDto.name,
        code: createPermissionDto.code,
        remark: createPermissionDto.remark,
        enabled: createPermissionDto.enabled ?? true,
        menuId: createPermissionDto.menuId,
      },
    });
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionWithRelations> {
    return this.prismaService.permission.update({
      where: { id },
      include: permissionInclude,
      data: {
        name: updatePermissionDto.name,
        code: updatePermissionDto.code,
        remark: updatePermissionDto.remark,
        enabled: updatePermissionDto.enabled,
        menuId: updatePermissionDto.menuId,
      },
    });
  }

  async remove(id: string): Promise<PermissionWithRelations> {
    return this.prismaService.permission.delete({
      where: { id },
      include: permissionInclude,
    });
  }

  private buildWhereInput(query: QueryPermissionsDto): Prisma.PermissionWhereInput {
    return {
      menuId: query.menuId,
      enabled: query.enabled,
      name: query.name
        ? {
            contains: query.name,
            mode: 'insensitive',
          }
        : undefined,
      code: query.code
        ? {
            contains: query.code,
            mode: 'insensitive',
          }
        : undefined,
    };
  }
}
