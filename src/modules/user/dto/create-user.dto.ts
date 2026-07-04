import { IsEnum } from "class-validator";
import { LogoutEnum } from "src/common/enum/security.enum";

export class CreateUserDto {}

export class LogoutDto {
  @IsEnum(LogoutEnum)
  flag!: LogoutEnum;
}