import { Types } from "mongoose"
import { CVStatusEnum } from "../enum/cv.enum";

export interface ICv {
    userId: Types.ObjectId;
    title :string;
    originalName:string;

    s3Key: string;
    url: string;
    rawText: string;
    size: number;
    mimeType: string;
    status: CVStatusEnum;


    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    restoredAt?: Date;
}
