import { IsNotEmpty, IsString } from "class-validator";

export class CreateCvDto {
  @IsString()
  @IsNotEmpty()
  key!: string;
  @IsString()
  @IsNotEmpty()
  title!: string;
}
export class CreateUploadUrlDto {
    @IsString()
    fileName!: string;

    @IsString()
    contentType!: string;
}
