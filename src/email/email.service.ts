/* eslint-disable @typescript-eslint/dot-notation */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendEmail(to: string, subject: string, body: string, calendarObj) {
    console.log(this.configService.get<string>('EMAIL_USERNAME'));
    // Create a Nodemailer transporter object
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('EMAIL_USERNAME'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    // Define the email options
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USERNAME'),
      to,
      subject,
      html: body,
    };
    const alternatives = {
      'Content-Type': 'text/calendar',
      method: 'PUBLISH',
      // eslint-disable-next-line no-buffer-constructor
      content: new Buffer(calendarObj.toString()),
      component: 'VEVENT',
      'Content-Class': 'urn:content-classes:calendarmessage',
    };
    mailOptions['alternatives'] = alternatives;
    mailOptions['alternatives'].contentType = 'text/calendar';
    // eslint-disable-next-line no-buffer-constructor
    mailOptions['alternatives'].content = new Buffer(calendarObj.toString());

    // Send the email
    await transporter.sendMail(mailOptions);
  }
}
