import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LangEnum } from 'src/common/enum/user.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class ChangeLanguageDto {
  @IsEnum(LangEnum)
  lang!: LangEnum;
}
export class UpdateProfileImageDto {
  @IsString()
  @IsNotEmpty()
  profileImage!: string;
}
