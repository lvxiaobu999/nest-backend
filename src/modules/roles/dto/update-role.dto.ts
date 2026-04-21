import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';

// 更新角色时沿用创建参数，并自动把字段转成可选。
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
