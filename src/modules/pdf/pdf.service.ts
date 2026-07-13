import { Injectable, BadRequestException } from '@nestjs/common';
import pdfParse from 'pdf-parse'

@Injectable()
export class PdfService {
  async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);

      if (!data.text.trim()) {
        throw new BadRequestException('PDF is empty');
      }

      return data.text;
    } catch(error) {
      console.error('PDF extraction error:', error);
      throw new BadRequestException('Failed to extract PDF text');
    }
  }
}