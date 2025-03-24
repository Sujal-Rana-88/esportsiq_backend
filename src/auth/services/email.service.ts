import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  async sendResetEmail(email: string, resetLink: string) {
    const mailOptions = {
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      text: `Click this link to reset your password: ${resetLink}`,
      html: `<p>You requested a password reset. Click the link below:</p><a href="${resetLink}">${resetLink}</a>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email Sent:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new Error('Failed to send reset email');
    }
  }

  async sendVerifyEmail(email: string, verifyLink: string) {
    const mailOptions = {
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Email Verification Request',
      text: `Click this link to verify your email: ${verifyLink}`,
      html: `<p>You requested a email verification. Click the link below:</p><a href="${verifyLink}">${verifyLink}</a>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email Sent:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new Error('Failed to send reset email');
    }
  }
}
