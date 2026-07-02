import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { IsMatch } from 'src/common/decorator/index';

export class CreateAuthDto {}
export class ResendConfirmEmailDto  {
  @IsEmail({} , { message: 'Please Enter your email' })
  email!: string;
}

export class ConfirmEmailDTO extends ResendConfirmEmailDto{
  @Matches(/^d{6}$/)
  otp! : string;

}
export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
 
  @IsStrongPassword()
  password!: string;

  FCM?: string;
}

export class SignupDTO extends LoginDTO {
  @Length(2, 20, { message: 'Invalid range is 2 - 20' })
  username!: string;

  @ValidateIf((o) => o.password !== undefined)
  @IsMatch<string>(['password'], { message: 'Password do not match with confirmPassword' })
  confirmPassword!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}


export class SignupWithGoogleDTO  {
  @IsString()
  @IsNotEmpty()
  idToken !:string;

}
