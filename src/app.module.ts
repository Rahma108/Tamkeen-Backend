import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { JobModule } from './modules/job/job.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { AnswersModule } from './modules/answers/answers.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedAuthenticationModule } from './common/modules';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath : [".env.development" , ".env.production"],
      isGlobal: true 

    }) ,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DB_URI'),
        connectionFactory: (connection) => {
          console.log('MongoDB Connected 😊');
          return connection;
        },
      }),
    }),
    CacheModule.register({
      ttl : 10000 , 
      isGlobal: true 
    }),
    SharedAuthenticationModule ,
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
