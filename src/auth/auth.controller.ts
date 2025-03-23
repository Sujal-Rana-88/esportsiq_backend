import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: AuthService) {}

  @Post('register')
  async register(@Body() body: { firstName: string; lastName: string; username: string; email: string; password: string, profilePictureUrl: string }) {
    console.log(body);
    return this.userService.register(body.firstName, body.lastName, body.username, body.email, body.password, body.profilePictureUrl);
  }

  @Post('login') 
  @HttpCode(200) 
  async login(@Body() body: { email: string; password: string }) {
    return this.userService.validateUser(body.email, body.password);
  }

  @Post('forgot-password') 
  @HttpCode(200) 
  async forgotPassword(@Body() body: { email: string}) {
    return this.userService.forgotPassword(body.email);
  }

  @Post('reset-password') 
  @HttpCode(200) 
  async verifyOTP(@Body() body: { password: string, token: string}) {
    return this.userService.resetPassword(body.password, body.token);
  }
}
