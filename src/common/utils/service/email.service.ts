import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';
@Injectable()
export class EmailService {
  private APPLICATION_NAME: string;
  private GMAIL: string;
  private PASSWORD: string;


  constructor(private readonly configService: ConfigService) {
    this.APPLICATION_NAME = this.configService.get<string>(
      'APPLICATION_NAME',
    ) as string;
    this.GMAIL = this.configService.get<string>('GMAIL') as string;
    this.PASSWORD = this.configService.get<string>('PASSWORD') as string;
    
  }

  async sendEmail({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments = [],
  }: MailOptions): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.GMAIL,
        pass: this.PASSWORD,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: `"${this.APPLICATION_NAME}📧" <${this.GMAIL}>`,
        to,
        cc,
        bcc,
        subject,
        html,
        attachments,
      });

      console.log('Message sent:', info.messageId);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

   emailTemplate = ({ code, title = "Verification Code" } : { code: number; title: string }) => {
      return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    </head>

    <body style="margin:0;padding:30px;background:#f3f4f8;font-family:Arial,Helvetica,sans-serif;">

    <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
    <td align="center">

    <table width="620" cellspacing="0" cellpadding="0"
    style="background:#1B1646;border-radius:22px;overflow:hidden;">

    <!-- Header -->
    <tr>
    <td align="center" style="padding:40px 30px 20px;">

    <img
    src="YOUR_LOGO_URL"
    width="170"
    alt="Tamkeen Logo"
    style="display:block;margin-bottom:20px;">

    </td>
    </tr>

    <!-- White Card -->
    <tr>
    <td style="padding:0 30px 40px;">

    <table width="100%" cellspacing="0" cellpadding="0"
    style="background:#ffffff;border-radius:24px;padding:40px;">

    <tr>
    <td align="center">

    <h1 style="
    margin:0;
    color:#1B1646;
    font-size:30px;
    font-weight:bold;">
    ${title}
    </h1>

    <p style="
    margin:18px 0 35px;
    font-size:16px;
    line-height:28px;
    color:#666;">
    Use the following verification code to complete your request.<br>
    This code is valid for <strong>10 minutes</strong>.
    </p>

    <!-- OTP -->
    <table cellspacing="0" cellpadding="0"
    style="margin:auto;background:#1B1646;border-radius:18px;">

    <tr>

    <td style="
    padding:18px 35px;
    font-size:42px;
    font-weight:bold;
    letter-spacing:14px;
    color:#19F2A4;">
    ${code}
    </td>

    </tr>

    </table>

    <p style="
    margin-top:35px;
    font-size:14px;
    color:#777;
    line-height:24px;">
    🔒 Never share this verification code with anyone.
    </p>

    </td>
    </tr>

    </table>

    </td>
    </tr>

    <!-- Footer -->
    <tr>
    <td align="center"
    style="
    padding:30px;
    color:#19F2A4;
    font-size:28px;
    font-weight:bold;">

    Tamkeen

    <div style="
    margin-top:8px;
    font-size:15px;
    font-weight:normal;
    color:#d6d6d6;">
    Your Journey Starts Here
    </div>

    </td>
    </tr>

    </table>

    </td>
    </tr>
    </table>

    </body>
    </html>
    `;
    };
}
