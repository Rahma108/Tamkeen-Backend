import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { S3Service } from 'src/common/utils/service';
import { AiModule } from '../ai/ai.module';
import { PdfModule } from '../pdf/pdf.module';
import { CvRepository } from 'src/common/repository';
import { CvModel } from 'src/common/model/cv.model';

@Module({
   imports: [
    PdfModule,
    AiModule,
    CvModel
  ],
  exports: [
    CvRepository,
  ],
  controllers: [CvController],
  providers: [CvService , S3Service , CvRepository],
})
export class CvModule {}