import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { EmailService } from './email.service';

@Injectable()
export class LoginService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and Password are required');
    }

    const users = await this.dbService.executeQuery(
      `SELECT * FROM users WHERE email = ?`,
      [email],
    );

    if (users.length === 0) {
      throw new NotFoundException('User not found');
    }

    const user = users[0];
    if (!user.isVerified) {
      const user = users[0];
      const verifyToken = crypto.randomBytes(32).toString('hex');

      // Set token expiry to **1 hour from now**
      const verifyTokenExpiry = new Date();
      verifyTokenExpiry.setHours(verifyTokenExpiry.getHours() + 1);

      await this.dbService.executeQuery(
        `UPDATE users SET verifyToken = ?, verifyTokenExpiry = ? WHERE userId = ?`,
        [verifyToken, verifyTokenExpiry, user.userId],
      );

      const verifyLink = `https://localhost:3000/verify-email?token=${verifyToken}`;
      await this.emailService.sendVerifyEmail(user.email, verifyLink);

      throw new ForbiddenException('Verification Link is sended to your email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const refreshToken = crypto.randomBytes(32).toString('hex');

    await this.dbService.executeQuery(
      `UPDATE users SET refreshToken = ? WHERE userId = ?`,
      [refreshToken, user.userId],
    );

    return {
      userId: user.userId,
      firstName: user.firstName,
      email: user.email,
      refreshToken,
    };
  }
}
