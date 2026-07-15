import { IsEnum } from "class-validator";
import { LogoutEnum } from "src/common/enum/security.enum";

export class CreateUserDto {}

export class LogoutDto {
  @IsEnum(LogoutEnum)
  flag!: LogoutEnum;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProfileImageUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @IsString()
  @IsNotEmpty()
  originalName!: string;
}