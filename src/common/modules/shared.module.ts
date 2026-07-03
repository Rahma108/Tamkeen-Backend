import { Global, Module } from "@nestjs/common";
import { UserRepository } from "../repository";

import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";

import { JwtService } from "@nestjs/jwt";
import { CacheService } from "../utils/service";
import { UserModel } from "../model";
import { TokenService } from "../utils/service/token.service";
@Global()
@Module({
  imports: [ UserModel],
  exports: ['REDIS_CLIENT' ,  
    UserRepository,
    JwtService,
    CacheService,
    TokenService,
],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          url: configService.get<string>('Redis_URI'),
        });

        client.on('error', (err) => console.error('Redis Client Error', err));
        await client.connect();
        console.log('✅ Redis connected');

        return client;
      },
      inject: [ConfigService],
    },
     UserRepository,
     JwtService,
    CacheService,
    TokenService,
    

  ],
})
export class SharedAuthenticationModule {
  
}