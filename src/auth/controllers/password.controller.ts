import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { PasswordService } from '../services/password.service';

@Controller('auth/')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() body: { email: string }) {
    return this.passwordService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() body: { password: string; token: string }) {
    return this.passwordService.resetPassword(body.password, body.token);
  }
}
