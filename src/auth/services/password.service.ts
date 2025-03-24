import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { EmailService } from './email.service';

@Injectable()
export class PasswordService {
  constructor(private readonly dbService: DatabaseService, private readonly emailService: EmailService) {}

  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
  
    const users = await this.dbService.executeQuery(
      `SELECT * FROM users WHERE email = ?`, 
      [email]
    );
  
    if (users.length === 0) {
      throw new NotFoundException('User not found');
    }
  
    const user = users[0];
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token expiry to **1 hour from now**
    const passwordResetExpiry = new Date();
    passwordResetExpiry.setHours(passwordResetExpiry.getHours() + 1);
  
    await this.dbService.executeQuery(
      `UPDATE users SET passwordResetToken = ?, passwordResetExpiry = ? WHERE userId = ?`,
      [passwordResetToken, passwordResetExpiry, user.userId]
    );
  
    const resetLink = `https://localhost:3000/reset-password?token=${passwordResetToken}`;
    await this.emailService.sendResetEmail(user.email, resetLink);
  
    return { message: 'Password reset link sent to email' };
  }
  

  async resetPassword(password: string, token: string) {
    if (!token || !password) {
      throw new BadRequestException('Token and new password are required.');
    }
  
    const users = await this.dbService.executeQuery(
      `SELECT * FROM users WHERE passwordResetToken = ?`, 
      [token]
    );
  
    if (users.length === 0) {
      throw new NotFoundException('Invalid token.');
    }
  
    const user = users[0];
  
    // Check if reset token has expired
    const currentTime = new Date();
    if (user.passwordResetExpiry && new Date(user.passwordResetExpiry) < currentTime) {
      throw new BadRequestException('Password reset token has expired.');
    }
  
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Update the user's password & clear the reset token and expiry
    await this.dbService.executeQuery(
      `UPDATE users SET password = ?, passwordResetToken = NULL, passwordResetExpiry = NULL WHERE userId = ?`,
      [hashedPassword, user.userId]
    );
  
    return { message: 'Password has been reset successfully.' };
  }
  
}
