import { JwtPayload, SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { HydratedDocument } from 'mongoose';
import { CacheService } from './caching.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from 'src/common/repository';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/common/interface';
import { TokenTypeEnum } from '../../enum/security.enum';
import { RoleEnum } from '../../enum';

@Injectable()
export class TokenService {
  private ACCESS_EXPIRES_IN: number;
  private REFRESH_EXPIRES_IN: number;
  private System_REFRESH_TOKEN_SECURITY_KEY: string;
  private System_TOKEN_SECURITY_KEY: string;
  private User_REFRESH_TOKEN_SECURITY_KEY: string;
  private User_TOKEN_SECURITY_KEY: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: CacheService,
    private readonly userRepository: UserRepository,
  ) {
    this.ACCESS_EXPIRES_IN = Number(
      this.configService.get('ACCESS_EXPIRES_IN'),
    );
    this.REFRESH_EXPIRES_IN = Number(
      this.configService.get('REFRESH_EXPIRES_IN'),
    );
    this.System_REFRESH_TOKEN_SECURITY_KEY = this.configService.get(
      'System_REFRESH_TOKEN_SECURITY_KEY',
    ) as string;
    this.System_TOKEN_SECURITY_KEY = this.configService.get(
      'System_TOKEN_SECURITY_KEY',
    ) as string;
    this.User_REFRESH_TOKEN_SECURITY_KEY = this.configService.get(
      'User_REFRESH_TOKEN_SECURITY_KEY',
    ) as string;
    this.User_TOKEN_SECURITY_KEY = this.configService.get(
      'User_TOKEN_SECURITY_KEY',
    ) as string;
  }

  async sign({
    payload,
    secret = this.User_TOKEN_SECURITY_KEY,
    options,
  }: {
    payload: object;
    secret?: string;
    options?: SignOptions;
  }): Promise<string> {
    
    return await this.jwtService.signAsync(payload, {
      secret,
      ...options,
    });
  }

  async verify({
    token,
    secret = this.User_TOKEN_SECURITY_KEY,
  }: {
    token: string;
    secret?: string;
  }): Promise<JwtPayload> {
    return (await this.jwtService.verifyAsync(token, {
      secret,
    })) as JwtPayload;
  }

  async getTokenSignature({
    tokenType = TokenTypeEnum.access,
    level,
  }: {
    tokenType: TokenTypeEnum;
    level: RoleEnum;
  }): Promise<string> {
    const { accessSignature, refreshSignature } =
      await this.getTokenSignatureLevel(level);

    let signature;
    switch (tokenType) {
      case TokenTypeEnum.refresh:
        signature = refreshSignature;
        break;
      default:
        signature = accessSignature;
        break;
    }
    return signature;
  }

  async getTokenSignatureLevel(
    level: RoleEnum,
  ): Promise<{ accessSignature: string; refreshSignature: string }> {
    let signatureLevel;
    switch (level) {
      case RoleEnum.ADMIN:
        signatureLevel = {
          accessSignature: this.System_TOKEN_SECURITY_KEY,
          refreshSignature: this.System_REFRESH_TOKEN_SECURITY_KEY,
        };
        break;
      default:
        signatureLevel = {
          accessSignature: this.User_TOKEN_SECURITY_KEY,
          refreshSignature: this.User_REFRESH_TOKEN_SECURITY_KEY,
        };
        break;
    }
    return signatureLevel;
  }

  async decodeToken({
    token,
    tokenType = TokenTypeEnum.access,
  }: {
    token: string;
    tokenType?: TokenTypeEnum;
  }): Promise<{ user: HydratedDocument<IUser>; decoded: JwtPayload }> {
    // ✅ بدل jsonwebtoken
    const decoded = this.jwtService.decode(token) as JwtPayload;

    if (!decoded || !decoded.aud) {
      throw new BadRequestException(
        'Fail to decode this token aud is required',
      );
    }

    // ✅ fix aud
    if (!Array.isArray(decoded.aud)) {
      throw new BadRequestException('Invalid audience format');
    }

    const [tokenApproach, level] = decoded.aud;

    if (tokenType !== (tokenApproach as unknown as TokenTypeEnum)) {
      throw new BadRequestException(
        `Invalid Token Type ${tokenType}`,
      );
    }

    if (
      decoded.jti &&
      (await this.redisService.get(
        this.redisService.revokeTokenKey({
          userId: decoded.sub as string,
          jti: decoded.jti,
        }),
      ))
    ) {
      throw new UnauthorizedException('Invalid Login Session ❌');
    }

    const secret = await this.getTokenSignature({
      tokenType: tokenApproach as unknown as TokenTypeEnum,
      level: level as unknown as RoleEnum,
    });

    // ✅ أهم تعديل هنا
    let verifiedData: JwtPayload;
    try {
      verifiedData = await this.jwtService.verifyAsync(token, {
        secret,
      });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired ❌');
      }
      throw new UnauthorizedException('Invalid token ❌');
    }

    const user = await this.userRepository.findOne({
      filter: { _id: verifiedData.sub as string },
    });

    if (!user) {
      throw new UnauthorizedException('Not Register Account!');
    }

    if (
      user.changeCredentialTime &&
      user.changeCredentialTime?.getTime() >=
        (decoded.iat as number) * 1000
    ) {
      throw new UnauthorizedException('Invalid Login Session ❌');
    }

    return { user, decoded };
  }

  async createLoginCredentials(
    user: HydratedDocument<IUser>,
    issuer: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const { accessSignature, refreshSignature } =
      await this.getTokenSignatureLevel(user.role as RoleEnum);

    const jwtId = randomUUID();

    const access_token = await this.sign({
      payload: { sub: user._id.toString() },
      secret: accessSignature,
      options: {
        issuer,
        audience: [TokenTypeEnum.access, user.role] as unknown as string[],
        expiresIn: this.ACCESS_EXPIRES_IN,
        jwtid: jwtId,
      },
    });

    const refresh_token = await this.sign({
      payload: { sub: user._id.toString() },
      secret: refreshSignature,
      options: {
        issuer,
        audience: [TokenTypeEnum.refresh, user.role] as unknown as string[],
        expiresIn: this.REFRESH_EXPIRES_IN,
        jwtid: jwtId,
      },
    });

    return { access_token, refresh_token };
  }
}