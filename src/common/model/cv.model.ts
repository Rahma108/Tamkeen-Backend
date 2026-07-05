import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GenderEnum, LangEnum, ProviderEnum, RoleEnum } from 'src/common/enum';
import { ICv } from 'src/common/interface';
import { CVStatusEnum } from '../enum/cv.enum';

export type HCvDocument = HydratedDocument<ICv>;
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strict: true,
  strictQuery: true,
})
export class Cv implements ICv {
  @Prop({type : Types.ObjectId , ref:'User' , required: true })
  userId!: Types.ObjectId;
  @Prop({ type: String, enum : CVStatusEnum, default: CVStatusEnum.PROCESSING})
  status!: CVStatusEnum ;
  @Prop({ type: String, required: true })
  originalName!: string;
  @Prop({ type: String, required: true })
  title! :string;
  @Prop({ type: String, required: true })
  s3Key!: string;
  @Prop({ type: String, required: true })
  url !: string;

  @Prop({ type: String, required: true })
  rawText!: string;
  @Prop({ type: Number, required: true })
  size!: number;
  @Prop({ type: String, required: true })
  mimeType!: string;
  @Prop({ type: Date, required: false })
  createdAt?: Date ;
  @Prop({ type: Date, required: false })
  updatedAt?: Date;
  @Prop({ type: Date, required: false })
  deletedAt?: Date;
  @Prop({ type: Date, required: false })
  restoredAt?: Date;
}

export const CvMongooseSchema = SchemaFactory.createForClass(Cv);
export const CvModel = MongooseModule.forFeatureAsync([
  {
    name: Cv.name,

    useFactory: () => {
      CvMongooseSchema.pre(["find", "findOne"], function () {

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
      CvMongooseSchema.pre(["updateOne", "findOneAndUpdate"], function () {

        const update = this.getUpdate() as HydratedDocument<ICv>;

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

      CvMongooseSchema.pre(["deleteOne", "findOneAndDelete"], function () {

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

    return CvMongooseSchema;
    },
  },
]);
