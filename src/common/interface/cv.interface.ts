import { Types } from "mongoose"
import { CVStatusEnum } from "../enum/cv.enum";

export interface IExperience {
    company: string;
    position: string;
    duration: string;
    description: string;
}

export interface IEducation {
    university: string;
    degree: string;
    graduationYear: string;
}


export interface ICv  {
    userId: Types.ObjectId;
    title :string;
    originalName:string;

    s3Key: string;
    rawText: string;
    size: number;
    mimeType: string;
    status: CVStatusEnum;

    analysis: ICvAnalysis;

    atsScore: number;

    processedAt?: Date;

    error?: string;


    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    restoredAt?: Date;
}

export interface ICvAnalysis {
    summary: string;

    score: number;

    skills: string[];

    experience: IExperience[];

    education: IEducation[];

    languages: string[];

    strengths: string[];

    weaknesses: string[];

    recommendations: string[];
}