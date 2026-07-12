import { Injectable } from '@nestjs/common';
import { ICvAnalysis } from 'src/common/interface';

@Injectable()
export class AiService {
  async analyzeCv(text: string): Promise<ICvAnalysis> {
    // هنربطها بـ OpenAI / Gemini بعدين
    // TODO:
    // 1- Send text to AI Provider
    // 2- Parse response
    // 3- Return ICvAnalysis


    return {
      summary: '',
      score: 0,

      skills: [],
      experience: [],
      education: [],
      languages: [],

      strengths: [],
      weaknesses: [],
      recommendations: [],
    };
  }
}