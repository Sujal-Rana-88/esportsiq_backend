import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
@Injectable()
export class RegisterService {
  constructor(private readonly dbService: DatabaseService) {}

  async register(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    profilePictureUrl?: string // Make optional
  ) {
    if (!firstName || !lastName || !username || !email || !password) {
      throw new BadRequestException('All fields are required');
    }

    // Check if username or email already exists
    const existingUser = await this.dbService.executeQuery(
      `SELECT * FROM users WHERE username = ? OR email = ?`,
      [username, email]
    );

    if (existingUser.length > 0) {
      throw new BadRequestException('Username or Email already exists');
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
}
