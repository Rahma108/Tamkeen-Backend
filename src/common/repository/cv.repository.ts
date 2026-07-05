import { InjectModel } from '@nestjs/mongoose';
import { ICv } from '../interface';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Cv } from '../model';
import { BaseRepository } from './base.repository';
@Injectable()
export class CvRepository extends BaseRepository<ICv> {
  constructor(@InjectModel(Cv.name) protected readonly model: Model<ICv>) {
    super(model);
  }
}
