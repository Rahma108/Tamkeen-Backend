import { PartialType } from '@nestjs/mapped-types';
import { CreateCvDto } from './create-cv.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCvDto extends PartialType(CreateCvDto) {}


export class UpdateCvFileDto {
  @IsString()
  @IsNotEmpty()
  key!: string;
  @IsString()
  @IsNotEmpty()
  title?: string;
}