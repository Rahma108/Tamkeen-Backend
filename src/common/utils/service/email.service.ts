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

  emailTemplate = ({
  code,
  title = "Verify Account"
}: {
  code: number;
  title?: string;
  logoUrl?: string;
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
</head>

<body style="margin:0;padding:30px;background:#EEF1F7;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellspacing="0" cellpadding="0">
<tr>
<td align="center">

<table width="650" cellspacing="0" cellpadding="0"
style="background:#1B1646;border-radius:28px;overflow:hidden;">

<!-- HEADER -->
<tr>
<td align="center" style="padding:45px 20px 25px;">

<img
src="https://raw.githubusercontent.com/Rahma108/Tamkeen-Backend/main/public/logo.png"
alt="Tamkeen Logo"
style="
display:block;
width:320px;
max-width:90%;
height:auto;
margin:0 auto;">

<div style="
margin-top:15px;
color:#27F2B1;
font-size:24px;
font-weight:bold;">
Your Journey Starts Here
</div>

</td>
</tr>

<!-- CARD -->
<tr>
<td style="padding:0 35px 40px;">

<table width="100%"
cellspacing="0"
cellpadding="0"
style="
background:#ffffff;
border-radius:28px;">

<tr>

<td align="center"
style="padding:55px 45px;">

<h1 style="
margin:0;
font-size:50px;
color:#1B1646;
font-weight:bold;">
${title}
</h1>

<p style="
margin:28px 0 10px;
font-size:20px;
color:#555;
line-height:32px;">

Use the following verification code to complete your request.

</p>

<p style="
margin:0 0 45px;
font-size:20px;
color:#555;">

This code is valid for
<strong>2 minutes</strong>.

</p>

<table
cellspacing="0"
cellpadding="0"
style="
background:#1B1646;
border-radius:20px;">

<tr>

<td
style="
padding:25px 55px;
font-size:58px;
font-weight:bold;
letter-spacing:16px;
color:#22F3AA;">

${code}

</td>

</tr>

</table>

<div
style="
margin-top:40px;
background:#F1FFFA;
padding:22px;
border-radius:16px;
font-size:18px;
color:#444;">

🔒 Never share this verification code with anyone.

</div>

</td>

</tr>

</table>

</td>

</tr>

<!-- FOOTER -->

<tr>

<td align="center"
style="padding:35px;">

<div
style="
font-size:38px;
font-weight:bold;
color:#20F2A7;">

TAMKEEN

</div>

<div
style="
margin-top:12px;
font-size:18px;
color:#E0E0E0;">

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
