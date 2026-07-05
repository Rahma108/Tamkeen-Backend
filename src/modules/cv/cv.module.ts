import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { S3Service } from 'src/common/utils/service';

@Module({
  controllers: [CvController],
  providers: [CvService , S3Service],
})
export class CvModule {}