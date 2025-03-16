import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(private readonly dbService: DatabaseService) {}

  async register(firstName: string, lastName: string, username: string, email: string, password: string) {
    if (!firstName || !lastName || !username || !email || !password) {
      throw new BadRequestException('All fields are required');
    }

    const existingUser = await this.dbService.executeQuery(
      `SELECT * FROM users WHERE username = ? OR email = ?`,
      [username, email]
    );

    if (existingUser.length > 0) {
      throw new BadRequestException('Email or Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await this.dbService.executeQuery(
      `INSERT INTO users (userId, firstName, lastName, username, email, password) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, firstName, lastName, username, email, hashedPassword] 
    );

    return { userId, firstName, lastName, username, email };
  }

  async validateUser(email: string, password: string) {
    console.log(email);
    console.log(password);
    if (!email || !password) {
      throw new BadRequestException('Username/Email and Password are required');
    }

    const users = await this.dbService.executeQuery(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      throw new NotFoundException('User not found');
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email
    };
  }
}
