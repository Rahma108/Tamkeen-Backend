import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

@Injectable()
export class EncryptionSecurity {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly ivLength: number;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.getOrThrow<string>('SECURITY_KEY');

    this.key = crypto.createHash('sha256').update(secret).digest();
    this.ivLength = parseInt(
      this.configService.get<string>('IV_LENGTH') ?? '16',
      10,
    );

    if (isNaN(this.ivLength) || this.ivLength <= 0) {
      this.ivLength = 16;
    }
  }
  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);

    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.key,
      iv,
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(data: string): string {
    const parts = data.split(':');

    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format ❌');
    }

    const iv = Buffer.from(parts[0], 'hex');

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      iv,
    );

    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}