import { GenderEnum, LangEnum, RoleEnum } from '../enum';
export interface IUser {
  lang: LangEnum ;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  DOB?: Date;
  confirmedAt?: Date;
  gender?: GenderEnum;
  role?: RoleEnum;
  phone?: string;
  profileImage?: string;
  coverImages?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  changeCredentialTime?: Date;
  confirmEmail?: Date;
  provider?: number;
  deletedAt?: Date;
  restoredAt?: Date;
}
