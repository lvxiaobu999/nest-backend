import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SafeUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

export interface LoginResponse {
  // 当前先返回脱敏后的用户信息，后续如果接 JWT 可以在这里扩展 token 字段。
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  // 登录服务只负责认证流程编排，具体密码校验放在 UsersService 中复用。
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.validateLogin(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    return { user };
  }
}
