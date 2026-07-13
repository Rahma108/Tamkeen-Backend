import { BadRequestException, Injectable, NotFoundException, Delete, Param } from '@nestjs/common';
import { CreateCvDto, CreateUploadUrlDto } from './dto/create-cv.dto';
import { UpdateCvDto, UpdateCvFileDto } from './dto/update-cv.dto';
import { HCvDocument, HUserDocument} from 'src/common/model';
import { UploadUrlEntity } from './entities/cv.entity';
import { S3Service } from 'src/common/utils/service';
import { Translator } from 'src/common/i18n/translator';
import { LangEnum } from 'src/common/enum';
import { AiService } from '../ai/ai.service';
import { PdfService } from '../pdf/pdf.service';
import { CvRepository } from 'src/common/repository';
import { CVStatusEnum } from 'src/common/enum/cv.enum';
import { IResponse } from 'src/common/interface/response.interface';
import { Types } from 'mongoose';
import { IAuthReq } from 'src/common/interface/auth.interface';

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
    async findAll(
      user: HUserDocument,
      lang : LangEnum
    ): Promise<IResponse<HCvDocument[]>> {
      const cvs = await this.cvRepository.find({
        filter: {
          createdBy: user._id,
          deletedAt: null,
        },
      });

      return {
        message: Translator.cv('GET_ALL_SUCCESS', lang),
        data: cvs,
      };
    }
    // GET    /cv/:id             // Get one CV
        async findOne(
      id: Types.ObjectId,
      user: HUserDocument,
      lang: LangEnum,
    ): Promise<IResponse<HCvDocument>> {
      const cv = await this.cvRepository.findOne({
        filter: {
          _id: id,
          createdBy: user._id,
        },
      });

      if (!cv) {
        throw new NotFoundException(
          Translator.cv('CV_NOT_FOUND', lang),
        );
      }

      return {
        message: Translator.cv('GET_ONE_SUCCESS', lang),
        data: cv,
      };
    }

    // PATCH  /cv/:id             // Update
    async update(
        id: Types.ObjectId,
        dto: UpdateCvDto,
        user: HUserDocument,
        lang: LangEnum,
      ): Promise<IResponse<HCvDocument>> {
        const cv = await this.cvRepository.findOne({
          filter: {
            _id: id,
            createdBy: user._id,
          },
        });

        if (!cv) {
          throw new NotFoundException(
            Translator.cv('CV_NOT_FOUND', lang),
          );
        }

        Object.assign(cv, dto);

        await cv.save();

        return {
          message: Translator.cv('CV_UPDATED_SUCCESSFULLY', lang),
          data: cv,
        };
      }


    async updateFile(
    id: Types.ObjectId,
    dto: UpdateCvFileDto,
    user: HUserDocument,
    lang: LangEnum,
  ): Promise<IResponse<HCvDocument>> {

    const cv = await this.cvRepository.findOne({
      filter: {
        _id: id,
        userId: user._id,
      },
    });

    if (!cv) {
      throw new NotFoundException(
        Translator.cv('CV_NOT_FOUND', lang),
      );
    }

    // حذف الملف القديم
    await this.s3Service.deleteAssets({
      Keys: [
        {
          Key: cv.s3Key,
        },
      ],
    });

    // تحميل الملف الجديد
    const file = await this.s3Service.getAsset({
      Key: dto.key,
    });

    const pdfBuffer = Buffer.from(
      await file.Body!.transformToByteArray(),
    );

    // استخراج النص
    const rawText = await this.pdfService.extractText(pdfBuffer);

    // تحليل الـ AI
    const analysis = await this.aiService.analyzeCv(rawText);

    // تحديث البيانات
    cv.title = dto.title ?? cv.title;
    cv.originalName = dto.key.split('/').pop()!;
    cv.s3Key = dto.key;
    cv.rawText = rawText;
    cv.size = file.ContentLength ?? 0;
    cv.mimeType = file.ContentType ?? 'application/pdf';
    cv.analysis = analysis;
    cv.atsScore = analysis.score;
    cv.processedAt = new Date();

  await cv.save();

  return {
    message: Translator.cv('CV_UPDATED_SUCCESSFULLY', lang),
    data: cv,
  };
}

    // DELETE /cv/:id             // Delete

    async remove(
        id: Types.ObjectId,
        user: HUserDocument,
        lang: LangEnum,
      ): Promise<IResponse<null>> {
        const cv = await this.cvRepository.findOne({
          filter: {
            _id: id,
            userId: user._id,
          },
        });

        if (!cv) {
          throw new NotFoundException(
            Translator.cv('CV_NOT_FOUND', lang),
          );
        }

        // حذف ملف الـ PDF من S3
        await this.s3Service.deleteAssets({
          Keys: [
            {
              Key: cv.s3Key,
            },
          ],
        });

        // حذف الـ CV من قاعدة البيانات
        await this.cvRepository.deleteOne({
          filter: {
            _id: id,
            userId: user._id,
          },
        });

        return {
          message: Translator.cv('CV_DELETED_SUCCESSFULLY', lang),
          data: null,
        };
      }
    


}
