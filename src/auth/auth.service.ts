import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
  constructor(private readonly dbService: DatabaseService) {}

  async register(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    profilePictureUrl: string,
  ) {
    if (!firstName || !lastName || !username || !email || !password) {
      throw new BadRequestException('All fields are required');
    }

    // *** checking for duplicated username and email ***
    const existingUserWithSameUsername = await this.dbService.executeQuery(
      `SELECT * FROM users WHERE username = ? `,
      [username],
    );

    const existingUserWithSameEmail = await this.dbService.executeQuery(
      `SELECT * FROM users WHERE email = ?`,
      [email],
    );

    if (existingUserWithSameUsername.length > 0) {
      throw new BadRequestException('Username already exists');
    }
    if (existingUserWithSameEmail.length > 0) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const tokenExpiresAt = new Date();
    const refreshToken = crypto.randomBytes(32).toString('hex');

    await this.dbService.executeQuery(
      `INSERT INTO users (userId, firstName, lastName, username, email, password, refreshToken, tokenExpiresAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
        refreshToken,
        tokenExpiresAt,
      ],
    );

    return {
      userId,
      firstName,
      lastName,
      username,
      email,
      refreshToken,
      tokenExpiresAt,
    };
  }

  async validateUser(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Username/Email and Password are required');
    }

    const users = await this.dbService.executeQuery(
      `SELECT * FROM users WHERE email = ?`,
      [email],
    );

    if (users.length === 0) {
      throw new NotFoundException('User not found');
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30);

    const refreshToken = crypto.randomBytes(32).toString('hex');

    await this.dbService.executeQuery(
      `UPDATE users SET refreshToken = ?, tokenExpiresAt = ? WHERE userId = ?`,
      [refreshToken, tokenExpiresAt, user.userId],
    );

    return {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      refreshToken,
      tokenExpiresAt,
    };
  }

  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const users = await this.dbService.executeQuery(
      `SELECT * FROM users WHERE email = ?`,
      [email],
    );

    if (users.length === 0) {
      throw new NotFoundException('User not found');
    }

    const user = users[0];

    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpiry = new Date();
    passwordResetExpiry.setHours(passwordResetExpiry.getHours() + 1);

    await this.dbService.executeQuery(
      `UPDATE users SET passwordResetToken = ?, passwordResetExpiry = ? WHERE userId = ?`,
      [passwordResetToken, passwordResetExpiry, user.userId],
    );

    const resetLink = `https://localhost:3000/reset-password?token=${passwordResetToken}`;

    // Send email
    await this.sendResetEmail(user.email, resetLink);

    return { message: 'Password reset link has been sent to your email.' };
  }

  private async sendResetEmail(email: string, resetLink: string) {
    const transporter = nodemailer.createTransport({
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

    // Load and compile Handlebars template
    const templatePath = path.join(
      __dirname,
      '../templates/reset-password.hbs',
    );
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);
    const htmlContent = template({ resetLink }); // Only injecting resetLink

    // Define mail options correctly
    const mailOptions = {
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link: ${resetLink}`,
      html: htmlContent, // ✅ Now using Handlebars-generated HTML
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email Sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new Error('Failed to send reset email');
    }
  }

  async resetPassword(password: string, token: string) {
    if (!token || !password) {
      throw new BadRequestException('Token and new password are required.');
    }

    try {
      // Retrieve user with the given password reset token
      const users = await this.dbService.executeQuery(
        `SELECT * FROM users WHERE passwordResetToken = ?`,
        [token],
      );

      if (users.length === 0) {
        throw new NotFoundException('Invalid or expired token.');
      }

      const user = users[0];

      // Check if the reset token has expired
      const currentTime = new Date();
      if (new Date(user.passwordResetExpiry) < currentTime) {
        throw new BadRequestException('Password reset token has expired.');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password and clear the reset token
      await this.dbService.executeQuery(
        `UPDATE users SET password = ?, passwordResetToken = NULL, passwordResetExpiry = NULL WHERE userId = ?`,
        [hashedPassword, user.userId],
      );

      return {
        success: true,
        message: 'Password has been reset successfully.',
      };
    } catch (error) {
      console.error('Error resetting password:', error.message);
      throw new BadRequestException(error.message || 'Password reset failed.');
    }
  }
}
