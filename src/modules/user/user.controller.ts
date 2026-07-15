import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, ParseFilePipe, UploadedFile, MaxFileSizeValidator } from '@nestjs/common';
import { UserService } from './user.service';

import { ChangeLanguageDto, UpdateProfileImageDto, UpdateUserDto } from './dto/update-user.dto';
import { RoleEnum } from 'src/common/enum/user.enum';
import { Auth, User } from 'src/common/decorator';
import type { HUserDocument } from 'src/common/model';

import type { IAuthReq } from 'src/common/interface/auth.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudMulter, fileFieldValidation } from 'src/common/utils/service';
import type{ IFile, IUser } from 'src/common/interface';
import { AuthService } from '../auth/auth.service';
import { CreateProfileImageUploadUrlDto, LogoutDto } from './dto/create-user.dto';
import { TokenTypeEnum } from 'src/common/enum/security.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService ) {}

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

      // @UseInterceptors(FileInterceptor("attachment" , CloudMulter({ validation : fileFieldValidation.image  })) )
      // @Auth([RoleEnum.USER ])
      // @Patch("profile-image")
      // async profileImage(
      //   @UploadedFile(new ParseFilePipe({fileIsRequired: true, validators: [new MaxFileSizeValidator({maxSize: 2 * 1024 * 1024 })] })) file :IFile,
      //   @User() user:HUserDocument):Promise<IUser>{
      //   return await this.userService.profileImage(file , user )
        
      //   }


        //1-  POST /users/profile/upload-url
      @Auth([RoleEnum.USER])
      @Post('profile-image/upload-url')
      async profileImageUploadUrl(
        @Body() body: CreateProfileImageUploadUrlDto,
        @User() user: HUserDocument,
        @Req() req: IAuthReq,
      ): Promise<{ url: string; key: string; message: string }> {
        return this.userService.profileImageWithPreSignedLink(
          body,
          user,
          req.lang,
        );
      }
        // {
          //   "uploadUrl": "...",
          //   "key": "Tamkeen/Users/profile/123/uuid.png"
          // }
        // 2-  PUT uploadUrl
        //3-  PATCH /users/profile-image

      @Auth([RoleEnum.USER])
      @Patch("profile-image")
      async updateProfileImage(
        @Body() body: UpdateProfileImageDto,
        @User() user: HUserDocument,
        @Req() req: IAuthReq,
      ): Promise<{ message: string; user: IUser }> {
        return this.userService.updateProfileImage(
          body.profileImage,
          user,
          req.lang,
        );
      }


        // deleteProfileImage
    @Auth([RoleEnum.USER])
      @Delete("profile-image")
      async deleteProfileImage(
        @User() user: HUserDocument,
        @Req() req: IAuthReq,
      ): Promise<{ message: string; user: IUser }> {
        return this.userService.deleteProfileImage(
          user,
          req.lang,
        );
}


        //Profile Refresh token 
            @Auth([RoleEnum.USER] , TokenTypeEnum.refresh)
            @Get('rotate')
            async rotateToken(
              @User() user: HUserDocument,
              @Req() req: IAuthReq,
            ) {
              return await this.userService.rotateToken(
                user,
                req.credentials.decoded as { iat: number; jti: string; sub: string },
                `${req.protocol}://${req.get('host')}`,
                req.lang,
              );
            }
    
            // Logout
            @Auth([RoleEnum.USER])
            @Post('logout')
            async logout(
              @Body() body: LogoutDto,
              @User() user: HUserDocument,
              @Req() req: IAuthReq,
            ) {
              return await this.userService.logout(
                body.flag,
                user,
                req.credentials.decoded as { iat: number; jti: string; sub: string },
                req.lang,
              );
            }


        // delete profile 
        @Auth([RoleEnum.USER])
        @Delete('profile')
        
        async deleteProfile(
          @User() user:HUserDocument ,
          @Req() req: IAuthReq
        ){
          return  await this.userService.deleteProfile( user , req.lang)
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
