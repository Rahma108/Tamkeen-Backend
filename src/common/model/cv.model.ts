import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ICv, ICvAnalysis, IEducation, IExperience } from 'src/common/interface';
import { CVStatusEnum } from '../enum/cv.enum';

export type HCvDocument = HydratedDocument<ICv>;

// AI (OpenAI / Gemini / Claude)

@Schema({ _id: false })
export class Experience implements IExperience {

      @Prop({
      type: String,
      default: "",
      trim: true,
    })
  company!: string;

    @Prop({
    type: String,
    default: "",
    trim: true,
  })
  position!: string;

    @Prop({
    type: String,
    default: "",
    trim: true,
  })
  duration!: string;

  @Prop({
  type: String,
  default: "",
  trim: true,
})
  description!: string;
}

export const ExperienceSchema =SchemaFactory.createForClass(Experience);
  @Schema({ _id: false })
export class Education implements IEducation {

    @Prop({
    type: String,
    default: "",
    trim: true,
  })
    university!: string;

    @Prop({
    type: String,
    default: "",
    trim: true,
  })
    degree!: string;

    @Prop({
    type: String,
    default: "",
    trim: true,
  })
    graduationYear!: string;
}

export const EducationSchema = SchemaFactory.createForClass(Education);


@Schema({ _id: false })
export class CvAnalysis implements ICvAnalysis {
    @Prop({ type: [String], default: [] })
    recommendations!: string[];
    @Prop({ type: [String], default: [] })
    strengths!: string[];
    @Prop({ type: [String], default: [] })
    weaknesses!: string[];


  @Prop({ default: '' })
  summary!: string;

  @Prop({ default: 0 })
  score!: number;

  @Prop({ type: [String], default: [] })
  skills!: string[];

  @Prop({
    type: [ExperienceSchema],
    default: [],
  })
  experience!: Experience[];

  @Prop({
    type: [EducationSchema],
    default: [],
  })
  education!: Education[];

  @Prop({ type: [String], default: [] })
  languages!: string[];
}

const CvAnalysisSchema = SchemaFactory.createForClass(CvAnalysis);


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
  @Prop({ type: String, required: true , trim: true  })
  originalName!: string;
  @Prop({ type: String, required: true  , trim: true })
  title! :string;
  @Prop({ type: String, required: true , unique: true })
  s3Key!: string;


  @Prop({ type: String, required: true })
  rawText!: string;
  @Prop({ type: Number, required: true })
  size!: number;
  @Prop({ type: String, required: true , trim: true })
  mimeType!: string;

  // AI 
  @Prop({
    type: CvAnalysisSchema,
    default: {},
  })
  analysis!: CvAnalysis;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  })
  atsScore!: number;

  @Prop({
  type: Date,
})
  processedAt?: Date;

  @Prop({
  type: String,
  trim: true,
})
  error?: string;

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
