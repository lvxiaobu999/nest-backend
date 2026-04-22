import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  keepAlive?: boolean;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @IsOptional()
  @IsBoolean()
  isLogin?: boolean;

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  parentId?: string;
}
