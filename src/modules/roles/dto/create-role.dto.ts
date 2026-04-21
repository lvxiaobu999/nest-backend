import { ArrayUnique, IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

// 角色创建参数，同时支持一次性绑定菜单和权限。
export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  enabled?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  // 角色关联的菜单 ID 列表。
  menuIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  // 角色关联的权限 ID 列表。
  permissionIds?: string[];
}
