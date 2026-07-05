import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto, CreateUploadUrlDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { LangEnum, RoleEnum } from 'src/common/enum';
import { Auth, User } from 'src/common/decorator';
import type{ HUserDocument } from 'src/common/model';
import type{ IAuthReq } from 'src/common/interface';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

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

  @Get()
  findAll() {
    return this.cvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    return this.cvService.update(+id, updateCvDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cvService.remove(+id);
  }
}
