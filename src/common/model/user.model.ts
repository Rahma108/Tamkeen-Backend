import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GenderEnum, LangEnum, ProviderEnum, RoleEnum } from 'src/common/enum';
import { IUser } from 'src/common/interface';

export type HUserDocument = HydratedDocument<IUser>;
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strict: true,
  strictQuery: true,
})
export class User implements IUser {
  @Virtual({
    set: function (this: HUserDocument, value: string) {
      const [firstName, lastName] = value.split(' ') || [];
      this.set({ firstName, lastName });
    },
    get: function (this: HUserDocument) {
      return `${this.firstName} ${this.lastName}`;
    },
  })
  username!: string;

  @Prop({ type: String, enum : LangEnum , default: LangEnum.En })
  lang!: LangEnum ;
  @Prop({ type: String, required: true })
  firstName!: string;
  @Prop({ type: String, required: true })
  lastName!: string;
  @Prop({ type: String, required: true, unique: true })
  email!: string;
  @Prop({ type: String, required: function(this:HUserDocument){
    return this.provider == ProviderEnum.SYSTEM
  }})
  password!: string;
  @Prop({ type: String, required: false })
  phone?: string;
  @Prop({ type: String, required: false })
  profileImage?: string;
  @Prop({ type: [], required: false })
  // friends:[{type : Types.ObjectId , ref :"User"}],
  @Prop({ type: Date, required: false })
  DOB?: Date;
  @Prop({ type: Date, required: false })
  confirmedAt?: Date;
  @Prop({ type: Number, enum: GenderEnum, default: GenderEnum.MALE })
  gender!: GenderEnum;
  @Prop({ type: Number, enum: RoleEnum, default: RoleEnum.USER })
  role!: RoleEnum;
  @Prop({ type: Date, required: false })
  changeCredentialTime?: Date;
  @Prop({ type: Date, required: false })
  confirmEmail?: Date;
  @Prop({ type: Number, enum: ProviderEnum, default: ProviderEnum.SYSTEM })
  provider!: ProviderEnum;
  @Prop({ type: Date, required: false })
  deletedAt?: Date;
  @Prop({ type: Date, required: false })
  restoredAt?: Date;
}

export const userMongooseSchema = SchemaFactory.createForClass(User);
export const UserModel = MongooseModule.forFeatureAsync([
  {
    name: User.name,

    useFactory: () => {
      userMongooseSchema.pre(["find", "findOne"], function () {

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
      userMongooseSchema.pre(["updateOne", "findOneAndUpdate"], function () {

        const update = this.getUpdate() as HydratedDocument<IUser>;

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

      userMongooseSchema.pre(["deleteOne", "findOneAndDelete"], function () {

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

    return userMongooseSchema;
    },
  },
]);
