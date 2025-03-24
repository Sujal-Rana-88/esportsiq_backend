import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class VerifyEmailService {
  constructor(private readonly dbService: DatabaseService) {}

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Token is required.');
    }


    const users = await this.dbService.executeQuery(
      `SELECT * FROM users WHERE verifyToken = ?`, 
      [token]
    );

    if (users.length === 0) {
      throw new NotFoundException('Invalid or expired token.');
    }

    const user = users[0];

    // Check if the verification token has expired
    const currentTime = new Date();
    if (user.verifyTokenExpiry && new Date(user.verifyTokenExpiry) < currentTime) {
      throw new BadRequestException('Verification token has expired.');
    }

    // Mark user as verified & clear the token
    await this.dbService.executeQuery(
      `UPDATE users SET isVerified = 1, verifyToken = NULL, verifyTokenExpiry = NULL WHERE userId = ?`,
      [user.userId]
    );

    return { message: 'Email successfully verified!', userId: user.userId, email: user.email };
  }
}
 