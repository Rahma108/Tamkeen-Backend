import { InjectModel } from '@nestjs/mongoose';
import { INotification } from '../../common/interface';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Notification } from '../model';
import { BaseRepository } from './base.repository';
@Injectable()
export class NotificationRepository extends BaseRepository<INotification> {
  constructor(@InjectModel(Notification.name) protected readonly model: Model<INotification>) {
    super(model);
  }
}