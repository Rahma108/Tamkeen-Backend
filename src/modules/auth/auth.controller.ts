import { Controller, Post, Body, Patch,HttpCode, HttpStatus, UseInterceptors, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfirmEmailDTO, LoginDTO, ResendConfirmEmailDto, ResetForgotPasswordDTO, SignupDTO, SignupWithGoogleDTO, VerifyEmailDTO } from './dto/create-auth.dto';
import { IUser } from 'src/common/interface';
import { LoginResponse } from './entities/auth.entity';
import { WatchInterceptor } from 'src/common/interceptor';
import type { Request, Response } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')

  async signup(
    @Body() body: SignupDTO,
  ) :Promise<IUser>{
    console.log(body);
    const user = await this.authService.signup(body);
    return user;
  }
  @UseInterceptors(WatchInterceptor)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login (
    @Req() req : Request,
    @Body()
    body: LoginDTO,
  ) : Promise<LoginResponse>{
    console.log({lang : req.headers['accept-language']})
    const credentials = await this.authService.login(body , `${req.protocol}://${req.get('host')}`)
    return credentials;
  }
  @Patch('confirm-email')
  async confirmEmail(@Body() body:ConfirmEmailDTO):Promise<void>{
      await this.authService.confirmEmail(body)
      return ;
  }

  @Patch('/resend-confirm-email')
  async reSendConfirmEmail(@Body() body:ResendConfirmEmailDto):Promise<void>{
      await this.authService.reSendConfirmEmail(body)
      return ;
  }

  // Google 
  @Post('signupWithGoogle')
  async signupWithGoogle(
    @Body() body: SignupWithGoogleDTO,
    @Req() req:Request,
    @Res({passthrough:true}) res : Response
  )  :Promise<LoginResponse> {
    const {account , status} = await this.authService.signupWithGmail(body.idToken ,`${req.protocol}://${req.get('host')}`);
    res.status(status)
    return account;
  }




  // Forget Password 
// ================== Forget Password ==================

    @Post('request-forgot-password-code')
    @HttpCode(HttpStatus.CREATED)
    async requestForgotPasswordCode(
      @Body() body: VerifyEmailDTO,
    ): Promise<void> {
      await this.authService.requestForgotPasswordCode(body);
    }

    @Patch('verify-forgot-password-code')
    @HttpCode(HttpStatus.OK)
    async verifyForgotPasswordCode(
      @Body() body: ConfirmEmailDTO,
    ): Promise<void> {
      await this.authService.verifyForgotPasswordCode(body);
    }

    @Patch('reset-forgot-password-code')
    @HttpCode(HttpStatus.OK)
    async resetForgotPasswordCode(
      @Body() body: ResetForgotPasswordDTO,
    ): Promise<void> {
      await this.authService.resetForgotPasswordCode(body);
    }
}
