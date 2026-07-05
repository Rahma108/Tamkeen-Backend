import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCvDto, CreateUploadUrlDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { HUserDocument } from 'src/common/model';
import { UploadUrlEntity } from './entities/cv.entity';
import { S3Service } from 'src/common/utils/service';
import { Translator } from 'src/common/i18n/translator';
import { LangEnum } from 'src/common/enum';

@Injectable()
export class CvService {
      constructor(
    private readonly s3Service: S3Service,
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






    // POST /cvs             لتحقق من الملف، استخراج النص، إنشاء سجل الـ CV

    // GET /cv

    // GET /cv/:id

    // PATCH /cv/:id

    // DELETE /cv/:id
  create(createCvDto: CreateCvDto) {
    return 'This action adds a new cv';
  }

  findAll() {
    return `This action returns all cv`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cv`;
  }

  update(id: number, updateCvDto: UpdateCvDto) {
    return `This action updates a #${id} cv`;
  }

  remove(id: number) {
    return `This action removes a #${id} cv`;
  }
}
