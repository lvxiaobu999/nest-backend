export class CreateUserDto {
  // 用户邮箱，同时会作为唯一字段写入数据库。
  email: string;

  // 用户名称为可选字段，便于后续逐步补充资料。
  name?: string;
}
