import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PreAuthMiddleware } from 'src/common/middleware/authentication.middleware';
import { EncryptionSecurity, S3Service, SecurityService } from 'src/common/utils/service';
import { UserModel } from 'src/common/model/index';

@Module({
  imports: [
    UserModel
  ],
  exports: [],
  controllers: [UserController],
  providers: [UserService, S3Service, SecurityService, EncryptionSecurity]
})
export class UserModule {
    configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PreAuthMiddleware)
      .forRoutes(UserController);
  }
}
