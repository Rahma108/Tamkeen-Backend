import { Controller, Post, Body, Patch,HttpCode, HttpStatus, UseInterceptors, Req, Res, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfirmEmailDTO, LoginDTO, ResendConfirmEmailDto, ResetForgotPasswordDTO, SignupDTO, SignupWithGoogleDTO, VerifyEmailDTO } from './dto/create-auth.dto';
import type{ IAuthReq, IResponse, IUser } from 'src/common/interface';
import { LoginResponse } from './entities/auth.entity';
import { WatchInterceptor } from 'src/common/interceptor';
import type { Request, Response } from 'express';
import { Auth, User } from 'src/common/decorator';
import { RoleEnum } from 'src/common/enum';
import type{ HUserDocument } from 'src/common/model';
import { LogoutDto } from '../user/dto/create-user.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
    @Post('signup')
    async signup(
      @Body() body: SignupDTO,
      @Req() req: IAuthReq,
    ): Promise<IResponse<IUser>> {

      return await this.authService.signup(body, req.lang);
    }
  @Post('login')
    @UseInterceptors(WatchInterceptor)
    @HttpCode(HttpStatus.OK)
    async login(
      @Req() req: IAuthReq,
      @Body() body: LoginDTO,
    ): Promise<LoginResponse> {
      return this.authService.login(
        body,
        `${req.protocol}://${req.get('host')}`,
        req.lang,
      );
    }
  @Patch('confirm-email')
    async confirmEmail(
      @Body() body: ConfirmEmailDTO,
      @Req() req: IAuthReq,
    ): Promise<void> {
      await this.authService.confirmEmail(body, req.lang);
    }

  @Patch('resend-confirm-email')
    async reSendConfirmEmail(
      @Body() body: ResendConfirmEmailDto,
      @Req() req: IAuthReq,
    ): Promise<void> {
      await this.authService.reSendConfirmEmail(body, req.lang);
    }

  // Google 
    @Post('signupWithGoogle')
    async signupWithGoogle(
      @Body() body: SignupWithGoogleDTO,
      @Req() req: IAuthReq,
      @Res({ passthrough: true }) res: Response,
    ): Promise<LoginResponse> {
      const { account, status } =
        await this.authService.signupWithGmail(
          body.idToken,
          `${req.protocol}://${req.get('host')}`,
          req.lang,
        );

      res.status(status);
      return account;
    }




  // Forget Password 
// ================== Forget Password ==================
    @Post('request-forgot-password-code')
    @HttpCode(HttpStatus.CREATED)
    async requestForgotPasswordCode(
      @Body() body: VerifyEmailDTO,
      @Req() req: IAuthReq,
    ): Promise<void> {
      await this.authService.requestForgotPasswordCode(body, req.lang);
    }

    @Patch('verify-forgot-password-code')
  @HttpCode(HttpStatus.OK)
  async verifyForgotPasswordCode(
    @Body() body: ConfirmEmailDTO,
    @Req() req: IAuthReq,
  ): Promise<void> {
    await this.authService.verifyForgotPasswordCode(body, req.lang);
  }

   @Patch('reset-forgot-password-code')
    @HttpCode(HttpStatus.OK)
    async resetForgotPasswordCode(
      @Body() body: ResetForgotPasswordDTO,
      @Req() req: IAuthReq,
    ): Promise<void> {
      await this.authService.resetForgotPasswordCode(body, req.lang);
    }


}
