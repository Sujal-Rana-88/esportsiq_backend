import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: AuthService) {}

  @Post('register')
  async register(@Body() body: { firstName: string; lastName: string; username: string; email: string; password: string }) {
    return this.userService.register(body.firstName, body.lastName, body.username, body.email, body.password);
  }

  @Post('login')
  @HttpCode(200) 
  async login(@Body() body: { email: string; password: string }) {
    return this.userService.validateUser(body.email, body.password);
  }
}
