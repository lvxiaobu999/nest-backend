import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { hashPassword, verifyPassword } from '../../common/utils/password.util';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userPublicSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  isSuperAdmin: true,
  roleId: true,
  nickname: true,
  enabled: true,
  remark: true,
  createTime: true,
  updateTime: true,
});

export type SafeUser = Prisma.UserGetPayload<{ select: typeof userPublicSelect }>;

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  // 查询用户列表时主动排除 password，避免哈希值通过接口泄露。
  async findAll(): Promise<SafeUser[]> {
    return this.prismaService.user.findMany({
      select: userPublicSelect,
      orderBy: {
        createTime: 'desc',
      },
    });
  }

  // 单个用户查询同样只返回脱敏后的安全字段。
  async findOne(id: string): Promise<SafeUser | null> {
    return this.prismaService.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  }

  // 登录校验单独保留一条链路，这里会读取 password 做比对，但最终不会把它返回出去。
  async validateLogin(username: string, password: string): Promise<SafeUser | null> {
    const user = await this.prismaService.user.findUnique({
      where: { username },
    });

    if (!user || user.enabled !== 1) {
      return null;
    }

    // 只允许启用状态的用户登录，密码用 bcrypt.compare 校验。
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return this.toSafeUser(user);
  }

  // 创建用户时统一做密码哈希，数据库中不再保存明文密码。
  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    return this.prismaService.user.create({
      select: userPublicSelect,
      data: {
        username: createUserDto.username,
        password: await hashPassword(createUserDto.password),
        nickname: createUserDto.nickname,
        roleId: createUserDto.roleId,
        isSuperAdmin: createUserDto.isSuperAdmin ?? 0,
        enabled: createUserDto.enabled ?? 1,
        remark: createUserDto.remark,
      },
    });
  }

  // 更新用户时只有显式传入了新密码，才会重新做哈希并覆盖旧密码。
  async update(id: string, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    const data: Prisma.UserUncheckedUpdateInput = {
      username: updateUserDto.username,
      nickname: updateUserDto.nickname,
      roleId: updateUserDto.roleId,
      isSuperAdmin: updateUserDto.isSuperAdmin,
      enabled: updateUserDto.enabled,
      remark: updateUserDto.remark,
    };

    if (updateUserDto.password !== undefined) {
      data.password = await hashPassword(updateUserDto.password);
    }

    return this.prismaService.user.update({
      where: { id },
      select: userPublicSelect,
      data,
    });
  }

  // 删除接口也保持统一的脱敏返回格式。
  async remove(id: string): Promise<SafeUser> {
    return this.prismaService.user.delete({
      where: { id },
      select: userPublicSelect,
    });
  }

  // 将 Prisma 的完整 User 实体映射成安全的对外返回对象。
  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      username: user.username,
      isSuperAdmin: user.isSuperAdmin,
      roleId: user.roleId,
      nickname: user.nickname,
      enabled: user.enabled,
      remark: user.remark,
      createTime: user.createTime,
      updateTime: user.updateTime,
    };
  }
}
