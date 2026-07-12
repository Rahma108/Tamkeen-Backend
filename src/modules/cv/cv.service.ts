import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCvDto, CreateUploadUrlDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { HUserDocument } from 'src/common/model';
import { UploadUrlEntity } from './entities/cv.entity';
import { S3Service } from 'src/common/utils/service';
import { Translator } from 'src/common/i18n/translator';
import { LangEnum } from 'src/common/enum';
import { AiService } from '../ai/ai.service';
import { PdfService } from '../pdf/pdf.service';
import { CvRepository } from 'src/common/repository';
import { CVStatusEnum } from 'src/common/enum/cv.enum';

@Injectable()
export class CvService {
   constructor(
  private readonly pdfService: PdfService,
  private readonly aiService: AiService,
  private readonly s3Service: S3Service,
  private readonly cvRepository: CvRepository
) {}
    // POST /cvs/upload-url   إنشاء رابط رفع آمن وkey.
    // Pre-signed PUT URL
   
    async createUploadUrl(
        body: CreateUploadUrlDto,
        user: HUserDocument,
        lang : LangEnum
      ): Promise<UploadUrlEntity> {

        if (body.contentType !== 'application/pdf') {
          throw new BadRequestException(Translator.cv("INVALID_FILE_TYPE" , lang))
        }

        const key = this.s3Service.generateKey({
          folder :"cvs" ,
          userId:user._id.toString() ,
          originalName: body.fileName

        })

        const { url } = await this.s3Service.createPreSignedUploadLink({
          Key: key,
          ContentType: body.contentType,
        });

        return {
          uploadUrl: url,
          key,
        };
      }
    //    POST   /cvs                // Process PDF + Save DB
    async create(
        body: CreateCvDto,
        user: HUserDocument,
        lang: LangEnum,
    ) {

      // 1- Download PDF from S3
      const file = await this.s3Service.getAsset({
          Key: body.key,
      });
      const pdfBuffer = Buffer.from(
        await file.Body!.transformToByteArray(),
    );
      // 2- Extract Text
      const rawText = await this.pdfService.extractText(pdfBuffer);

      // 3- AI Analysis
      const analysis = await this.aiService.analyzeCv(rawText);

      // 4- Save Database

    const cv = await this.cvRepository.create({ 
    data: {
        userId: user._id,

        title: body.title,

        originalName: body.key.split("/").pop(),

        s3Key: body.key,

        rawText,

        size: file.ContentLength ?? 0,

        mimeType: file.ContentType ?? "application/pdf",

        status: CVStatusEnum.COMPLETED,

        analysis,

        atsScore: analysis.score,

        processedAt: new Date(),
      } });
      return cv


    }

    // GET    /cv                 // Get all CVs

    // GET    /cv/:id             // Get one CV

    // PATCH  /cv/:id             // Update

    // DELETE /cv/:id             // Delete
    


}
