import { BadRequestException, ConflictException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfirmEmailDTO, LoginDTO, ResendConfirmEmailDto, SignupDTO } from './dto/create-auth.dto';
import { ProviderEnum } from 'src/common/enum/user.enum';
import { emailEmitter } from 'src/common/events';
import { EmailEnum } from 'src/common/enum';
import { IUser } from 'src/common/interface';
import { ConfigService } from '@nestjs/config';
import { CacheService, EmailService, EncryptionSecurity, SecurityService, TokenService } from 'src/common/utils/service';
import { UserRepository } from 'src/common/repository/user.repository';
import { createNumberOtp } from 'src/common/utils/otp';
import { LoginResponse } from './entities/auth.entity';
import { OAuth2Client, TokenPayload } from 'google-auth-library';


@Injectable()
export class AuthService {
   constructor(
    private readonly configService : ConfigService  ,
    private readonly tokenService : TokenService,
    private  readonly securityService: SecurityService,
    private  readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
    private readonly redis: CacheService,
    private readonly encryption: EncryptionSecurity
  ) {}
    private verifyEmailOtp = async({ title   , subject=EmailEnum.confirmEmail ,  email }
        :{title:string , subject:EmailEnum , email:string } ):Promise<void>=>{
           //Check Block Conditional .
        const blockKey=  this.redis.otpBlockKey({email , type:subject })
        const remainingBlockTime = await this.redis.ttl(blockKey)
        if(remainingBlockTime>0){
            throw  new ConflictException(`You have reached Max Request Trial Count please try again later after ${remainingBlockTime} sec. `)
        }

        const oldCodeTTL = await this.redis.ttl(this.redis.otpKey({email , type:subject}))
        if(oldCodeTTL > 0 ){
            throw  new ConflictException(`Sorry we can not send new otp until first one get expired please try again after ${oldCodeTTL} `)

        }
        //check Max Request Trials 
        const maxTrialKey = this.redis.otpMaxRequestKey({email , type:subject })
            const checkOtpMaxRequest = Number(await this.redis.get(maxTrialKey) || 0 )
            if(checkOtpMaxRequest>=3){
                await this.redis.set({
                key:  blockKey , 
                value : 0
                , ttl:300 })
        
            throw  new ConflictException("You have reached Max Request Trial Count please try again later after 300 sec. ")

            }

            const code = await createNumberOtp()
            await this.redis.set({
            key: this.redis.otpKey({email , type:subject }) , 
            value : await this.securityService.generateHash({plaintext : code.toString()})
            , ttl: 120
        })
            await this.emailService.sendEmail({
                to:email ,
                subject,
                html:this.emailService.emailTemplate({code , title })
            })
        checkOtpMaxRequest  > 0 ? await this.redis.increment(maxTrialKey): await this.redis.set({key : maxTrialKey , value : 1 , ttl : 300 })
        return ;
}

//Confirm Email with otp..
    public  confirmEmail = async({otp , email} : ConfirmEmailDTO ) : Promise<void>=>{

        const account = await this.userRepository.findOne({
        filter:{email , confirmEmail: { $eq: null } , provider:ProviderEnum.SYSTEM }  ,
        projection:"email"
    })
    if(!account){
        throw  new NotFoundException("Fail to find Match account ❌")
    }
    const hashOtp = await this.redis.get(this.redis.otpKey({email}))
    if(!hashOtp){
        throw new NotFoundException("Expired OTP 😊")
    }
    if(!await this.securityService.compareHash({plaintext: otp  , cipherText: hashOtp} )){
        throw  new ConflictException("Invalid OTP ❌")
    }
    account.confirmEmail = new Date()
    await account.save()
    await this.redis.deleteKeys(await this.redis.keys(this.redis.otpKey({email })))
    return ;
    }

    public reSendConfirmEmail = async({email}: ResendConfirmEmailDto):Promise<void>=>{
        const account = await this.userRepository.findOne({
        filter:{email , confirmEmail: { $eq: null } , Provider:ProviderEnum.SYSTEM }  ,
        projection:"email"
    })
    if(!account){
        throw new  NotFoundException("Fail to find Match account ❌")
    }
        // Re-Send a verification code to email after registration
    await this.verifyEmailOtp({title  : "Verify Account", subject: EmailEnum.confirmEmail , email:email })
    return ;


}
   public async login(inputs: LoginDTO, issuer: string) :Promise<LoginResponse>{
  const { email, password } = inputs;

  const user = await this.userRepository.findOne({
    filter: {
      email,
      confirmEmail: { $ne: null },
      provider: ProviderEnum.SYSTEM,
    },
    options: { lean: false },
    projection: '+password',
  });

  if (!user) {
    throw new UnauthorizedException("Invalid Login Credentials ❌");
  }

  const isMatch = await this.securityService.compareHash({
    plaintext: password,
    cipherText: user.password,
  });

  if (!isMatch) {
    throw new UnauthorizedException("Invalid Login Credentials ❌");
  }

  return this.tokenService.createLoginCredentials(user, issuer);
}
    public async signup(data: SignupDTO): Promise<IUser> {
        let { username, email, password , phone } = data
        
        const checkUserExist = await this.userRepository.findOne({
            filter: { email },
            projection: "email",
            options: { lean: true }
        })
        
        if (checkUserExist) {
            throw new ConflictException("Email Exists ‼️‼️")
        }    
       const hashedPassword = await this.securityService.generateHash({
  plaintext: password,
});

        const encryptedPhone = phone ? this.encryption.encrypt(phone) : undefined;

        const user = await this.userRepository.create({
        data: {
            username,
            email,
            password: hashedPassword,
            phone: encryptedPhone,
        },
        });
        
        if (!user) {
            throw new BadRequestException("Fail To Create User ✖️")
        }
        
        emailEmitter.emit("sendEmail", async () => {
            await this.verifyEmailOtp({
                title: "Verify Account",
                subject: EmailEnum.confirmEmail,
                email: email
            })
        })
        
        return user.toJSON()
    }

    
    // With Google 
    
    private async  verifyGoogleAccount(idToken : string ) : Promise<TokenPayload>{
            const client = new OAuth2Client();
            const ticket = await client.verifyIdToken({
                idToken,
                audience: this.configService.get('CLIENT_ID') , 
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new BadRequestException('Invalid Google token');
            }
            console.log(payload);
            if(!payload?.email_verified){
            throw new  BadRequestException("Fail to verify authenticated this account with google 🫠")

            }
            return payload


}

    async loginWithGmail (idToken: string , issuer : string):Promise<LoginResponse>{
    if (!idToken) {
        throw new BadRequestException( "idToken is required" );
    }
    const payload = await this.verifyGoogleAccount(idToken)
    const user = await this.userRepository.findOne( {filter:{ email:payload.email as string , provider:ProviderEnum.GOOGLE } } )
    if(!user){
        throw  new NotFoundException( "Invalid Login Credentials .")

    }

    return await this.tokenService.createLoginCredentials(user, issuer) 
}

    async signupWithGmail(idToken: string , issuer : string):Promise<{ status : number , account: LoginResponse } >{
        if (!idToken) {
            throw new BadRequestException("idToken is required" );
        }
        const payload = await this.verifyGoogleAccount(idToken)
        const checkUserExist = await this.userRepository.findOne( {filter:{ email:payload.email as string }} )
        if(checkUserExist){
            // 1- User Exists in Database  And Provider == System  ==> Throw Error ..
            if(checkUserExist.provider == ProviderEnum.SYSTEM){
            throw new ConflictException("Account Already Exist With Different Provider ‼️")

        }
            const token = await this.tokenService.createLoginCredentials(checkUserExist, issuer);
            return {
                    account: token,
                    status: HttpStatus.OK,
                    };

        }

        //  3- User Not Exists ==> Create with Provider Google .
        // New user → create + login
        const newUser = await this.userRepository.create({
            data: {
            firstName: payload.given_name || '',
            lastName: payload.family_name || '',
            email: payload.email,
            provider: ProviderEnum.GOOGLE,
            profileImage: payload.picture,
            confirmEmail: new Date(),
            phone:""
            }
        });

        const token = await this.tokenService.createLoginCredentials(newUser, issuer);
        return {
            account: token,
            status: HttpStatus.CREATED,
            };


}

}
