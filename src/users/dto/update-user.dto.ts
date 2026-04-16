export class UpdateUserDto {
  // 更新时允许只改邮箱。
  email?: string;

  // 更新时允许只改名称。
  name?: string;
}
