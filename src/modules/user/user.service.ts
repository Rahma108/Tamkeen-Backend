import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileImageUploadUrlDto, CreateUserDto } from './dto/create-user.dto';
import { ChangeLanguageDto, UpdateUserDto } from './dto/update-user.dto';
import type{ HUserDocument } from 'src/common/model/user.model';
import { Translator } from 'src/common/i18n/translator';
import { CacheService, S3Service, TokenService } from 'src/common/utils/service';
import type { IFile, IUser } from 'src/common/interface';
import { UserRepository } from 'src/common/repository';
import { Language } from 'src/common/i18n/language.type';
import { LoginResponse } from '../auth/entities/auth.entity';
import { LogoutEnum } from 'src/common/enum/security.enum';
import { ConfigService } from '@nestjs/config';
import { HydratedDocument } from 'mongoose';


@Injectable()
export class UserService {
    private ACCESS_EXPIRES_IN: number;
    private REFRESH_EXPIRES_IN: number;
   constructor(private readonly s3Service : S3Service ,
    private readonly userRepository : UserRepository  ,
     private readonly tokenService: TokenService ,
     private readonly redis:CacheService ,
      private readonly configService: ConfigService,
   ) {
     this.ACCESS_EXPIRES_IN = Number(
      this.configService.get('ACCESS_EXPIRES_IN'),
    );
    this.REFRESH_EXPIRES_IN = Number(
      this.configService.get('REFRESH_EXPIRES_IN'),
    );
   }

    async changeLanguage(
      user: HUserDocument,
      dto: ChangeLanguageDto,
    ) {
      user.lang = dto.lang;

      await user.save();

      return {
        message: Translator.user('LANGUAGE_UPDATED', dto.lang),
      };
    }
      async profileImage(file: IFile , user: HUserDocument): Promise<IUser>{
          const oldImage = user.profileImage ;
          user.profileImage = await this.s3Service.uploadAsset({file , path : `Users/${user._id.toString()}`})
          await user.save();
          if(oldImage){
            await this.s3Service.deleteAsset({Key : oldImage })
          }
          return user.toJSON()

      }


      // 1 , 2 
    async profileImageWithPreSignedLink(
    {
      contentType,
      originalName,
    }: CreateProfileImageUploadUrlDto,
    user: HUserDocument,
    lang: Language,
  ): Promise<{ url: string; key: string; message: string }> {

    const key = this.s3Service.generateKey({
      folder: 'Users/profile',
      userId: user._id.toString(),
      originalName,
    });
    console.log(key);

    const { url } = await this.s3Service.createPreSignedUploadLink({
      Key: key,
      ContentType: contentType,
    });
    return {
      url,
      key,
      message: Translator.user('UPLOAD_URL_CREATED', lang),
    };
  }

      
    async updateProfileImage(
    profileImage: string,
    user: HUserDocument,
    lang: Language,
  ): Promise<{ message: string; user: IUser }> {

    const oldImage = user.profileImage;

    user.profileImage = profileImage;

    await user.save();

    if (oldImage) {
      await this.s3Service.deleteAsset({
        Key: oldImage,
      });
    }

    return {
      message: Translator.user("PROFILE_IMAGE_UPDATED", lang),
      user: user.toJSON(),
    };
  }

async deleteProfileImage(
  user: HUserDocument,
  lang: Language,
): Promise<{ message: string; user: IUser }> {

  if (user.profileImage) {
    await this.s3Service.deleteAsset({
      Key: user.profileImage,
    });
  }

  user.profileImage = undefined;

  await user.save();

  return {
    message: Translator.user("PROFILE_IMAGE_DELETED", lang),
    user: user.toJSON(),
  };
}

    async createRevokeToken( { userId ,jti , ttl  }: { userId:string ,jti:string , ttl:number  }){
    await this.redis.set({
                key: this.redis.revokeTokenKey({userId , jti}),
                value : jti ,
                ttl 
            })
    return ;
}

          async rotateToken(
              user: HUserDocument,
              { iat, jti, sub }: { iat: number; jti: string; sub: string },
              issuer: string,
              lang: Language,
            ): Promise<LoginResponse> {
              const expiresAt = (iat + this.ACCESS_EXPIRES_IN) * 1000;
    
              if (expiresAt > Date.now() + 30000) {
                throw new ConflictException(
                  Translator.auth('ACCESS_TOKEN_STILL_VALID', lang),
                );
              }
    
              await this.createRevokeToken({
                userId: sub,
                jti,
                ttl: iat + this.REFRESH_EXPIRES_IN,
              });
    
              return this.tokenService.createLoginCredentials(user, issuer);
            }
    
            async logout(
                flag: LogoutEnum,
                user: HUserDocument,
                { jti, iat, sub }: { jti: string; iat: number; sub: string },
                lang: Language,
              ): Promise<void> {
                switch (flag) {
                  case LogoutEnum.All:
                    user.changeCredentialTime = new Date();
                    await user.save();
    
                    await this.redis.deleteKeys(
                      await this.redis.keys(
                        this.redis.baseRevokeTokenKey(sub),
                      ),
                    );
                    break;
    
                  default:
                    await this.createRevokeToken({
                      userId: sub,
                      jti,
                      ttl: iat + this.REFRESH_EXPIRES_IN,
                    });
                    break;
                }
              }


      // delete profile 
      
     async deleteProfile(user: HUserDocument, lang: Language) {
        const account = await this.userRepository.deleteOne({
          filter: { _id: user._id, force: true },
        });

        if (!account.deletedCount) {
          throw new NotFoundException(
            Translator.user("ACCOUNT_NOT_FOUND", lang),
          );
        }

        try {
          await this.s3Service.deleteFolderByPrefix({
            prefix: `Users/${user._id}`,
          });
        } catch (error) {
          console.error("S3 delete failed:", error);
        }

        return {
          message: Translator.user("ACCOUNT_DELETED", lang),
        };
      }



















  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }


  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
