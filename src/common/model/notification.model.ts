import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { INotification } from 'src/common/interface';
import { NotificationType } from '../enum/notification.enum';

export type HNotificationDocument = HydratedDocument<INotification>;


@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strict: true,
  strictQuery: true,
})
export class Notification implements INotification {
        @Prop({
            type: Types.ObjectId,
            ref: "User",
            required: true,
        })
        userId!: Types.ObjectId;

        @Prop({
            enum: NotificationType,
            required: true,
        })
        type!: NotificationType;

        @Prop({ type : String ,required: true })
        title!: string;

        @Prop({ type : String ,required: true })
        body!: string;

        @Prop({ default: false ,required: true })
        isRead!: boolean;

        @Prop( {type: Date , required: false  })
        readAt?: Date;

        @Prop( {type: Date , required: false  })
        image?: string;

        @Prop({ type: Object })
        data?: Record<string, any>;
        
        @Prop({ type: Date , required: false  })
        createdAt? : Date ;
        @Prop({ type: Date, required: false })
        updatedAt? : Date ;
        @Prop({ type: Date, required: false })
        deletedAt?: Date;
        @Prop({ type: Date, required: false })
        restoredAt?: Date;

}

export const NotificationMongooseSchema = SchemaFactory.createForClass(Notification);
export const NotificationModel = MongooseModule.forFeatureAsync([
  {
    name: Notification.name,

    useFactory: () => {
      NotificationMongooseSchema.pre(["find", "findOne"], function () {

        if (this.getQuery().paranoid == false) {
          this.setQuery({
            ...this.getQuery(),
          });
        } else {
          this.setQuery({
            ...this.getQuery(),
            deletedAt: { $exists: false }
          });
        }

      });
      NotificationMongooseSchema.pre(["updateOne", "findOneAndUpdate"], function () {

        const update = this.getUpdate() as HydratedDocument<INotification>;

        if (update.deletedAt) {
          this.getQuery().paranoid = true;

          this.setUpdate({
            ...this.getUpdate(),
            $unset: { restoredAt: 1 }
          });
        }

        if (update.restoredAt) {
          this.setQuery({
            ...this.getQuery(),
            paranoid: false,
            deletedAt: { $exists: true }
          });
        }

    });

      NotificationMongooseSchema.pre(["deleteOne", "findOneAndDelete"], function () {

        if (this.getQuery().force == true ) {
  

          this.setQuery({
            ...this.getQuery(),
          });
        }else{
          this.setQuery({
            ...this.getQuery(),
            deletedAt: { $exists: true }
          });
        }

    });

    return NotificationMongooseSchema;
    },
  },
]);
