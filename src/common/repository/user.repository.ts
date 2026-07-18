import { InjectModel } from '@nestjs/mongoose';
import { IUser } from '../../common/interface';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { User } from '../model';
import { BaseRepository } from './base.repository';
@Injectable()
export class UserRepository extends BaseRepository<IUser> {
  constructor(@InjectModel(User.name) protected readonly model: Model<IUser>) {
    super(model);
  }
}