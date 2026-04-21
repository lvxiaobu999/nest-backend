import { IsNotEmpty, IsString } from 'class-validator';

// 登录接口只接收用户名和密码两个字段，并交给全局校验管道统一校验。
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
