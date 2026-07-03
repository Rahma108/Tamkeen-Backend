import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService, EncryptionSecurity, SecurityService } from 'src/common/utils/service';
import { defaultLanguage } from 'src/common/middleware';
@Module({
  imports: [],
  exports:[
    EncryptionSecurity,
    EmailService ,
    SecurityService],
  controllers: [AuthController],
  providers: [
    AuthService,
    EncryptionSecurity,
    EmailService ,
    SecurityService
  ],
})
export class AuthModule {
   configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(defaultLanguage )
        .forRoutes(AuthController);
    }
}
