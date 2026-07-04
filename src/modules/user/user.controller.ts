import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UserService } from './user.service';

import { ChangeLanguageDto, UpdateUserDto } from './dto/update-user.dto';
import { RoleEnum } from 'src/common/enum/user.enum';
import { Auth, User } from 'src/common/decorator';
import type { HUserDocument } from 'src/common/model';

import type { IAuthReq } from 'src/common/interface/auth.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth([RoleEnum.USER ])
  @Get()
  profile(
    @Req() req: IAuthReq,
    @User() user: HUserDocument,
  ) {
    return {
      message: 'Done',
      data: {
        language: req.lang,
        user,
      },
    };
  }
  @Patch('language')
    @Auth([RoleEnum.USER])
    changeLanguage(
      @Body() dto: ChangeLanguageDto,
      @User() user: HUserDocument,
    ) {
      return this.userService.changeLanguage(user, dto);
    }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
