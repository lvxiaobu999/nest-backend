import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BusinessException } from '../../common/exceptions/business.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { QueryRolesDto } from './dto/query-roles.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const ROLE_BOUND_USERS_CODE = 10002;

const roleInclude = Prisma.validator<Prisma.RoleInclude>()({
  menus: {
    select: {
      id: true,
      title: true,
      path: true,
      enabled: true,
    },
  },
  permissions: {
    select: {
      id: true,
      name: true,
      code: true,
      enabled: true,
    },
  },
  _count: {
    select: {
      users: true,
      menus: true,
      permissions: true,
    },
  },
});

type RoleWithRelations = Prisma.RoleGetPayload<{ include: typeof roleInclude }>;

@Injectable()
export class RolesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: QueryRolesDto): Promise<RoleWithRelations[]> {
    return this.prismaService.role.findMany({
      where: this.buildWhereInput(query),
      include: roleInclude,
      orderBy: {
        createTime: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<RoleWithRelations | null> {
    return this.prismaService.role.findUnique({
      where: { id },
      include: roleInclude,
    });
  }

  async create(createRoleDto: CreateRoleDto): Promise<RoleWithRelations> {
    return this.prismaService.role.create({
      include: roleInclude,
      data: {
        name: createRoleDto.name,
        code: createRoleDto.code,
        desc: createRoleDto.desc,
        enabled: createRoleDto.enabled ?? true,
        menus: this.buildCreateMenuRelation(createRoleDto.menuIds),
        permissions: this.buildCreatePermissionRelation(createRoleDto.permissionIds),
      },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleWithRelations> {
    const data: Prisma.RoleUpdateInput = {
      name: updateRoleDto.name,
      code: updateRoleDto.code,
      desc: updateRoleDto.desc,
      enabled: updateRoleDto.enabled,
    };

    if (updateRoleDto.menuIds !== undefined) {
      data.menus = this.buildUpdateMenuRelation(updateRoleDto.menuIds);
    }

    if (updateRoleDto.permissionIds !== undefined) {
      data.permissions = this.buildUpdatePermissionRelation(updateRoleDto.permissionIds);
    }

    return this.prismaService.role.update({
      where: { id },
      include: roleInclude,
      data,
    });
  }

  async remove(id: string): Promise<RoleWithRelations> {
    const roleUserCount = await this.prismaService.role.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if ((roleUserCount?._count.users ?? 0) > 0) {
      throw new BusinessException('该角色已经绑定用户，不能删除', ROLE_BOUND_USERS_CODE);
    }

    return this.prismaService.role.delete({
      where: { id },
      include: roleInclude,
    });
  }

  private buildWhereInput(query: QueryRolesDto): Prisma.RoleWhereInput {
    return {
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
      menus: query.menuId
        ? {
            some: {
              id: query.menuId,
            },
          }
        : undefined,
      permissions: query.permissionId
        ? {
            some: {
              id: query.permissionId,
            },
          }
        : undefined,
    };
  }

  private buildCreateMenuRelation(
    ids?: string[],
  ): Prisma.MenuCreateNestedManyWithoutRolesInput | undefined {
    if (!ids || ids.length === 0) {
      return undefined;
    }

    return {
      connect: ids.map((relationId) => ({ id: relationId })),
    };
  }

  private buildCreatePermissionRelation(
    ids?: string[],
  ): Prisma.PermissionCreateNestedManyWithoutRolesInput | undefined {
    if (!ids || ids.length === 0) {
      return undefined;
    }

    return {
      connect: ids.map((relationId) => ({ id: relationId })),
    };
  }

  private buildUpdateMenuRelation(ids: string[]): Prisma.MenuUpdateManyWithoutRolesNestedInput {
    return {
      set: ids.map((relationId) => ({ id: relationId })),
    };
  }

  private buildUpdatePermissionRelation(
    ids: string[],
  ): Prisma.PermissionUpdateManyWithoutRolesNestedInput {
    return {
      set: ids.map((relationId) => ({ id: relationId })),
    };
  }
}
