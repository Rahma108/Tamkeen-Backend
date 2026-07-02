import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { JobModule } from './modules/job/job.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { AnswersModule } from './modules/answers/answers.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath : [".env.development" , ".env.production"],
      isGlobal: true 

    }) ,
    AuthModule ,
    UserModule,
    JobModule,
    QuestionsModule ,
    AnswersModule
  ],
  controllers: [AppController ],
  providers: [AppService],
})
export class AppModule {}
