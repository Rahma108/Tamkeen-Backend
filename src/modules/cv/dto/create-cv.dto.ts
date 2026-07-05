import { IsString } from "class-validator";

export class CreateCvDto {}

export class CreateUploadUrlDto {
    @IsString()
    fileName!: string;

    @IsString()
    contentType!: string;
}