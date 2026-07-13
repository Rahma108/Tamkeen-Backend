import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto, CreateUploadUrlDto } from './dto/create-cv.dto';
import { UpdateCvDto, UpdateCvFileDto } from './dto/update-cv.dto';
import { LangEnum, RoleEnum } from 'src/common/enum';
import { Auth, User } from 'src/common/decorator';
import type{ HUserDocument } from 'src/common/model';
import type{ IAuthReq } from 'src/common/interface';
import { Types } from 'mongoose';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}
   @Auth([RoleEnum.USER])
      @Get('test')
test(@Req() req: IAuthReq) {
  console.log(req.credentials);

  return req.credentials;
}

  // POST /cvs/upload-url
  @Auth([RoleEnum.USER])
  @Post('upload-url')
  async createUploadUrl(
    @Body() body: CreateUploadUrlDto,
    @User() user: HUserDocument,
    @Req() req: IAuthReq,
  ) {
      console.log("Reached upload-url");

    return await this.cvService.createUploadUrl(
      body,
      user,
      req.lang as LangEnum,
    );

  }
  @Auth([RoleEnum.USER])
    @Post()
    create(
      @Body() body: CreateCvDto,
      @User() user: HUserDocument,
      @Req() req: IAuthReq,
    ) {
      return this.cvService.create(
        body,
        user,
        req.lang as LangEnum,
      );
    }

    @Auth([RoleEnum.USER])
    @Get()
    findAll(@User() user: HUserDocument ,@Req() req: IAuthReq) {
      return this.cvService.findAll(user , req.lang as LangEnum);
    }

    @Auth([RoleEnum.USER])
    @Get(':id')
    findOne(
      @Param('id') id: string,
      @User() user: HUserDocument,
      @Req() req: IAuthReq,
    ) {
      return this.cvService.findOne(
        id as unknown as Types.ObjectId,
        user,
        req.lang as LangEnum,
      );
    }

    @Auth([RoleEnum.USER])
    @Patch(':id')
    update(
      @Param('id') id: string,
      @Body() dto: UpdateCvDto,
      @User() user: HUserDocument,
      @Req() req: IAuthReq,
    ) {
      return this.cvService.update(
        id as unknown as Types.ObjectId,
        dto,
        user,
        req.lang as LangEnum,
      );
    }


     @Auth([RoleEnum.USER])
    @Patch(':id/file')
    updateFile(
      @Param('id') id: string,
      @Body() dto: UpdateCvFileDto,
      @User() user: HUserDocument,
      @Req() req: IAuthReq,
    ) {
      return this.cvService.updateFile(
        id as unknown as Types.ObjectId,
        dto,
        user,
        req.lang as LangEnum,
      );
    }
    
     @Auth([RoleEnum.USER])
    @Delete(':id')
      remove(
        @Param('id') id: string,
        @User() user: HUserDocument,
        @Req() req: IAuthReq,
      ) {
        return this.cvService.remove(
          id as unknown as Types.ObjectId,
          user,
          req.lang as LangEnum,
        );
      }




}
