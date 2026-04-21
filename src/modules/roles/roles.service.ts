import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

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

  // 角色列表默认带出关联的菜单、权限和数量统计，方便管理页直接渲染。
  async findAll(): Promise<RoleWithRelations[]> {
    return this.prismaService.role.findMany({
      include: roleInclude,
      orderBy: {
        createTime: 'desc',
      },
    });
  }

  // 角色详情接口和列表保持同一份返回结构，减少前端适配成本。
  async findOne(id: string): Promise<RoleWithRelations | null> {
    return this.prismaService.role.findUnique({
      where: { id },
      include: roleInclude,
    });
  }

  // 创建角色时如果传入 menuIds / permissionIds，会同步建立多对多关联。
  async create(createRoleDto: CreateRoleDto): Promise<RoleWithRelations> {
    return this.prismaService.role.create({
      include: roleInclude,
      data: {
        name: createRoleDto.name,
        code: createRoleDto.code,
        desc: createRoleDto.desc,
        enabled: createRoleDto.enabled ?? 1,
        menus: this.buildCreateMenuRelation(createRoleDto.menuIds),
        permissions: this.buildCreatePermissionRelation(createRoleDto.permissionIds),
      },
    });
  }

  // 更新角色时使用 set 重建关联，确保提交的菜单和权限列表就是最终结果。
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

  // 删除角色时也返回角色信息，便于前端做删除确认或本地状态同步。
  async remove(id: string): Promise<RoleWithRelations> {
    return this.prismaService.role.delete({
      where: { id },
      include: roleInclude,
    });
  }

  // 创建时用 connect 绑定已有菜单，不在这里创建菜单实体。
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

  // 创建时用 connect 绑定已有权限，不在这里创建权限实体。
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

  // 更新时用 set 替换角色的菜单关联，传空数组即可清空。
  private buildUpdateMenuRelation(ids: string[]): Prisma.MenuUpdateManyWithoutRolesNestedInput {
    return {
      set: ids.map((relationId) => ({ id: relationId })),
    };
  }

  // 更新时用 set 替换角色的权限关联，确保关系状态可预测。
  private buildUpdatePermissionRelation(
    ids: string[],
  ): Prisma.PermissionUpdateManyWithoutRolesNestedInput {
    return {
      set: ids.map((relationId) => ({ id: relationId })),
    };
  }
}
